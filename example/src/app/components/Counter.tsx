'use client'

import { useSSE } from 'use-next-sse';

export default function Counter(props: {reconnect?: Parameters<typeof useSSE>[0]['reconnect']}) {
  const { data, error } = useSSE({url: '/api/sse', eventName: 'counter', reconnect: props.reconnect});

  if (error) {
    console.error('Error:', error);
  }

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;

  return <div>Count: {data.count}</div>;
}
