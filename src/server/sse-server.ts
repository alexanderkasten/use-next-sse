import { NextRequest } from 'next/server'

type SSECallback = (
  send: (data: any) => void, 
  close: () => void
) => void | Promise<void> | (() => void)

export function createSSEHandler(callback: SSECallback) {
  return async function(request: NextRequest) {
    const encoder = new TextEncoder()
    let isClosed = false
    let cleanup: (() => void) | undefined

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
            if (typeof cleanup === 'function') {
              cleanup()
            }
          }
        }

        const result = callback(send, close)
        if (typeof result === 'function') {
          cleanup = result
        }

        request.signal.addEventListener('abort', () => {
          close()
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

