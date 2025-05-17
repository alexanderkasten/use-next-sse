"use client"

import { useSSE } from "use-next-sse"
import { useState } from "react"
import ConnectionStatus from "./connection-status"
import { Activity, Award, AlertCircle } from "lucide-react"

interface CounterData {
  count: number
}

interface MilestoneData {
  message: string
}

interface CloseData {
  message: string
}

export default function SSEExample() {
  const [isConnected, setIsConnected] = useState(false)

  const counter = useSSE<CounterData>({
    url: "/api/sse",
    eventName: "counter",
  })

  const milestone = useSSE<MilestoneData>({
    url: "/api/sse-second-route",
    eventName: "milestone",
  })

  const closeMessage = useSSE<CloseData>({
    url: "/api/sse",
    eventName: "close",
  })

  const handleConnect = () => {
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    counter.close()
    milestone.close()
    closeMessage.close()
    setIsConnected(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">SSE Advanced Example</h1>
        {!isConnected ? (
          <button onClick={handleConnect} className="btn btn-primary">
            Connect to SSE
          </button>
        ) : (
          <button onClick={handleDisconnect} className="btn btn-danger">
            Disconnect
          </button>
        )}
      </div>

      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                <h2 className="font-semibold">Counter</h2>
              </div>
              <ConnectionStatus state={counter.connectionState} />
            </div>
            <div className="card-body">
              {counter.data ? (
                <div className="py-4 text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{counter.data.count}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last Event ID: {counter.lastEventId || "None"}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-600 dark:text-gray-400">Waiting for data...</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-green-600 dark:text-green-400" />
                <h2 className="font-semibold">Milestone</h2>
              </div>
              <ConnectionStatus state={milestone.connectionState} />
            </div>
            <div className="card-body">
              {milestone.data ? (
                <div className="py-4">
                  <div
                    className="bg-green-100 dark:bg-green-900/30 p-3 rounded-md text-green-800 dark:text-green-300"
                    data-testid="milestone-message"
                  >
                    {milestone.data.message}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Last Event ID: {milestone.lastEventId || "None"}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-600 dark:text-gray-400">Waiting for milestone...</div>
              )}
            </div>
          </div>

          {closeMessage.data && (
            <div className="card md:col-span-2">
              <div className="card-header flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
                  <h2 className="font-semibold">Close Message</h2>
                </div>
              </div>
              <div className="card-body">
                <div
                  className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-red-800 dark:text-red-300"
                  data-testid="close-message"
                >
                  {closeMessage.data.message}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Last Event ID: {closeMessage.lastEventId || "None"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {(counter.error || milestone.error || closeMessage.error) && (
        <div className="mt-6 bg-red-100 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
          <h3 className="font-medium">Error</h3>
          <p className="mt-2">{counter.error?.message || milestone.error?.message || closeMessage.error?.message}</p>
        </div>
      )}
    </div>
  )
}
