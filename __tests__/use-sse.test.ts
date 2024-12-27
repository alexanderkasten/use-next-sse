import { renderHook, act } from '@testing-library/react';
import { useSSE } from '../src/client/use-sse';

describe.only('useSSE', () => {
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
});

