'use client';
import { useState, useEffect, useCallback } from 'react'

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
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const close = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
  }, [eventSource])

  useEffect(() => {
    const source = new EventSource(url)
    setEventSource(source)

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

    source.addEventListener(eventName, handleMessage)

    source.onerror = (event) => {
      setError(new Error('EventSource failed'))
      source.close()
    }

    return () => {
      source.removeEventListener(eventName, handleMessage)
      source.close()
    }
  }, [url, eventName])

  return { data, error, lastEventId, close }
}

