'use client'

import { useState } from 'react';
import { useSSE } from 'use-next-sse';

export default function SSEExample() {
  const [eventType, setEventType] = useState<'all' | 'even' | 'odd'>('all');

  const { data: allData, error: allError } = useSSE({ url: '/api/sse' });
  const { data: evenData, error: evenError } = useSSE({ url: '/api/sse', eventName: 'even' });
  const { data: oddData, error: oddError } = useSSE({ url: '/api/sse', eventName: 'odd' });

  const renderData = () => {
    switch (eventType) {
      case 'all':
        return <p>Current count: {allData?.count}</p>;
      case 'even':
        return <p>Even count: {evenData?.count}</p>;
      case 'odd':
        return <p>Odd count: {oddData?.count}</p>;
    }
  };

  const renderError = () => {
    const error = allError || evenError || oddError;
    return error ? (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    ) : null;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SSE Example</h1>
      <div className="space-x-2 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setEventType('all')}
        >
          All Events
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setEventType('even')}
        >
          Even Events
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setEventType('odd')}
        >
          Odd Events
        </button>
      </div>
      {renderData()}
      {renderError()}
    </div>
  );
}

