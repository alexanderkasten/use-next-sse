import { useState, useEffect, useRef } from 'react';

export interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Error) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSSE(url: string, eventName?: string, options: SSEOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const reconnectInterval = options.reconnectInterval || 1000;
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;

  useEffect(() => {
    let timeoutId: number;

    const messageHandler = (event: MessageEvent) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        options.onMessage?.(event);
        reconnectAttemptsRef.current = 0;
      } catch (err: any) {
        const parseError = new Error(`Failed to parse SSE data: ${err.message}`);
        setError(parseError);
        options.onError?.(parseError);
      }
    };

    const connect = () => {
      const eventSource = new EventSource(url);

      if (eventName) {
        eventSource.addEventListener(eventName, messageHandler);
      } else {
        eventSource.onmessage = messageHandler;
      }

      eventSource.onerror = (event: Event) => {
        const sseError = new Error('SSE connection error');
        setError(sseError);
        options.onError?.(sseError);
        eventSource.close();

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`);
          timeoutId = window.setTimeout(connect, reconnectInterval);
        } else {
          console.error('Max reconnect attempts reached. Giving up.');
        }
      };

      eventSourceRef.current = eventSource;
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        if (eventName) {
          eventSourceRef.current.removeEventListener(eventName, messageHandler);
        }
        eventSourceRef.current.close();
      }
      window.clearTimeout(timeoutId);
    };
  }, [url, eventName, options, reconnectInterval, maxReconnectAttempts]);

  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return { data, error, close };
}

