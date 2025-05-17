import type React from "react"
import CounterWithDisconnect from "../components/CounterWithDisconnect"

const AdvancedPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Advanced SSE Example</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          This example demonstrates a more complex setup with multiple event types and manual connection control. You
          can connect and disconnect from the SSE stream, and see different types of events.
        </p>
      </div>
      <CounterWithDisconnect />
    </div>
  )
}

export default AdvancedPage
