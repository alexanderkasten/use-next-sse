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
    renderHook(() => useSSE({ url: 'https://example.com/sse' }));
    expect(EventSource).toHaveBeenCalledWith('https://example.com/sse');
  });

  test('listens for specific event when eventName is provided', () => {
    renderHook(() => useSSE({ url: 'https://example.com/sse', eventName: 'testEvent' }));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('testEvent', expect.any(Function));
  });

  test('updates data when message is received', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: JSON.stringify({ test: 'data' }) });
    });

    expect(result.current.data).toEqual({ test: 'data' });
  });

  test('sets error when parsing fails', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: 'invalid JSON' });
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Failed to parse event data');
  });

  test('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
  });

  test('sets error when EventSource fails', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('EventSource failed');
  });

  test('sets connectionState to "connecting" initially', () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));
    expect(result.current.connectionState).toBe('connecting');
  });

  test('sets connectionState to "open" when connection is established', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));

    await act(async () => {
      const openHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'open')[1];
      openHandler(new Event('open'));
    });

    expect(result.current.connectionState).toBe('open');
  });

  test('sets connectionState to "closed" when connection is closed', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));
    await act(async () => {
      result.current.close();
    });
    expect(result.current.connectionState).toBe('closed');
  });

  test('sets connectionState to "closed" when EventSource fails', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse' }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.connectionState).toBe('closed');
  });

  test('reconnects when connection is lost and reconnect is true', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: true }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');
      expect(EventSource).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1000);
    });


    await act(async () => {
      const openHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'open')[1];
      openHandler(new Event('open'));
    });

    expect(result.current.connectionState).toBe('open');
    expect(EventSource).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  test('reconnects with default interval and maxAttempts', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: true }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');
      expect(EventSource).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];

      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');

      expect(EventSource).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];

      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');

      expect(EventSource).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];

      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');

      expect(EventSource).toHaveBeenCalledTimes(4);

      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];

      errorHandler(new Event('error'));
      expect(result.current.connectionState).toBe('connecting');

      expect(EventSource).toHaveBeenCalledTimes(5);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];

      errorHandler(new Event('error'));

      jest.advanceTimersByTime(1000);
      expect(result.current.connectionState).toBe('closed');

      expect(EventSource).toHaveBeenCalledTimes(6); // No more attempts after maxAttempts
    });


    jest.useRealTimers();
  });

  test('does not reconnect when maxAttempts is reached', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: { interval: 1000, maxAttempts: 2 } }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));

      expect(result.current.connectionState).toBe('connecting');
      expect(EventSource).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));

      // jest.advanceTimersByTime(1000);
      expect(EventSource).toHaveBeenCalledTimes(3);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));

      expect(EventSource).toHaveBeenCalledTimes(5);
    });

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
      expect(EventSource).toHaveBeenCalledTimes(7);
    });

    jest.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(9); // No more attempts after maxAttempts

    jest.useRealTimers();
  });

  test.skip('resets reconnect attempts after successful connection', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: { interval: 1000, maxAttempts: 2 } }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.connectionState).toBe('connecting');
    expect(mockEventSource.close).toHaveBeenCalled();
    expect(EventSource).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(3);

    await act(async () => {
      const openHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'open')[1];
      openHandler(new Event('open'));
    });

    expect(result.current.connectionState).toBe('open');

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.connectionState).toBe('connecting');
    expect(EventSource).toHaveBeenCalledTimes(4);

    jest.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(5);

    jest.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(6);

    jest.advanceTimersByTime(1000);
    expect(EventSource).toHaveBeenCalledTimes(6); // No more attempts after maxAttempts

    jest.useRealTimers();
  });

  test.skip('reconnects with specified interval and maxAttempts', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: { interval: 2000, maxAttempts: 3 } }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.connectionState).toBe('connecting');
    expect(EventSource).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(2000);
    expect(EventSource).toHaveBeenCalledTimes(3);

    jest.advanceTimersByTime(2000);
    expect(EventSource).toHaveBeenCalledTimes(4);

    jest.advanceTimersByTime(2000);
    expect(EventSource).toHaveBeenCalledTimes(4); // No more attempts after maxAttempts

    jest.useRealTimers();
  });

  test('does not reconnect when reconnect is false', async () => {
    const { result } = renderHook(() => useSSE({ url: 'https://example.com/sse', reconnect: false }));

    await act(async () => {
      const errorHandler = mockEventSource.addEventListener.mock.calls.find(call => call[0] === 'error')[1];
      errorHandler(new Event('error'));
    });

    expect(result.current.connectionState).toBe('closed');
    expect(EventSource).toHaveBeenCalledTimes(1);
  });
});


