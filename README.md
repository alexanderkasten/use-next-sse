# use-next-sse
[![Node.js Package](https://github.com/alexanderkasten/use-next-sse/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/alexanderkasten/use-next-sse/actions/workflows/npm-publish.yml) [![Test](https://github.com/alexanderkasten/use-next-sse/actions/workflows/node.js.yml/badge.svg)](https://github.com/alexanderkasten/use-next-sse/actions/workflows/node.js.yml)


use-next-sse is a lightweight and easy-to-use React hook library for implementing Server-Sent Events (SSE) in Next.js applications, enabling real-time, unidirectional data streaming from server to client.

## Installation

```bash
npm install use-next-sse
```

## Quick Start

### Server-Side (Next.js API Route)

Create a new file `app/api/sse/route.ts` with the following content:

```typescript
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';
export const GET = createSSEHandler((send, close) => {
  let count = 0;
  const interval = setInterval(() => {
    send({ count: count++ }, 'counter');
    if (count > 10) {
      clearInterval(interval);
      close();
    }
  }, 1000);
});
```

### Client-Side (React Component)

Create a new file `app/components/Counter.tsx` with the following content:

```typescript
'use client'

import { useSSE } from 'use-next-sse';

export default function Counter() {
  const { data, error } = useSSE({url: '/api/sse', eventName: 'counter'});

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Count: {data.count}</div>;
}
```

### Usage in a Page

Use the `Counter` component in a page, for example in `app/page.tsx`:

```typescript
import Counter from './components/Counter';

export default function Home() {
  return (
    <main>
      <h1>SSE Counter Example</h1>
      <Counter />
    </main>
  );
}
```

This example demonstrates a simple counter that updates every second using Server-Sent Events. The server sends updates for 10 seconds before closing the connection.

## API Reference

### Client-Side API

#### `useSSE<T>(options: SSEOptions): SSEResult<T>`

A React hook to manage Server-Sent Events (SSE) connections in your Next.js application.

**Type Parameters:**
- `T` - The type of the data expected from the SSE connection. Defaults to `any`.

**Parameters:**

The hook accepts a single `options` object with the following properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | `string` | Yes | - | The URL endpoint to connect to for SSE. Must be a valid URL path. |
| `eventName` | `string` | No | `'message'` | The name of the event to listen for. Use custom event names to handle different event types from your SSE endpoint. |
| `reconnect` | `boolean \| { interval?: number, maxAttempts?: number }` | No | `false` | Controls automatic reconnection behavior. Can be a boolean or an object with `interval` (ms, default: 1000) and `maxAttempts` (default: 5). |
| `withCredentials` | `boolean` | No | `false` | Whether to include credentials (cookies, authorization headers) in the SSE request. |

**Returns:**

An `SSEResult<T>` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| null` | The latest data received from the SSE connection. Will be `null` until the first event is received. |
| `error` | `Error \| null` | Error object if an error occurred, otherwise `null`. |
| `lastEventId` | `string \| null` | The ID of the last event received from the server. Used for resuming connections. |
| `close` | `() => void` | Function to manually close the SSE connection and clean up resources. |
| `connectionState` | `'connecting' \| 'open' \| 'closed'` | The current state of the SSE connection. |

**Examples:**

```typescript
// Basic usage
const { data, error } = useSSE<{ message: string }>({ 
  url: '/api/sse' 
});

// With custom event name
const { data, error } = useSSE<{ count: number }>({ 
  url: '/api/sse',
  eventName: 'counter'
});

// With automatic reconnection
const { data, error, connectionState } = useSSE<{ message: string }>({ 
  url: '/api/sse',
  reconnect: true
});

// With custom reconnection settings
const { data, error, close } = useSSE<{ updates: any[] }>({ 
  url: '/api/sse',
  reconnect: { 
    interval: 5000,  // Wait 5 seconds between reconnection attempts
    maxAttempts: 10  // Try up to 10 times
  }
});

// With credentials (for authenticated endpoints)
const { data, error } = useSSE<{ privateData: string }>({ 
  url: '/api/private-sse',
  withCredentials: true
});

// Using connection state
const { data, connectionState } = useSSE({ url: '/api/sse' });

if (connectionState === 'connecting') {
  return <div>Connecting...</div>;
}
if (connectionState === 'closed') {
  return <div>Connection closed</div>;
}
```

#### `SSEOptions` Type

TypeScript interface for the options passed to `useSSE`.

```typescript
type SSEOptions = {
  url: string;
  eventName?: string;
  reconnect?: boolean | { 
    interval?: number; 
    maxAttempts?: number;
  };
  withCredentials?: boolean;
};
```

#### `SSEResult<T>` Type

TypeScript interface for the return value of `useSSE`.

```typescript
interface SSEResult<T> {
  data: T | null;
  error: Error | null;
  lastEventId: string | null;
  close: () => void;
  connectionState: 'connecting' | 'open' | 'closed';
}
```

### Server-Side API

#### `createSSEHandler(callback: SSECallback, options?: SSEOptions): NextHandler`

Creates a Next.js API route handler for Server-Sent Events.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `callback` | `SSECallback` | Yes | A function that handles the SSE connection. Receives `send`, `close`, and `context` parameters. |
| `options` | `{ onClose?: Destructor }` | No | Optional configuration object with an `onClose` cleanup function. |

**Callback Parameters:**

The `callback` function receives three parameters:

1. **`send(data: any, eventName?: string): void`**
   - Sends data to the client over the SSE connection
   - `data`: The data to send (will be JSON stringified)
   - `eventName` (optional): The event name for the client to listen to

2. **`close(): void`**
   - Closes the SSE connection and triggers cleanup functions

3. **`context: { lastEventId: string | null; onClose: (destructor: Destructor) => void }`**
   - `lastEventId`: The last event ID received by the client (for reconnections)
   - `onClose`: Function to register a cleanup handler that runs when the connection closes

**Returns:**

A Next.js request handler function that can be exported as `GET`, `POST`, etc.

**Response Headers:**

The handler automatically sets these response headers:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`

**Examples:**

```typescript
// Basic counter example
export const GET = createSSEHandler((send, close) => {
  let count = 0;
  const interval = setInterval(() => {
    send({ count: count++ }, 'counter');
    if (count >= 10) {
      clearInterval(interval);
      close();
    }
  }, 1000);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
});

// Example with async operations
export const GET = createSSEHandler((send, close) => {
  const fetchData = async () => {
    const data = await fetch('https://api.example.com/data');
    send(await data.json(), 'data');
  };
  
  // Don't await - let it run in background
  fetchData();
});

// Example with context and lastEventId (resuming connections)
export const GET = createSSEHandler((send, close, { lastEventId }) => {
  if (lastEventId) {
    console.log('Client reconnected from event:', lastEventId);
    // Resume from where client left off
  }
  
  // Send events...
});

// Example with context.onClose
export const GET = createSSEHandler(async (send, close, { onClose }) => {
  const db = await connectToDatabase();
  
  // Register cleanup early, even before long-running operations
  onClose(() => {
    db.disconnect();
  });
  
  // Long-running operation
  await setupLiveQuery(db, (data) => {
    send(data, 'update');
  });
});

// Example with global onClose option
export const GET = createSSEHandler(
  (send, close) => {
    // Your logic here
  },
  {
    onClose: () => {
      console.log('Connection closed');
      // This runs even if callback hasn't been called yet
    }
  }
);
```

**Important Notes:**

- **Avoid blocking operations**: Don't `await` long-running operations directly in the callback, as this delays sending the initial response to the client. Instead, wrap async operations in a function and call it without awaiting.
  
  ```typescript
  // ❌ Bad - blocks response
  export const GET = createSSEHandler(async (send, close) => {
    await someLongOperation(); // Client waits for this
    send({ data: 'hello' });
  });
  
  // ✅ Good - response sent immediately
  export const GET = createSSEHandler((send, close) => {
    const process = async () => {
      await someLongOperation();
      send({ data: 'hello' });
    };
    process(); // Don't await
  });
  ```

- **Cleanup priority**: If multiple cleanup functions are registered (via return value, `context.onClose`, and `options.onClose`), the first one registered takes precedence and a warning is logged for subsequent attempts.

- **Next.js configuration**: Always set `export const dynamic = 'force-dynamic';` in your route file to prevent Next.js from caching the SSE endpoint.

## Advanced Usage

### Destructor in `createSSEHandler`

When using the `createSSEHandler` function in the `use-next-sse` library, it is important to understand the role of the destructor. The destructor is a cleanup function that is called when the SSE connection is closed. This allows you to perform any necessary cleanup tasks, such as closing database connections, stopping intervals, or clearing resources.

#### Example Usage

```typescript
import { createSSEHandler } from 'use-next-sse';

const handler = createSSEHandler((send, close) => {
  // Your SSE logic here

  // Return a destructor function
  return () => {
    // Perform cleanup tasks here
    console.log('SSE connection closed, performing cleanup');
  };
});

export default handler;
```

#### Global Example

This Destructor will be called even though the handler callback is not called yet.

```typescript
import { createSSEHandler } from 'use-next-sse';

const handler = createSSEHandler(
  (send, close) => {
    // Your SSE logic here
  },
  {
    onClose: () => {
      console.log('SSE connection has been closed and cleaned up.');
      // Perform additional cleanup tasks here
    },
  }
);

export default handler;
```

#### Context Example

This Destructor will be called if the SSECallback call is not done yet.

```typescript
import { createSSEHandler } from 'use-next-sse';

const handler = createSSEHandler(async(send, close, { onClose }) => {
  // Your SSE logic here

  onClose(() => {
    console.log('SSE connection closed, performing cleanup.');
    // Perform additional cleanup tasks here
  });


  // long running task
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

export default handler;
```

## Common Use Cases

### Real-time Notifications

```typescript
// Server: app/api/notifications/route.ts
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler((send, close, { onClose }) => {
  const userId = // ... get from auth
  
  // Subscribe to notification service
  const subscription = notificationService.subscribe(userId, (notification) => {
    send(notification, 'notification');
  });
  
  onClose(() => {
    subscription.unsubscribe();
  });
});

// Client: components/NotificationBell.tsx
'use client';

import { useSSE } from 'use-next-sse';

export function NotificationBell() {
  const { data, error } = useSSE<Notification>({
    url: '/api/notifications',
    eventName: 'notification',
    reconnect: true
  });
  
  if (error) return <div>Error loading notifications</div>;
  
  return (
    <div className="notification-bell">
      {data && <span className="badge">{data.unreadCount}</span>}
    </div>
  );
}
```

### Live Data Dashboard

```typescript
// Server: app/api/metrics/route.ts
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler((send, close) => {
  const interval = setInterval(async () => {
    const metrics = await fetchMetrics();
    send(metrics, 'metrics');
  }, 5000);
  
  return () => clearInterval(interval);
});

// Client: components/Dashboard.tsx
'use client';

import { useSSE } from 'use-next-sse';

interface Metrics {
  activeUsers: number;
  requestsPerSecond: number;
  errorRate: number;
}

export function Dashboard() {
  const { data, connectionState } = useSSE<Metrics>({
    url: '/api/metrics',
    eventName: 'metrics',
    reconnect: { interval: 3000, maxAttempts: 10 }
  });
  
  return (
    <div>
      <div className={`status status-${connectionState}`}>
        {connectionState}
      </div>
      {data && (
        <div className="metrics">
          <MetricCard title="Active Users" value={data.activeUsers} />
          <MetricCard title="Requests/sec" value={data.requestsPerSecond} />
          <MetricCard title="Error Rate" value={`${data.errorRate}%`} />
        </div>
      )}
    </div>
  );
}
```

### Progress Tracking

```typescript
// Server: app/api/export/route.ts
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler(async (send, close) => {
  const exportData = async () => {
    const total = await getTotalRecords();
    let processed = 0;
    
    for await (const chunk of fetchDataInChunks()) {
      await processChunk(chunk);
      processed += chunk.length;
      
      send({ 
        progress: (processed / total) * 100,
        processed,
        total 
      }, 'progress');
    }
    
    send({ completed: true }, 'complete');
    close();
  };
  
  exportData();
});

// Client: components/ExportProgress.tsx
'use client';

import { useSSE } from 'use-next-sse';

interface ProgressData {
  progress: number;
  processed: number;
  total: number;
  completed?: boolean;
}

export function ExportProgress() {
  const { data, error } = useSSE<ProgressData>({
    url: '/api/export',
    eventName: 'progress'
  });
  
  if (error) return <div>Export failed: {error.message}</div>;
  if (!data) return <div>Starting export...</div>;
  if (data.completed) return <div>Export completed!</div>;
  
  return (
    <div>
      <ProgressBar value={data.progress} />
      <p>{data.processed} / {data.total} records processed</p>
    </div>
  );
}
```

### Chat Application

```typescript
// Server: app/api/chat/[roomId]/route.ts
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler((send, close, { lastEventId }) => {
  const roomId = // ... get from params
  
  // If reconnecting, send missed messages
  if (lastEventId) {
    const missedMessages = getMessagesSince(roomId, lastEventId);
    missedMessages.forEach(msg => send(msg, 'message'));
  }
  
  // Subscribe to new messages
  const unsubscribe = chatService.subscribe(roomId, (message) => {
    send(message, 'message');
  });
  
  return unsubscribe;
});

// Client: components/ChatRoom.tsx
'use client';

import { useSSE } from 'use-next-sse';
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { data, connectionState } = useSSE<Message>({
    url: `/api/chat/${roomId}`,
    eventName: 'message',
    reconnect: true
  });
  
  // Add new messages to the list
  useEffect(() => {
    if (data) {
      setMessages(prev => [...prev, data]);
    }
  }, [data]);
  
  return (
    <div className="chat-room">
      <div className="status">{connectionState}</div>
      <div className="messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
```

### Multiple Event Types

```typescript
// Server: app/api/events/route.ts
import { createSSEHandler } from 'use-next-sse';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler((send, close) => {
  // Send different event types
  const interval1 = setInterval(() => {
    send({ temperature: Math.random() * 30 }, 'temperature');
  }, 1000);
  
  const interval2 = setInterval(() => {
    send({ humidity: Math.random() * 100 }, 'humidity');
  }, 2000);
  
  const interval3 = setInterval(() => {
    send({ pressure: Math.random() * 1000 + 900 }, 'pressure');
  }, 3000);
  
  return () => {
    clearInterval(interval1);
    clearInterval(interval2);
    clearInterval(interval3);
  };
});

// Client: components/SensorMonitor.tsx
'use client';

import { useSSE } from 'use-next-sse';

export function SensorMonitor() {
  const temperature = useSSE<{ temperature: number }>({
    url: '/api/events',
    eventName: 'temperature'
  });
  
  const humidity = useSSE<{ humidity: number }>({
    url: '/api/events',
    eventName: 'humidity'
  });
  
  const pressure = useSSE<{ pressure: number }>({
    url: '/api/events',
    eventName: 'pressure'
  });
  
  return (
    <div className="sensors">
      <Sensor label="Temperature" value={temperature.data?.temperature} unit="°C" />
      <Sensor label="Humidity" value={humidity.data?.humidity} unit="%" />
      <Sensor label="Pressure" value={pressure.data?.pressure} unit="hPa" />
    </div>
  );
}
```

## Error Handling

```typescript
'use client';

import { useSSE } from 'use-next-sse';
import { useEffect } from 'react';

export function MyComponent() {
  const { data, error, connectionState, close } = useSSE({
    url: '/api/sse',
    reconnect: { interval: 2000, maxAttempts: 3 }
  });
  
  useEffect(() => {
    if (error) {
      console.error('SSE Error:', error);
      // Handle error - show notification, etc.
    }
  }, [error]);
  
  useEffect(() => {
    if (connectionState === 'closed' && !error) {
      // Connection closed gracefully
      console.log('Connection closed by server');
    }
  }, [connectionState, error]);
  
  // Manual cleanup on component unmount or user action
  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);
  
  if (error) {
    return (
      <div className="error">
        <p>Connection error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return <div>{/* Your component */}</div>;
}
```

## Browser Compatibility

This library uses the native `EventSource` API, which is supported in all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- IE: ❌ (No longer supported)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/alexanderkasten/use-next-sse/issues) on GitHub.
