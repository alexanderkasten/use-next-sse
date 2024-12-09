import { renderHook, act } from '@testing-library/react';
import { useSSE } from '../lib/use-sse';

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
    renderHook(() => useSSE('http://test.com/sse'));
    expect(EventSource).toHaveBeenCalledWith('http://test.com/sse');
  });

  test('listens for specific event when eventName is provided', () => {
    renderHook(() => useSSE('http://test.com/sse', 'testEvent'));
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith('testEvent', expect.any(Function));
  });

  test('updates data when message is received', async () => {
    const { result } = renderHook(() => useSSE('http://test.com/sse'));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: JSON.stringify({ test: 'data' }) });
    });

    expect(result.current.data).toEqual({ test: 'data' });
  });

  test('sets error when parsing fails', async () => {
    const { result } = renderHook(() => useSSE('http://test.com/sse'));

    await act(async () => {
      const messageHandler = mockEventSource.addEventListener.mock.calls[0][1];
      messageHandler({ data: 'invalid JSON' });
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Failed to parse SSE data');
  });

  test('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE('http://test.com/sse'));
    unmount();
    expect(mockEventSource.close).toHaveBeenCalled();
  });
});

