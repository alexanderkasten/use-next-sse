import type React from "react"
import Counter from "../components/Counter"

const MinimalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Reconnect SSE Example</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          This example demonstrates how to automatically reconnect to a server-sent event stream after it has been
          closed. If the connection is lost, the client will attempt to reconnect up to 5 times with a 1-second
          interval.
        </p>
      </div>
      <Counter reconnect />
    </div>
  )
}

export default MinimalPage
