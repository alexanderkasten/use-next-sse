'use client';

import { useSSE } from 'use-next-sse';

export default function Counter(props: { reconnect?: Parameters<typeof useSSE>[0]['reconnect'] }) {
  const { data, error, connectionState } = useSSE({
    url: '/api/sse',
    eventName: 'counter',
    reconnect: props.reconnect,
  });

  if (error) {
    console.error('Error:', error);
  }

  if (error)
    return (
      <div>
        Error: <pre data-testid="error-message">{error.message}</pre>
        <p>Connection State: {connectionState}</p>
      </div>
    );

  if (!data)
    return (
      <div>
        <p>Loading...</p>
        <p>Connection State: {connectionState}</p>
      </div>
    );

  return (
    <div>
      <p>Count: {data.count}</p>
      <p>Connection State: {connectionState}</p>
    </div>
  );
}
