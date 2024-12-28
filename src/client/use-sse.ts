'use client';
import { useState, useEffect, useCallback, useRef } from 'react'
import { sseManager } from './sse-manager';

/**
 * Options for the useSSE hook.
 * @property {string} url - The URL to connect to for SSE.
 * @property {string} [eventName='message'] - The name of the event to listen for.
 * @property {boolean | { interval?: number, maxAttempts?: number }} [reconnect] - Whether to automatically reconnect if the connection is lost. If an object, the interval and maxAttempts can be specified. Default `false`.
 * @property {number} [reconnect.interval] - The interval in milliseconds to wait before reconnecting. Default `1000`ms.
 * @property {number} [reconnect.maxAttempts] - The maximum number of reconnection attempts. Default `5`.
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse' });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', eventName: 'test' });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', reconnect: true });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', reconnect: { interval: 5000, maxAttempts: 10 } });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', eventName: 'test', reconnect: true });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', eventName: 'test', reconnect: { interval: 5000, maxAttempts: 10 } });
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse', reconnect: { interval: 5000, maxAttempts: 10 } });
 */
export type SSEOptions = {
  url: string
  eventName?: string
  /**
   * Whether to automatically reconnect if the connection is lost. If an object, the interval and maxAttempts can be specified. Default `false`.
   * @type {boolean | { interval?: number, maxAttempts?: number }}
   * @default false
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', reconnect: true });
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', reconnect: { interval: 5000, maxAttempts: 10 } });
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', reconnect: { interval: 5000, maxAttempts: 10 } });
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', eventName: 'test', reconnect: true });
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', eventName: 'test', reconnect: { interval: 5000, maxAttempts: 10 } });
   * @example
   * const { data, error, lastEventId, close } = useSSE({ url: 'https://example.com/sse', eventName: 'test', reconnect: true });
   */
  reconnect?: boolean | { interval?: number, maxAttempts?: number }
}

interface SSEResult<T> {
  data: T | null
  error: Error | null
  lastEventId: string | null
  close: () => void
  /**
    * The connection state of the SSE.
    * @type {'connecting' | 'open' | 'closed'}
    * @default 'connecting'
    * @example
    * const { connectionState } = useSSE({ url: '/api/sse' });
    * if (connectionState === 'open') {
    *  console.log('Connected to SSE');
    * }
    * if (connectionState === 'closed') {
    * console.log('Disconnected from SSE');
    * }
    * if (connectionState === 'connecting') {
    * console.log('Connecting to SSE');
    * }
    */
  connectionState: 'connecting' | 'open' | 'closed'
}

/**
 * Hook to manage Server-Sent Events (SSE) connections.
 *
 * @template T - The type of the data expected from the SSE.
 * @param {SSEOptions} options - The options for the SSE connection. {@link SSEOptions}
 * @param {string} options.url - The URL to connect to for SSE.
 * @param {string} [options.eventName='message'] - The name of the event to listen for.
 * @param {boolean | { interval?: number, maxAttempts?: number }} [options.reconnect] - Whether to automatically reconnect if the connection is lost. If an object, the interval and maxAttempts can be specified. Default `false`.
 * @param {number} [options.reconnect.interval] - The interval in milliseconds to wait before reconnecting. Default `1000`ms.
 * @param {number} [options.reconnect.maxAttempts] - The maximum number of reconnection attempts. Default `5`.
 * @returns {SSEResult<T>} The result of the SSE connection, including data, error, last event ID, and a close function. {@link SSEResult}
 *
 * @example
 * const { data, error, lastEventId, close } = useSSE<{ message: string }>({ url: 'https://example.com/sse' });
 *
 * useEffect(() => {
 *   if (data) {
 *     console.log(data.message);
 *   }
 * }, [data]);
 */
export function useSSE<T = any>({ url, eventName = 'message', reconnect = false }: SSEOptions): SSEResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed'>('connecting')
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

  const close = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    sseManager.releaseConnection(url)
    setConnectionState('closed')
  }, [url])

  useEffect(() => {
    const connect = () => {
      setConnectionState('connecting')
      const source = sseManager.getConnection(url)

      const handleOpen = () => {
        setConnectionState('open');
        reconnectAttempts.current = 0;
      }

      const handleMessage = (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data)
          setData(parsedData)
          setLastEventId(event.lastEventId)
          setError(null)
        } catch (err) {
          setError(new Error('Failed to parse event data'))
        }
      }

      const handleError = (event: Event) => {
        setConnectionState('closed');
        const maxAttempts = typeof reconnect === 'object' && reconnect.maxAttempts ? reconnect.maxAttempts : 5
        if (reconnect && reconnectAttempts.current < maxAttempts) {
          const interval = typeof reconnect === 'object' && reconnect.interval ? reconnect.interval : 1000
            reconnectAttempts.current += 1
            reconnectTimeout.current = setTimeout(() => {
              destructor();
              connect()
            }, interval)
        } else {
          destructor();
        }

        setError(new Error(`EventSource failed\n\nsource state:${source.readyState}\nCLOSED: ${source.CLOSED}\nCONNECTING: ${source.CONNECTING}\nOPEN: ${source.OPEN}`));
      }

      const destructor = () => {
        sseManager.removeEventListener(url, eventName, handleMessage)
        source.removeEventListener('open', handleOpen)
        source.removeEventListener('error', handleError)
        sseManager.releaseConnection(url)
      }

      sseManager.addEventListener(url, eventName, handleMessage)
      source.addEventListener('open', handleOpen)
      source.addEventListener('error', handleError)

      return destructor;
    }

    const cleanup = connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      cleanup();
    }
  }, [url, eventName, reconnect])

  return { data, error, lastEventId, close, connectionState }
}
