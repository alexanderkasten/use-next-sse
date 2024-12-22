'use client'

// import { useState, useEffect } from 'react'
import { useSSE } from 'use-next-sse';
// interface Message {
//   id: number;
//   data: any;
// }

// export default function SSEExample() {
//   const [count, setCount] = useState(0)
//   const [milestone, setMilestone] = useState<Message | null>(null)
//   const [closeMessage, setCloseMessage] = useState<Message | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [lastMessageId, setLastMessageId] = useState<number>(-1)

//   useEffect(() => {
//     let eventSource: EventSource | null = null

//     const setupEventSource = () => {
//       eventSource = new EventSource('/api/sse2')

//       eventSource.addEventListener('counter', (event: MessageEvent) => {
//         try {
//           const data = JSON.parse(event.data)
//           setCount(data.count)
//           setLastMessageId(Number(event.lastEventId))
//           setError(null)
//         } catch (err) {
//           console.error('Fehler beim Parsen der Zählerdaten:', err)
//           setError('Fehler beim Parsen der Zählerdaten')
//         }
//       })

//       eventSource.addEventListener('milestone', (event: MessageEvent) => {
//         try {
//           const data = JSON.parse(event.data)
//           setMilestone({ id: Number(event.lastEventId), data: data.message })
//         } catch (err) {
//           console.error('Fehler beim Parsen der Meilensteindaten:', err)
//         }
//       })

//       eventSource.addEventListener('close', (event: MessageEvent) => {
//         try {
//           const data = JSON.parse(event.data)
//           setCloseMessage({ id: Number(event.lastEventId), data: data.message })
//           eventSource?.close()
//         } catch (err) {
//           console.error('Fehler beim Parsen der Schließnachricht:', err)
//         }
//       })

//       eventSource.onerror = (error) => {
//         console.error('EventSource fehlgeschlagen:', error)
//         setError('Verbindungsfehler. Versuche erneut zu verbinden...')
        
//         eventSource?.close()
        
//         setTimeout(setupEventSource, 5000)
//       }
//     }

//     setupEventSource()

//     return () => {
//       if (eventSource) {
//         eventSource.close()
//       }
//     }
//   }, [])

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-4xl font-bold mb-4">SSE Beispiel mit benannten Events und IDs</h1>
//       <p className="text-2xl mb-4">Zähler: {count}</p>
//       <p className="text-xl mb-4">Letzte Nachrichten-ID: {lastMessageId}</p>
//       {milestone && (
//         <p className="text-xl mb-4 text-green-600">
//           Meilenstein (ID: {milestone.id}): {milestone.data}
//         </p>
//       )}
//       {closeMessage && (
//         <p className="text-xl mb-4 text-red-600">
//           Schließnachricht (ID: {closeMessage.id}): {closeMessage.data}
//         </p>
//       )}
//       {error && <p className="text-red-500">{error}</p>}
//     </div>
//   )
// }



import { useState } from 'react'
// import { useSSE } from '../hooks/useSSE'

interface CounterData {
  count: number
}

interface MilestoneData {
  message: string
}

interface CloseData {
  message: string
}

export default function SSEExample() {
  const [isConnected, setIsConnected] = useState(false)
  
  const counter = useSSE<CounterData>({
    url: '/api/sse2',
    eventName: 'counter'
  })

  const milestone = useSSE<MilestoneData>({
    url: '/api/sse2',
    eventName: 'milestone'
  })

  const closeMessage = useSSE<CloseData>({
    url: '/api/sse2',
    eventName: 'close'
  })

  const handleConnect = () => {
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    counter.close()
    milestone.close()
    closeMessage.close()
    setIsConnected(false)
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">SSE Example with useSSE Hook</h1>
      {!isConnected ? (
        <button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect to SSE
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect
        </button>
      )}
      {isConnected && (
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Counter</h2>
            <p className="text-lg">
              Latest count: <span className="font-bold">{counter.data?.count ?? 'Waiting for data...'}</span>
            </p>
            <p className="text-sm text-gray-600">Last Event ID: {counter.lastEventId}</p>
          </div>
          
          {milestone.data && (
            <div>
              <h2 className="text-2xl font-semibold">Milestone</h2>
              <p className="text-lg text-green-600">{milestone.data.message}</p>
              <p className="text-sm text-gray-600">Last Event ID: {milestone.lastEventId}</p>
            </div>
          )}
          
          {closeMessage.data && (
            <div>
              <h2 className="text-2xl font-semibold">Close Message</h2>
              <p className="text-lg text-red-600">{closeMessage.data.message}</p>
              <p className="text-sm text-gray-600">Last Event ID: {closeMessage.lastEventId}</p>
            </div>
          )}
        </div>
      )}
      {(counter.error || milestone.error || closeMessage.error) && (
        <p className="text-red-500 mt-4">
          Error: {counter.error?.message || milestone.error?.message || closeMessage.error?.message}
        </p>
      )}
    </div>
  )
}

