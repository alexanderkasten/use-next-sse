export const dynamic = 'force-dynamic'

// import { NextRequest, NextResponse } from 'next/server'

// export async function GET(request: NextRequest) {
//   const responseStream = new TransformStream()
//   const writer = responseStream.writable.getWriter()
//   const encoder = new TextEncoder()

//   let counter = 0

//   const sendEvent = async () => {
//     await writer.write(encoder.encode(`data: ${JSON.stringify({ count: counter })}\n\n`))
//     counter++

//     if (counter < 10) {
//       setTimeout(sendEvent, 1000) // Send an event every second
//     } else {
//       await writer.close()
//     }
//   }

//   sendEvent()

//   return new NextResponse(responseStream.readable, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive',
//     },
//   })
// }


// import { NextRequest } from 'next/server'

// export async function GET(request: NextRequest) {
//   const encoder = new TextEncoder()

//   const stream = new ReadableStream({
//     async start(controller) {
//       function sendEvent(data: string) {
//         controller.enqueue(encoder.encode(`data: ${data}\n\n`))
//       }

//       let counter = 0
//       const interval = setInterval(() => {
//         sendEvent(JSON.stringify({ count: counter++ }))
//       }, 1000)

//       // Keep the connection alive
//       request.signal.addEventListener('abort', () => {
//         clearInterval(interval)
//         controller.close()
//       })
//     }
//   })

//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache, no-transform',
//       'Connection': 'keep-alive',
//     },
//   })
// }

import { NextRequest } from 'next/server'

// import { createSSEHandler } from '@/app/utils/sseHandler'





type SSECallback = (send: (data: any) => void, close: () => void) => void | Promise<void> | (() => void);

export function createSSEHandler(callback: SSECallback) {
  return async function (request: NextRequest) {
    const encoder = new TextEncoder()
    let isClosed = false

    const stream = new ReadableStream({
      start(controller) {
        function send(data: any) {
          if (!isClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }
        }

        function close() {
          if (!isClosed) {
            isClosed = true
            controller.close()
          }
        }

        const cleanupFn = callback(send, close)

        request.signal.addEventListener('abort', () => {
          close();
          if (typeof cleanupFn === 'function') {
            cleanupFn()
          }
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  }
}



export const GET = createSSEHandler((send, close) => {
  let count = 0
  const interval = setInterval(() => {
    send({ count: count++ })

    // Beende die Verbindung nach 60 Sekunden (optional)
    if (count >= 60) {
      clearInterval(interval)
      close()
    }
  }, 1000)

  // Aufräumen, wenn die Verbindung geschlossen wird
  return () => clearInterval(interval)
})
