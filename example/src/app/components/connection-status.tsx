import { Circle } from "lucide-react"

type ConnectionState = "connecting" | "open" | "closed"

interface ConnectionStatusProps {
  state: ConnectionState
}

export default function ConnectionStatus({ state }: ConnectionStatusProps) {
  const getStatusConfig = (state: ConnectionState) => {
    switch (state) {
      case "connecting":
        return {
          label: "Connecting",
          className: "connection-indicator connection-connecting",
          icon: <Circle className="animate-pulse" size={12} />,
        }
      case "open":
        return {
          label: "Connected",
          className: "connection-indicator connection-open",
          icon: <Circle size={12} />,
        }
      case "closed":
        return {
          label: "Disconnected",
          className: "connection-indicator connection-closed",
          icon: <Circle size={12} />,
        }
    }
  }

  const { label, className, icon } = getStatusConfig(state)

  return (
    <div className={className}>
      {icon}
      <span>{label}</span>
    </div>
  )
}
