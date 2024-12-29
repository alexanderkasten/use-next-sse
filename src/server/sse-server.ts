import type { NextRequest } from 'next/server';

/**
 * A function that sends data to the client.
 * @param data - The data to send to the client.
 * @param eventName (optional) - The name of the event.
 * @returns void
 * @example
 * send({ message: 'test' });
 * send({ message: 'test' }, 'testEvent');
 */
type SendFunction = (data: any, eventName?: string) => void;
/**
 * A function that cleans up resources when the connection is closed.
 * @returns void | Promise<void>
 * @example
 * return () => {
 *   console.log('Cleanup');
 * };
 */
type Destructor = (() => void) | Promise<() => void> | (() => Promise<void>);
/**
 * A function that handles the Server-Sent Events (SSE) connection.
 * @param send - A function to send data to the client.
 * @param close - A function to close the SSE connection.
 * @returns void | Promise<void> | (() => void)
 * The callback can return a cleanup function that will be called when the connection is closed.
 * **HINT:** See also {@link Destructor}, the createSSEHandler {@link SSEOptions} and {@link SSECallback} context `onClose`.
 */
type SSECallback = (
  send: SendFunction,
  /**
   * A function to close the SSE connection.
   * @returns void
   * @example
   * close();
   */
  close: () => void,
  /**
   * An object containing the last event ID received by the client. Not null if the client has been reconnected.
   * @property lastEventId - The last event ID from the client.
   * @property onClose - A function to set a cleanup function that will be called when the connection is closed. If the cleanup function is already set, a warning will be logged. The cleanup function set by the `onClose` function will be called even if the cleanup function returned by the callback is not called.
   * @example
   * { lastEventId: '12345' }
   */
  context: { lastEventId: string | null; onClose: (destructor: Destructor) => void },
) => void | Promise<void> | Destructor;

/**
 * An optional object to configure the Server-Sent Events (SSE) handler.
 * @property onClose - A function that will be called when the connection is closed even if the SSECallback has not been called yet.
 * @example
 * { onClose: () => console.log('SSE connection has been closed and cleaned up.') }
 */
type SSEOptions = { onClose?: Destructor };

/**
 * Creates a Server-Sent Events (SSE) handler for Next.js.
 *
 * @param callback - A function that handles the SSE connection. It takes two arguments: {@link SSECallback}
 *   - `send`: A function to send data to the client. See {@link SendFunction}.
 *   - `close`: A function to close the SSE connection.
 *   - `context`: An object containing the last event ID received by the client. Not null if the client has been reconnected.
 *   The callback can return a cleanup function that will be called when the connection is closed.
 *
 * **HINT:**
 * Be sure to **NOT** await long running operations in the callback, as this will block the response from being sent initially to the client. Instead wrap your long running operations in a async function to allow the response to be sent to the client first.
 *
 * @example
  ```
   export const GET = createSSEHandler((send, close) => {
      const asyncStuff = async () => {
        // async
      };

      asyncStuff();
   });
```
 *
 * @param options - An optional object to configure the handler. {@link SSEOptions}
 *  - `onClose`: A function that will be called when the connection is closed even if the SSECallback has not been called yet.
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
export function createSSEHandler(callback: SSECallback, options?: SSEOptions) {
  return async function (request: NextRequest) {
    const encoder = new TextEncoder();
    let isClosed = false;
    let cleanup: Destructor | undefined = options?.onClose;
    let cleanupSetBy = options?.onClose ? '`onClose` through createSSEHandler options' : '';
    let messageId = 0;
    let controller: ReadableStreamDefaultController | undefined;

    function onClose(destructor: Destructor) {
      if (cleanup != null) {
        if (!isClosed) {
          logAlreadySetWarning(cleanupSetBy);
        }
      } else {
        cleanup = destructor;
        cleanupSetBy = '`onClose` through SSECallback context';
      }
    }

    function close() {
      if (!isClosed) {
        isClosed = true;
        controller?.close();
        if (typeof cleanup === 'function') {
          cleanup();
        }
      }
    }

    request.signal.addEventListener('abort', () => {
      close();
    });

    const stream = new ReadableStream({
      async start(cntrl) {
        controller = cntrl;
        const send: SendFunction = (data: any, eventName?: string) => {
          if (!isClosed) {
            let message = `id: ${messageId}\n`;
            if (eventName) {
              message += `event: ${eventName}\n`;
            }
            message += `data: ${JSON.stringify(data)}\n\n`;
            cntrl.enqueue(encoder.encode(message));
            messageId++;
          }
        };

        const result = await callback(send, close, { lastEventId: request.headers.get('Last-Event-ID'), onClose });
        if (typeof result === 'function') {
          if (cleanup != null) {
            if (!isClosed) {
              logAlreadySetWarning(cleanupSetBy);
            }
          } else {
            cleanup = result;
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  };
}

let warningLogged = false;

function logAlreadySetWarning(cleanupSetBy: string) {
  if (!warningLogged) {
    console.warn(
      `[use-next-sse:createSSEHandler]:\tCleanup function already set by ${cleanupSetBy}. Ignoring new cleanup function.`,
    );
    warningLogged = true;
  }
}
