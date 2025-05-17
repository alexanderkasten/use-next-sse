import Link from "next/link"
import { Activity, BarChart2, Layers, RefreshCw } from "lucide-react"

export default function Home() {
  const examples = [
    {
      title: "Minimal Example",
      description: "A simple counter that updates every second using Server-Sent Events.",
      icon: <Activity size={24} className="text-blue-600 dark:text-blue-400" />,
      href: "/minimal",
    },
    {
      title: "Reconnect Example",
      description: "Demonstrates automatic reconnection when the SSE connection is lost.",
      icon: <RefreshCw size={24} className="text-green-600 dark:text-green-400" />,
      href: "/minimal-reconnect",
    },
    {
      title: "Even-Odd Example",
      description: "Shows how to filter events by type, displaying even and odd numbers separately.",
      icon: <BarChart2 size={24} className="text-purple-600 dark:text-purple-400" />,
      href: "/even-odd",
    },
    {
      title: "Advanced Example",
      description: "A more complex example with multiple event types and manual connection control.",
      icon: <Layers size={24} className="text-orange-600 dark:text-orange-400" />,
      href: "/advanced",
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Next.js Server-Sent Events</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore examples of Server-Sent Events (SSE) in Next.js applications, enabling real-time, unidirectional data
          streaming from server to client.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examples.map((example) => (
          <Link key={example.href} href={example.href} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {example.icon}
                <h2 className="text-xl font-semibold">{example.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{example.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-4">About Server-Sent Events</h2>
        <p className="mb-4">
          Server-Sent Events (SSE) is a standard that enables servers to push real-time updates to clients over HTTP.
          Unlike WebSockets, SSE is unidirectional (server to client only) and works over standard HTTP.
        </p>
        <p>
          This makes SSE ideal for scenarios where you need real-time updates from the server, such as notifications,
          live feeds, or monitoring dashboards.
        </p>
      </div>
    </div>
  )
}
