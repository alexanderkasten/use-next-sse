import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useSSE } from 'use-next-sse';

import Counter from './Counter';

jest.mock('use-next-sse');

describe('Counter', () => {
  it('renders loading state initially', () => {
    (useSSE as jest.Mock).mockReturnValue({ data: null, error: null });
    render(<Counter />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = new Error('Test error');
    (useSSE as jest.Mock).mockReturnValue({ data: null, error });
    render(<Counter />);
    expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
  });

  it('renders count when data is available', () => {
    const data = { count: 42 };
    (useSSE as jest.Mock).mockReturnValue({ data, error: null });
    render(<Counter />);
    expect(screen.getByText('Count: 42')).toBeInTheDocument();
  });
});
