'use client';

import { useSSE } from 'use-next-sse';

import { useState } from 'react';

export default function SSEExample() {

  const { data: allData, error: allError } = useSSE({ url: '/api/even-odd' });
  const { data: evenData, error: evenError } = useSSE({ url: '/api/even-odd', eventName: 'even' });
  const { data: oddData, error: oddError } = useSSE({ url: '/api/even-odd', eventName: 'odd' });

  const renderError = () => {
    const error = allError || evenError || oddError;
    return error ? <div className="text-red-500">Error: {error.message}</div> : null;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SSE Example</h1>
      <p>Current count: {allData?.count}</p>
      <p>Even count: {evenData?.count}</p>
      <p>Odd count: {oddData?.count}</p>
      {renderError()}
    </div>
  );
}
