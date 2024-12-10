'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SSEConfig } from '../index';



export interface SSEOptions extends SSEConfig {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Error) => void;
}

export function useSSE(url: string, eventName?: string, options: SSEOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const clientIdRef = useRef<string | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 1000;

  const connect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('Max reconnect attempts reached. Giving up.');
      return;
    }

    if (eventSourceRef.current) {
      console.log('EventSource already exists. Skipping connection.');
      return;
    }

    let fullUrl = new URL(url, window.location.origin);
    if (clientIdRef.current) {
      fullUrl.searchParams.append('clientId', clientIdRef.current);
    }
    if (lastEventIdRef.current) {
      fullUrl.searchParams.append('lastEventId', lastEventIdRef.current);
    }

    const eventSource = new EventSource(fullUrl.toString());

    const messageHandler = (event: MessageEvent) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (event.type === 'init') {
          clientIdRef.current = parsedData.clientId;
          console.log('Received client ID:', clientIdRef.current);
        } else {
          setData(parsedData);
          options.onMessage?.(event);
        }
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful message
        lastEventIdRef.current = event.lastEventId;
      } catch (err: any) {
        const parseError = new Error(`Failed to parse SSE data: ${err.message}`);
        setError(parseError);
        options.onError?.(parseError);
      }
    };

    eventSource.addEventListener('init', messageHandler);
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
      eventSourceRef.current = null;

      reconnectAttemptsRef.current++;
      console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current} of ${maxReconnectAttempts}`);
      setTimeout(connect, reconnectInterval);
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    eventSourceRef.current = eventSource;
  }, [url, eventName, options, maxReconnectAttempts, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  const close = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent further reconnection attempts
  }, [maxReconnectAttempts]);

  return { data, error, close };
}
