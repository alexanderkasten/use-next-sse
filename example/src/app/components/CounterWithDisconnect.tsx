'use client';

import { useSSE } from 'use-next-sse';

import React, { useState } from 'react';

interface CounterData {
  count: number;
}

interface MilestoneData {
  message: string;
}

interface CloseData {
  message: string;
}

export default function SSEExample() {
  const [isConnected, setIsConnected] = useState(false);

  const counter = useSSE<CounterData>({
    url: '/api/sse',
    eventName: 'counter',
  });

  const milestone = useSSE<MilestoneData>({
    url: '/api/sse-second-route',
    eventName: 'milestone',
  });

  const closeMessage = useSSE<CloseData>({
    url: '/api/sse',
    eventName: 'close',
  });

  const handleConnect = () => {
    counter.connect();
    milestone.connect();
    closeMessage.connect();
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    counter.close();
    milestone.close();
    closeMessage.close();
    setIsConnected(false);
  };

  return (
    <div className="p-4" data-testid="test">
      <h1 className="text-4xl font-bold mb-4">SSE Example with useSSE Hook</h1>
      {!isConnected ? (
        <button
          onClick={handleConnect}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect to SSE
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Disconnect
        </button>
      )}
      {isConnected && (
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Counter</h2>
            <p className="text-lg">
              Latest count: <span className="font-bold">{counter.data?.count ?? 'Waiting for data...'}</span>
            </p>
            <p className="text-sm text-gray-600">Last Event ID: {counter.lastEventId}</p>
          </div>

          {milestone.data && (
            <div>
              <h2 className="text-2xl font-semibold">Milestone</h2>
              <p className="text-lg text-green-600" data-testid="milestone-message">
                {milestone.data.message}
              </p>
              <p className="text-sm text-gray-600">Last Event ID: {milestone.lastEventId}</p>
            </div>
          )}

          {closeMessage.data && (
            <div>
              <h2 className="text-2xl font-semibold">Close Message</h2>
              <p className="text-lg text-red-600" data-testid="close-message">
                {closeMessage.data.message}
              </p>
              <p className="text-sm text-gray-600">Last Event ID: {closeMessage.lastEventId}</p>
            </div>
          )}
        </div>
      )}
      {(counter.error || milestone.error || closeMessage.error) && (
        <p className="text-red-500 mt-4">
          Error: {counter.error?.message || milestone.error?.message || closeMessage.error?.message}
        </p>
      )}
    </div>
  );
}
