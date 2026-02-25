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

  describe('listener stacking on reconnect (#32)', () => {
    test('after a reconnect cycle, a message is delivered only once', () => {
      const url = 'https://example.com/reconnect';

      // Track native listeners like a real EventSource would
      const nativeListeners = new Map<string, Set<Function>>();
      mockEventSource.addEventListener.mockImplementation((name: string, fn: Function) => {
        if (!nativeListeners.has(name)) nativeListeners.set(name, new Set());
        nativeListeners.get(name)!.add(fn);
      });
      mockEventSource.removeEventListener.mockImplementation((name: string, fn: Function) => {
        nativeListeners.get(name)?.delete(fn);
      });

      const dispatch = (eventName: string, data: any) => {
        nativeListeners.get(eventName)?.forEach((fn) => fn(data));
      };

      // 1. Initial connection — this is what useSSE does on mount
      sseManager.getConnection(url);
      const handler1 = jest.fn();
      sseManager.addEventListener(url, 'message', handler1);

      // 2. Reconnect tears down the listener but NOT the connection
      //    (use-sse.ts:154-158 — removeEventListener without releaseConnection)
      sseManager.removeEventListener(url, 'message', handler1);

      // 3. Reconnect re-establishes — getConnection + addEventListener
      sseManager.getConnection(url);
      const handler2 = jest.fn();
      sseManager.addEventListener(url, 'message', handler2);

      // 4. A message arrives from the server
      dispatch('message', { data: '{"count":1}' });

      // handler2 should be called exactly once, not twice
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
