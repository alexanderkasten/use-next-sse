type Listener = (event: MessageEvent) => void;

class SSEManager {
  private connections: Map<
    string,
    {
      source: EventSource;
      refCount: number;
      listeners: Map<string, { forwarder: (event: Event) => void; userListeners: Set<Listener> }>;
    }
  > = new Map();

  getConnection(url: string, init?: EventSourceInit): EventSource {
    let connection = this.connections.get(url);
    if (!connection) {
      const source = new EventSource(url, init);
      connection = { source, refCount: 0, listeners: new Map() };
      this.connections.set(url, connection);
    }
    connection.refCount++;
    return connection.source;
  }

  releaseConnection(url: string) {
    const connection = this.connections.get(url);
    if (connection) {
      connection.refCount--;
      if (connection.refCount === 0) {
        connection.source.close();
        this.connections.delete(url);
      }
    }
  }

  addEventListener(url: string, eventName: string, listener: Listener) {
    const connection = this.connections.get(url);
    if (connection) {
      if (!connection.listeners.has(eventName)) {
        const userListeners: Set<Listener> = new Set();
        const forwarder = (event: Event) => {
          userListeners.forEach((listener) => listener(event as MessageEvent));
        };
        connection.listeners.set(eventName, { forwarder, userListeners });
        connection.source.addEventListener(eventName, forwarder);
      }
      connection.listeners.get(eventName)!.userListeners.add(listener);
    }
  }

  removeEventListener(url: string, eventName: string, listener: Listener) {
    const connection = this.connections.get(url);
    if (connection) {
      const entry = connection.listeners.get(eventName);
      if (entry) {
        entry.userListeners.delete(listener);
        if (entry.userListeners.size === 0) {
          connection.source.removeEventListener(eventName, entry.forwarder);
          connection.listeners.delete(eventName);
        }
      }
    }
  }
}

export const sseManager = new SSEManager();
