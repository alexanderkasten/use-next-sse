
'use client';
import { useState, useEffect, useCallback } from 'react'
import { sseManager } from './sse-manager';

export interface SSEOptions {
  url: string
  eventName?: string
}

interface SSEResult<T> {
  data: T | null
  error: Error | null
  lastEventId: string | null
  close: () => void
}

/**
 * Hook to manage Server-Sent Events (SSE) connections.
 *
 * @template T - The type of the data expected from the SSE.
 * @param {SSEOptions} options - The options for the SSE connection.
 * @param {string} options.url - The URL to connect to for SSE.
 * @param {string} [options.eventName='message'] - The name of the event to listen for.
 * @returns {SSEResult<T>} The result of the SSE connection, including data, error, last event ID, and a close function.
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
export function useSSE<T = any>({ url, eventName = 'message' }: SSEOptions): SSEResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  const close = useCallback(() => {
    sseManager.releaseConnection(url)
  }, [url])

  useEffect(() => {
    const source = sseManager.getConnection(url)

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

    sseManager.addEventListener(url, eventName, handleMessage)

    const handleError = (event: Event) => {
      setError(new Error('EventSource failed'))
    }

    source.addEventListener('error', handleError)

    return () => {
      sseManager.removeEventListener(url, eventName, handleMessage)
      source.removeEventListener('error', handleError)
      sseManager.releaseConnection(url)
    }
  }, [url, eventName])

  return { data, error, lastEventId, close }
}
