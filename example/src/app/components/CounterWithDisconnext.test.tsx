import "@testing-library/jest-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import { useSSE } from "use-next-sse"

import SSEExample from "./CounterWithDisconnect"

jest.mock("use-next-sse")

describe("SSEExample", () => {
  const mockUseSSE = useSSE as jest.Mock

  beforeEach(() => {
    mockUseSSE.mockClear()
  })

  it("renders connect button initially", () => {
    mockUseSSE.mockReturnValue({ data: null, error: null, close: jest.fn() })
    render(<SSEExample />)
    expect(screen.getByText("Connect to SSE")).toBeInTheDocument()
  })

  it("renders disconnect button after connecting", () => {
    mockUseSSE.mockReturnValue({ data: null, error: null, close: jest.fn() })
    render(<SSEExample />)
    fireEvent.click(screen.getByText("Connect to SSE"))
    expect(screen.getByText("Disconnect")).toBeInTheDocument()
  })

  it("renders counter data when connected", () => {
    mockUseSSE.mockReturnValue({ data: { count: 42 }, error: null, close: jest.fn() })
    render(<SSEExample />)
    fireEvent.click(screen.getByText("Connect to SSE"))
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders milestone data when connected", () => {
    mockUseSSE.mockReturnValue({ data: { message: "Milestone reached" }, error: null, close: jest.fn() })
    render(<SSEExample />)
    fireEvent.click(screen.getByText("Connect to SSE"))
    expect(screen.getByTestId("milestone-message")).toBeInTheDocument()
    expect(screen.getByTestId("milestone-message").textContent).toEqual("Milestone reached")
  })

  it("renders close message data when connected", () => {
    mockUseSSE.mockReturnValue({ data: { message: "Connection closed" }, error: null, close: jest.fn() })
    render(<SSEExample />)
    fireEvent.click(screen.getByText("Connect to SSE"))
    expect(screen.getByTestId("close-message")).toBeInTheDocument()
    expect(screen.getByTestId("close-message").textContent).toEqual("Connection closed")
  })

  it("renders error message when there is an error", () => {
    const error = new Error("Test error")
    mockUseSSE.mockReturnValue({ data: null, error, close: jest.fn() })
    render(<SSEExample />)
    fireEvent.click(screen.getByText("Connect to SSE"))
    expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument()
  })
})
