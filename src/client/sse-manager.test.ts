import { sseManager } from "./sse-manager"

describe("SSEManager", () => {
  let mockEventSource: any

  beforeEach(() => {
    mockEventSource = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
    }
    ;(global as any).EventSource = jest.fn(() => mockEventSource)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("releaseConnection", () => {
    test("decrements refCount and closes EventSource when refCount reaches 0", () => {
      const url = "https://example.com/sse"
      sseManager.getConnection(url)
      sseManager.releaseConnection(url)

      expect(mockEventSource.close).toHaveBeenCalled()
      expect(sseManager["connections"].has(url)).toBe(false)
    })

    test("decrements refCount but does not close EventSource if refCount is greater than 0", () => {
      const url = "https://example.com/sse"
      sseManager.getConnection(url)
      sseManager.getConnection(url)
      sseManager.releaseConnection(url)

      expect(mockEventSource.close).not.toHaveBeenCalled()
      expect(sseManager["connections"].get(url)?.refCount).toBe(1)
    })

    test("does nothing if connection does not exist", () => {
      const url = "https://example.com/sse"
      sseManager.releaseConnection(url)

      expect(mockEventSource.close).not.toHaveBeenCalled()
      expect(sseManager["connections"].has(url)).toBe(false)
    })
  })
})
