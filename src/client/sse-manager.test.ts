import { sseManager } from './sse-manager';

describe('SSEManager', () => {
  let mockEventSource: any;

  beforeEach(() => {
    mockEventSource = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    };

    (global as any).EventSource = jest.fn(() => mockEventSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEventListener / removeEventListener', () => {
    test('does not attach a second native handler after unsubscribe/resubscribe cycle', () => {
      const url = 'https://example.com/sse';
      const eventName = 'updates';
      const received: string[] = [];

      sseManager.getConnection(url);

      // First subscribe
      const listenerA = (e: MessageEvent) => received.push(`A:${e.data}`);
      sseManager.addEventListener(url, eventName, listenerA);
      expect(mockEventSource.addEventListener).toHaveBeenCalledTimes(1);

      // Unsubscribe – should remove the native handler too
      sseManager.removeEventListener(url, eventName, listenerA);
      expect(mockEventSource.removeEventListener).toHaveBeenCalledTimes(1);
      expect(mockEventSource.removeEventListener).toHaveBeenCalledWith(
        eventName,
        expect.any(Function),
      );

      // Second subscribe – must attach exactly one new native handler
      const listenerB = (e: MessageEvent) => received.push(`B:${e.data}`);
      sseManager.addEventListener(url, eventName, listenerB);
      expect(mockEventSource.addEventListener).toHaveBeenCalledTimes(2);

      // Simulate the native event with the forwarder captured in the second call
      const forwarder = mockEventSource.addEventListener.mock.calls[1][1] as (e: Event) => void;
      forwarder(new MessageEvent(eventName, { data: 'hello' }));

      // listenerB should receive exactly one message, not two
      expect(received).toEqual(['B:hello']);

      sseManager.releaseConnection(url);
    });
  });

  describe('releaseConnection', () => {
    test('decrements refCount and closes EventSource when refCount reaches 0', () => {
      const url = 'https://example.com/sse';
      sseManager.getConnection(url);
      sseManager.releaseConnection(url);

      expect(mockEventSource.close).toHaveBeenCalled();
      expect(sseManager['connections'].has(url)).toBe(false);
    });

    test('decrements refCount but does not close EventSource if refCount is greater than 0', () => {
      const url = 'https://example.com/sse';
      sseManager.getConnection(url);
      sseManager.getConnection(url);
      sseManager.releaseConnection(url);

      expect(mockEventSource.close).not.toHaveBeenCalled();
      expect(sseManager['connections'].get(url)?.refCount).toBe(1);
    });

    test('does nothing if connection does not exist', () => {
      const url = 'https://example.com/sse';
      sseManager.releaseConnection(url);

      expect(mockEventSource.close).not.toHaveBeenCalled();
      expect(sseManager['connections'].has(url)).toBe(false);
    });
  });
});
