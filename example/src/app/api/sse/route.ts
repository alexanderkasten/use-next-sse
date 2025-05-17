import { createSSEHandler } from "use-next-sse"

export const dynamic = "force-dynamic"

export const GET = createSSEHandler((send, close) => {
  let count = 0
  const interval = setInterval(() => {
    send({ count: count++ }, "counter")

    if (count % 5 === 0) {
      send({ message: `Milestone reached: ${count}` }, "milestone")
    }

    // End the connection after 20 seconds (optional)
    if (count >= 20) {
      clearInterval(interval)
      send({ message: "SSE-Connection closing" }, "close")
      close()
    }
  }, 1000)

  // Rückgabe der Aufräumfunktion
  return () => {
    clearInterval(interval)
    console.log("SSE connection has been closed and cleaned up.")
  }
})
