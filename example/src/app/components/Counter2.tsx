'use client'

import { useState, useEffect } from 'react'

export default function Counter2() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const eventSource = new EventSource('/api/sse2')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCount(data.count)
    }

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">SSE Example</h1>
      <p className="text-2xl">Count: {count}</p>
    </div>
  )
}

