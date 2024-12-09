import { createSSEHandler, SSEConnection } from '../lib/sse-server';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('SSEConnection', () => {
  let sseConnection: SSEConnection;

  beforeEach(() => {
    sseConnection = new SSEConnection();
  });

  test('initialize resolves the promise', async () => {
    await expect(sseConnection.initialize()).resolves.toBeUndefined();
  });

  test('send throws error if not initialized', () => {
    expect(() => sseConnection.send({ test: 'data' })).toThrow('SSEConnection not initialized');
  });

  test('close throws error if not initialized', () => {
    expect(() => sseConnection.close()).toThrow('SSEConnection not initialized');
  });

  test('getResponse returns a NextResponse', () => {
    const response = sseConnection.getResponse();
    expect(response).toBeInstanceOf(NextResponse);
  });
});

describe('createSSEHandler', () => {
  test('returns a function', () => {
    const handler = createSSEHandler(async () => {});
    expect(typeof handler).toBe('function');
  });

  test('returned function calls the provided handler', async () => {
    const mockHandler = jest.fn();
    const handler = createSSEHandler(mockHandler);
    await handler();
    expect(mockHandler).toHaveBeenCalled();
  });
});

