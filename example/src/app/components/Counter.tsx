'use client'

import { useSSE } from 'use-next-sse';

export default function Counter() {
  const { data, error } = useSSE('/api/sse', 'counter');

  if (error) {
    console.error('Error:', error);
  }

  // if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Count: {data.count}</div>;
}
