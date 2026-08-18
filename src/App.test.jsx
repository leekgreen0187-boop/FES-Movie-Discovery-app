import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Movie discovery app', () => {
  it('renders the hero and search experience', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /cinematic movie discovery/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search movies/i)).toBeInTheDocument()
  })
})
