import { renderHook, act } from '@testing-library/react';
import { useSSE } from '../src/client/use-sse';

describe('useSSE', () => {
  let mockEventSource: any;

  beforeEach(() => {
    mockEventSource = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    };

    (global as any).EventSource = jest.fn(() => mockEventSource);
  });

  test('initializes EventSource with the provided URL', () => {
    renderHook(() => useSSE({url: 'https://example.com/sse'}));
    expect(EventSource).toHaveBeenCalledWith('https://example.com/sse');
  });

  test('listens for specific event when eventName is provided', () => {
    renderHook(() => useSSE({url: 'https://example.com/sse', eventName: 'testEvent'}));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('testEvent', expect.any(Function));
  });

  test('updates data when message is received', async () => {
    const { result } = renderHook(() => useSSE({url: 'https://example.com/sse'}));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: JSON.stringify({ test: 'data' }) });
    });

    expect(result.current.data).toEqual({ test: 'data' });
  });

  test('sets error when parsing fails', async () => {
    const { result } = renderHook(() => useSSE({url: 'https://example.com/sse'}));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: 'invalid JSON' });
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Failed to parse event data');
  });

  test('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE({url: 'https://example.com/sse'}));
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
  });
});

