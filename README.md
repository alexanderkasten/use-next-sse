# use-next-sse
[![Node.js Package](https://github.com/alexanderkasten/use-next-sse/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/alexanderkasten/use-next-sse/actions/workflows/npm-publish.yml)


use-next-sse is a lightweight and easy-to-use React hook library for implementing Server-Sent Events (SSE) in Next.js applications, enabling real-time, unidirectional data streaming from server to client.

## Installation

\`\`\`bash
npm install use-next-sse
\`\`\`

## Quick Start

### Server-Side (Next.js API Route)

Create a new file `app/api/sse/route.ts` with the following content:

\`\`\`typescript
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
\`\`\`

### Client-Side (React Component)

Create a new file `app/components/Counter.tsx` with the following content:

\`\`\`typescript
'use client'

import { useSSE } from 'use-next-sse';

export default function Counter() {
  const { data, error } = useSSE({url: '/api/sse', eventName: 'counter'});

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Count: {data.count}</div>;
}
\`\`\`

### Usage in a Page

Use the `Counter` component in a page, for example in `app/page.tsx`:

\`\`\`typescript
import Counter from './components/Counter';

export default function Home() {
  return (
    <main>
      <h1>SSE Counter Example</h1>
      <Counter />
    </main>
  );
}
\`\`\`

This example demonstrates a simple counter that updates every second using Server-Sent Events. The server sends updates for 10 seconds before closing the connection.

### Destructor in `createSSEHandler`

When using the `createSSEHandler` function in the `use-next-sse` library, it is important to understand the role of the destructor. The destructor is a cleanup function that is called when the SSE connection is closed. This allows you to perform any necessary cleanup tasks, such as closing database connections, stopping intervals, or clearing resources.

#### Example Usage

\`\`\`typescript
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
\`\`\`

#### Global Example

This Destructor will be called even though the handler callback is not called yet.

\`\`\`typescript
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
\`\`\`

#### Context Example

This Destructor will be called if the SSECallback call is not done yet.

\`\`\`typescript
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
\`\`\`
