import { NextResponse } from 'next/server';

export type SSEConfig = {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

type SSEConfigStrict = Required<SSEConfig>;

export class SSEConnection {
  private encoder: TextEncoder;
  private controller!: ReadableStreamDefaultController<any>;
  private initializePromise: Promise<void>;
  private resolveInitialize: (() => void) | null = null;
  private config: SSEConfigStrict;

  constructor(config: SSEConfig = {}) {
    this.encoder = new TextEncoder();
    this.initializePromise = new Promise((resolve) => {
      this.resolveInitialize = resolve;
    });
    this.config = {
      reconnectInterval: config.reconnectInterval || 1000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
    };
  }

  async initialize() {
    await this.initializePromise;
    console.log('SSE connection initialized');
  }

  send(data: any, event?: string) {
    if (!this.controller) {
      throw new Error('SSEConnection not initialized. Call initialize() first.');
    }
    console.log('Sending SSE message', data, event);
    const message = `data: ${JSON.stringify(data)}\n${event ? `event: ${event}\n` : ''}id: ${Date.now()}\n\n`;
    this.controller.enqueue(this.encoder.encode(message));
  }

  close() {
    console.log('Closing SSE connection called');
    if (!this.controller) {
      throw new Error('SSEConnection not initialized. Call initialize() first.');
    }
    this.controller.close();
  }

  getResponse() {
    const stream = new ReadableStream({
      start: (controller) => {
        console.log('SSE consnection started', this.controller);
        this.controller = controller;
        console.log('SSE connection controller', this.controller);
        if (this.resolveInitialize) {
          this.resolveInitialize();
          this.resolveInitialize = null;
        }
      },
      pull(controller) {
          console.log('SSE connection pull');
      },
      cancel() {
        console.log('SSE connection canceled');
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'retry': this.config.reconnectInterval.toString(),
      },
    });
  }
}

export function createSSEHandler(handler: (sse: SSEConnection) => Promise<void>, config?: SSEConfig) {
  return async () => {
    const sse = new SSEConnection(config);
    const response = sse.getResponse();

    await sse.initialize();

    handler(sse).catch((error) => {
      console.error('SSE Handler Error:', error);
      sse.close();
    });

    return response;
  };
}

