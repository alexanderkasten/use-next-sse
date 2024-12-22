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
