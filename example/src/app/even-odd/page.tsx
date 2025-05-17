import type React from "react"
import EvenOdd from "../components/EvenOdd"

const EvenOddPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Even-Odd SSE Example</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          This example demonstrates how to filter events by type. The server sends all numbers, but also categorizes
          them as even or odd events, which the client can listen to separately.
        </p>
      </div>
      <EvenOdd />
    </div>
  )
}

export default EvenOddPage
