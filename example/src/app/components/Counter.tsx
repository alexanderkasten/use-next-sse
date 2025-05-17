"use client"

import { useSSE } from "use-next-sse"
import ConnectionStatus from "./connection-status"

export default function Counter(props: { reconnect?: Parameters<typeof useSSE>[0]["reconnect"] }) {
  const { data, error, connectionState } = useSSE({
    url: "/api/sse",
    eventName: "counter",
    reconnect: props.reconnect,
  })

  if (error) {
    console.error("Error:", error)
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-header flex justify-between items-center">
        <h2 className="text-xl font-semibold">Counter</h2>
        <ConnectionStatus state={connectionState} />
      </div>
      <div className="card-body">
        {error ? (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
            <h3 className="font-medium">Error</h3>
            <pre className="mt-2 text-sm overflow-auto p-2 bg-red-50 dark:bg-red-900/50 rounded border border-red-200 dark:border-red-800">
              {error.message}
            </pre>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{data.count}</div>
            <p className="text-gray-600 dark:text-gray-400">Current count value</p>
          </div>
        )}
      </div>
    </div>
  )
}
