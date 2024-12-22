'use client'

import { useState, useEffect } from 'react'

export default function SSEExample() {
  const [count, setCount] = useState(0)
  const [milestone, setMilestone] = useState<string | null>(null)
  const [closeMessage, setCloseMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let eventSource: EventSource | null = null

    const setupEventSource = () => {
      eventSource = new EventSource('/api/sse2')

      eventSource.addEventListener('counter', (event) => {
        try {
          const data = JSON.parse(event.data)
          setCount(data.count)
          setError(null)
        } catch (err) {
          console.error('Fehler beim Parsen der Zählerdaten:', err)
          setError('Fehler beim Parsen der Zählerdaten')
        }
      })

      eventSource.addEventListener('milestone', (event) => {
        try {
          const data = JSON.parse(event.data)
          setMilestone(data.message)
        } catch (err) {
          console.error('Fehler beim Parsen der Meilensteindaten:', err)
        }
      })

      eventSource.addEventListener('close', (event) => {
        try {
          const data = JSON.parse(event.data)
          setCloseMessage(data.message)
          eventSource?.close()
        } catch (err) {
          console.error('Fehler beim Parsen der Schließnachricht:', err)
        }
      })

      eventSource.onerror = (error) => {
        console.error('EventSource fehlgeschlagen:', error)
        setError('Verbindungsfehler. Versuche erneut zu verbinden...')

        eventSource?.close()

        setTimeout(setupEventSource, 5000)
      }
    }

    setupEventSource()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">SSE Beispiel mit benannten Events</h1>
      <p className="text-2xl mb-4">Zähler: {count}</p>
      {milestone && <p className="text-xl mb-4 text-green-600">{milestone}</p>}
      {closeMessage && <p className="text-xl mb-4 text-red-600">{closeMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

