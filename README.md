# use-next-sse

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

export const GET = createSSEHandler(async (sse) => {
  let count = 0;
  const interval = setInterval(() => {
    sse.send({ count: count++ }, 'counter');
    if (count > 10) {
      clearInterval(interval);
      sse.close();
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
  const { data, error } = useSSE('/api/sse', 'counter');

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
