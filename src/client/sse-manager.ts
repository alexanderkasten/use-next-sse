type Listener = (event: MessageEvent) => void;

type ListenerEntry = {
  forwarder: EventListener;
  userListeners: Set<Listener>;
};

class SSEManager {
  private connections: Map<string, { source: EventSource; refCount: number; listeners: Map<string, ListenerEntry> }> =
    new Map();

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
      let entry = connection.listeners.get(eventName);
      if (!entry) {
        const forwarder: EventListener = (event) => {
          const entry = connection.listeners.get(eventName);
          entry?.userListeners.forEach((listener) => listener(event as MessageEvent));
        };
        entry = { forwarder, userListeners: new Set() };
        connection.listeners.set(eventName, entry);
        connection.source.addEventListener(eventName, forwarder);
      }
      entry.userListeners.add(listener);
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
