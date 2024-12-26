import { createSSEHandler } from 'use-next-sse';
export const dynamic = 'force-dynamic';


export const GET = createSSEHandler((send, close) => {
  let count = 0
  const interval = setInterval(() => {
    send({ count: count++ }, 'counter')

    if (count % 5 === 0) {
      send({ message: `Meilenstein erreicht: ${count}` }, 'milestone')
    }

    // Beende die Verbindung nach 60 Sekunden (optional)
    if (count >= 60) {
      clearInterval(interval)
      send({ message: 'SSE-Verbindung wird geschlossen' }, 'close')
      close()
    }
  }, 1000)

  // Rückgabe der Aufräumfunktion
  return () => {
    clearInterval(interval)
    console.log('SSE connection has been closed and cleaned up.')
  }
})

