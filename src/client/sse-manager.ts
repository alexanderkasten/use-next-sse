type Listener = (event: MessageEvent) => void

class SSEManager {
  private connections: Map<string, { source: EventSource; refCount: number; listeners: Map<string, Set<Listener>> }> =
    new Map()

  getConnection(url: string, init?: EventSourceInit): EventSource {
    let connection = this.connections.get(url)
    if (!connection) {
      const source = new EventSource(url, init)
      connection = { source, refCount: 0, listeners: new Map() }
      this.connections.set(url, connection)
    }
    connection.refCount++
    return connection.source
  }

  releaseConnection(url: string) {
    const connection = this.connections.get(url)
    if (connection) {
      connection.refCount--
      if (connection.refCount === 0) {
        connection.source.close()
        this.connections.delete(url)
      }
    }
  }

  addEventListener(url: string, eventName: string, listener: Listener) {
    const connection = this.connections.get(url)
    if (connection) {
      if (!connection.listeners.has(eventName)) {
        connection.listeners.set(eventName, new Set())
        connection.source.addEventListener(eventName, (event) => {
          const listeners = connection.listeners.get(eventName)
          listeners?.forEach((listener) => listener(event))
        })
      }
      connection.listeners.get(eventName)!.add(listener)
    }
  }

  removeEventListener(url: string, eventName: string, listener: Listener) {
    const connection = this.connections.get(url)
    if (connection) {
      const listeners = connection.listeners.get(eventName)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          connection.listeners.delete(eventName)
        }
      }
    }
  }
}

export const sseManager = new SSEManager()
