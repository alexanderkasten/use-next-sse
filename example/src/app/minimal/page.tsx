import type React from "react"
import Counter from "../components/Counter"

const MinimalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Minimal SSE Example</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          This example demonstrates a simple counter that updates every second using Server-Sent Events. The server
          sends updates for 20 seconds before closing the connection.
        </p>
      </div>
      <Counter />
    </div>
  )
}

export default MinimalPage
