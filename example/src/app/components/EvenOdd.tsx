"use client"

import { useSSE } from "use-next-sse"
import ConnectionStatus from "@/components/connection-status"

export default function SSEExample() {
  const { data: allData, error: allError, connectionState: allConnectionState } = useSSE({ url: "/api/even-odd" })
  const {
    data: evenData,
    error: evenError,
    connectionState: evenConnectionState,
  } = useSSE({ url: "/api/even-odd", eventName: "even" })
  const {
    data: oddData,
    error: oddError,
    connectionState: oddConnectionState,
  } = useSSE({ url: "/api/even-odd", eventName: "odd" })

  const renderError = () => {
    const error = allError || evenError || oddError
    return error ? (
      <div className="mt-6 bg-red-100 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
        <h3 className="font-medium">Error</h3>
        <p className="mt-2">{error.message}</p>
      </div>
    ) : null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Even-Odd SSE Example</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">All Events</h2>
            <ConnectionStatus state={allConnectionState} />
          </div>
          <div className="card-body">
            {allData ? (
              <div className="py-4 text-center">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">{allData.count}</div>
                <p className="text-gray-600 dark:text-gray-400">Current count</p>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-600 dark:text-gray-400">Waiting for data...</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">Even Events</h2>
            <ConnectionStatus state={evenConnectionState} />
          </div>
          <div className="card-body">
            {evenData ? (
              <div className="py-4 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{evenData.count}</div>
                <p className="text-gray-600 dark:text-gray-400">Even count</p>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-600 dark:text-gray-400">Waiting for even numbers...</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h2 className="font-semibold">Odd Events</h2>
            <ConnectionStatus state={oddConnectionState} />
          </div>
          <div className="card-body">
            {oddData ? (
              <div className="py-4 text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{oddData.count}</div>
                <p className="text-gray-600 dark:text-gray-400">Odd count</p>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-600 dark:text-gray-400">Waiting for odd numbers...</div>
            )}
          </div>
        </div>
      </div>

      {renderError()}
    </div>
  )
}
