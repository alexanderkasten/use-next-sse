import type { NextRequest } from "next/server"

import { createSSEHandler } from "./sse-server"

describe("createSSEHandler", () => {
  let mockRequest: NextRequest
  let mockController: any
  let mockSignal: any

  beforeEach(() => {
    mockSignal = {
      addEventListener: jest.fn(),
    }

    mockRequest = {
      headers: new Headers(),
      signal: mockSignal,
    } as unknown as NextRequest

    mockController = {
      enqueue: jest.fn(),
      close: jest.fn(),
    }
  })

  test("sends data to the client", async () => {
    const handler = createSSEHandler((send) => {
      send({ message: "test" })
    })

    const response = await handler(mockRequest)
    const reader = response.body?.getReader()
    const { value } = await reader?.read()!

    expect(new TextDecoder().decode(value)).toContain('data: {"message":"test"}')
  })

  test("sends data with event name to the client", async () => {
    const handler = createSSEHandler((send) => {
      send({ message: "test" }, "testEvent")
    })

    const response = await handler(mockRequest)
    const reader = response.body?.getReader()
    const { value } = await reader?.read()!

    expect(new TextDecoder().decode(value)).toContain("event: testEvent")
    expect(new TextDecoder().decode(value)).toContain('data: {"message":"test"}')
  })

  test.skip("closes the connection on abort", async () => {
    const handler = createSSEHandler((send, close) => {
      close()
      mockSignal.addEventListener.mockImplementationOnce((event, callback) => {
        close()
        if (event === "abort") {
          callback()
        }
      })
    })

    const response = await handler(mockRequest)
    const reader = response.body?.getReader()
    await reader?.read()

    expect(mockController.close).toHaveBeenCalled()
  })

  test("calls cleanup function on close", async () => {
    const cleanup = jest.fn()
    const handler = createSSEHandler((send, close) => {
      return cleanup
    })

    const response = await handler(mockRequest)
    const reader = response.body?.getReader()
    reader?.read()

    mockSignal.addEventListener.mock.calls[0][1]()

    expect(cleanup).toHaveBeenCalled()
  })

  test("sets appropriate headers", async () => {
    const handler = createSSEHandler(() => {})

    const response = await handler(mockRequest)

    expect(response.headers.get("Content-Type")).toBe("text/event-stream")
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform")
    expect(response.headers.get("Connection")).toBe("keep-alive")
  })
})
