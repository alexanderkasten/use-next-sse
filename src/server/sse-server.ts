import { NextResponse } from 'next/server';

export type SSEConfig = {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

type SSEConfigStrict = Required<SSEConfig>;


interface ClientInfo {
  id: string;
  lastEventId: number;
}

const clients = new Map<string, ClientInfo>();

export class SSEConnection {
  private encoder: TextEncoder;
  private controller: ReadableStreamDefaultController<any> | null = null;
  private stream: ReadableStream;
  private config: SSEConfig;
  private clientId: string;
  public eventId: number = 0;
  private isClosed = false;

  constructor(clientId?: string, lastEventId?: number, config: SSEConfig = {}) {
    this.encoder = new TextEncoder();
    this.config = {
      reconnectInterval: config.reconnectInterval || 1000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
    };
    
    if (clientId && clients.has(clientId)) {
      this.clientId = clientId;
      this.eventId = clients.get(clientId)!.lastEventId;
    } else {
      this.clientId = clientId || Math.random().toString(36).substring(2, 15);
      this.eventId = lastEventId || 0;
      clients.set(this.clientId, { id: this.clientId, lastEventId: this.eventId });
    }

    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
        
        // Send the client ID as the first message only for new clients
        if (!clientId || !clients.has(clientId)) {
          this.send({ clientId: this.clientId }, 'init');
        }
      },
      cancel: () => {
        this.isClosed = true;
        console.log('SSEConnection canceled');
        clients.delete(this.clientId);
      },
    });

    // this.stream.getReader().closed.then(() => {
    //   console.log('SSEConnection closed');
    //   this.isClosed = true;
    //   clients.delete(this.clientId);
    // });
  }

  send(data: any, event?: string) {
    if (!this.controller) {
      console.warn('Attempted to send on a closed SSEConnection');
      return;
    }
    this.eventId++;
    const message = `id: ${this.eventId}\ndata: ${JSON.stringify(data)}\n${event ? `event: ${event}\n` : ''}\n`;
    this.controller.enqueue(this.encoder.encode(message));
    clients.get(this.clientId)!.lastEventId = this.eventId;
  }

  close() {
    if (this.controller && !this.isClosed) {
      this.controller.close();
      this.controller = null;
      this.isClosed = true;
    }
    clients.delete(this.clientId);
  }

  getResponse() {
    return new NextResponse(this.stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  static getClientInfo(clientId: string): ClientInfo | undefined {
    return clients.get(clientId);
  }
}

export function createSSEHandler(handler: (sse: SSEConnection, lastEventId?: number) => Promise<void>, config?: SSEConfig) {
  return async (req: Request) => {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId');
    const lastEventId = url.searchParams.get('lastEventId');
    
    const sse = new SSEConnection(clientId || undefined, lastEventId ? parseInt(lastEventId, 10) : undefined, config);

    const response = sse.getResponse();
    
    handler(sse, sse.eventId ?? 0).catch((error) => {
      console.error('SSE Handler Error:', error);
      sse.close();
    });

    return response;
  };
}
