'use client'

import { useState, useEffect } from 'react'

interface Message {
  id: number;
  data: any;
}

export default function SSEExample() {
  const [count, setCount] = useState(0)
  const [milestone, setMilestone] = useState<Message | null>(null)
  const [closeMessage, setCloseMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastMessageId, setLastMessageId] = useState<number>(-1)

  useEffect(() => {
    let eventSource: EventSource | null = null

    const setupEventSource = () => {
      eventSource = new EventSource('/api/sse2')

      eventSource.addEventListener('counter', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          setCount(data.count)
          setLastMessageId(Number(event.lastEventId))
          setError(null)
        } catch (err) {
          console.error('Fehler beim Parsen der Zählerdaten:', err)
          setError('Fehler beim Parsen der Zählerdaten')
        }
      })

      eventSource.addEventListener('milestone', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          setMilestone({ id: Number(event.lastEventId), data: data.message })
        } catch (err) {
          console.error('Fehler beim Parsen der Meilensteindaten:', err)
        }
      })

      eventSource.addEventListener('close', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          setCloseMessage({ id: Number(event.lastEventId), data: data.message })
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
      <h1 className="text-4xl font-bold mb-4">SSE Beispiel mit benannten Events und IDs</h1>
      <p className="text-2xl mb-4">Zähler: {count}</p>
      <p className="text-xl mb-4">Letzte Nachrichten-ID: {lastMessageId}</p>
      {milestone && (
        <p className="text-xl mb-4 text-green-600">
          Meilenstein (ID: {milestone.id}): {milestone.data}
        </p>
      )}
      {closeMessage && (
        <p className="text-xl mb-4 text-red-600">
          Schließnachricht (ID: {closeMessage.id}): {closeMessage.data}
        </p>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

