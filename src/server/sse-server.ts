import { NextRequest } from 'next/server'

type SendFunction = (data: any, eventName?: string) => void

type SSECallback = (
  send: SendFunction, 
  close: () => void
) => void | Promise<void> | (() => void)

export function createSSEHandler(callback: SSECallback) {
  return async function(request: NextRequest) {
    const encoder = new TextEncoder()
    let isClosed = false
    let cleanup: (() => void) | undefined
    let messageId = 0

    const stream = new ReadableStream({
      start(controller) {
        const send: SendFunction = (data: any, eventName?: string) => {
          if (!isClosed) {
            let message = `id: ${messageId}\n`
            if (eventName) {
              message += `event: ${eventName}\n`
            }
            message += `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
            messageId++
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

