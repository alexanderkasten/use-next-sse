
import { NextRequest } from 'next/server'

/**
 * A function that sends data to the client.
 * @param data - The data to send to the client.
 * @param eventName (optional) - The name of the event.
 * @returns void
 * @example
 * send({ message: 'test' });
 * send({ message: 'test' }, 'testEvent');
 */
type SendFunction = (data: any, eventName?: string) => void

/**
 * A function that handles the Server-Sent Events (SSE) connection.
 * @param send - A function to send data to the client.
 * @param close - A function to close the SSE connection.
 * @returns void | Promise<void> | (() => void)
 * The callback can return a cleanup function that will be called when the connection is closed.
 */
type SSECallback = (
  send: SendFunction,
  /**
   * A function to close the SSE connection.
   * @returns void
   * @example
   * close();
   */
  close: () => void
) => void | Promise<void> | (() => void)

/**
 * Creates a Server-Sent Events (SSE) handler for Next.js.
 *
 * @param callback - A function that handles the SSE connection. It takes two arguments: {@link SSECallback}
 *   - `send`: A function to send data to the client. See {@link SendFunction}.
 *   - `close`: A function to close the SSE connection.
 *   The callback can return a cleanup function that will be called when the connection is closed.
 *
 * @returns A function that handles the SSE request. This function takes a `NextRequest` object as an argument.
 *
 * The returned function creates a `ReadableStream` to handle the SSE connection. It sets up the `send` and `close` functions,
 * and listens for the `abort` event on the request signal to close the connection.
 *
 * The response is returned with the appropriate headers for SSE:
 * - `Content-Type`: `text/event-stream`
 * - `Cache-Control`: `no-cache, no-transform`
 * - `Connection`: `keep-alive`
 */
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

