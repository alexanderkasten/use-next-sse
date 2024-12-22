import { NextResponse } from 'next/server';

export type SSEConfig = {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

type SSEConfigStrict = Required<SSEConfig>;


interface ClientInfo {
  connection: SSEConnection;
  lastEventId: number;
}

const clients = new Map<string, ClientInfo>();

export class SSEConnection {
  private encoder: TextEncoder;
  private controller: ReadableStreamDefaultController<any> | null = null;
  private stream: ReadableStream;
  private config: SSEConfig;
  public clientId: string;
  private eventId: number = 0;

  constructor(clientId: string, config: SSEConfig = {}) {
    this.encoder = new TextEncoder();
    this.config = {
      reconnectInterval: config.reconnectInterval || 1000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
    };
    this.clientId = clientId;

    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        clients.delete(this.clientId);
      },
    });
  }

  send(data: any, event?: string) {
    if (!this.controller) {
      console.warn('Attempted to send on a closed SSEConnection');
      return;
    }
    this.eventId++;
    const message = `id: ${this.eventId}\ndata: ${JSON.stringify(data)}\n${event ? `event: ${event}\n` : ''}\n`;
    this.controller.enqueue(this.encoder.encode(message));
    if (clients.has(this.clientId)) {
      clients.get(this.clientId)!.lastEventId = this.eventId;
    }
  }

  close() {
    if (this.controller) {
      this.controller.close();
      this.controller = null;
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
}

export function createSSEHandler(handler: (sse: SSEConnection, lastEventId?: number) => Promise<void>, config?: SSEConfig) {
  return async (req: Request) => {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId') || Math.random().toString(36).substring(2, 15);
    const lastEventId = url.searchParams.get('lastEventId');

    let sse: SSEConnection;
    if (clients.has(clientId)) {
      sse = clients.get(clientId)!.connection;
    } else {
      sse = new SSEConnection(clientId, config);
      clients.set(clientId, { connection: sse, lastEventId: 0 });
      // Send initial client ID for new connections
      sse.send({ clientId }, 'init');
    }

    const response = sse.getResponse();
    
    handler(sse, lastEventId ? parseInt(lastEventId, 10) : undefined).catch((error) => {
      console.error('SSE Handler Error:', error);
      sse.close();
    });

    console.log('return response stream')
    return response;
  };
}
