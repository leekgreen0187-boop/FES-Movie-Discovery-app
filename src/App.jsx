import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'

const API_KEY = 'trilogy'
const BASE_URL = 'https://www.omdbapi.com/'

function HomePage({ searchTerm, setSearchTerm, query, setQuery, movies, loading, error, sortOrder, setSortOrder }) {
  const handleSearch = () => {
    const trimmed = searchTerm.trim()
    setQuery(trimmed || 'batman')
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Cinematic streaming guide</p>
          <h1>Cinematic Movie Discovery</h1>
          <p className="hero-copy">
            Explore blockbuster hits, hidden gems, and streaming-ready favorites from a sleek movie hub.
          </p>
        </div>
        <div className="search-card">
          <label className="sr-only" htmlFor="movie-search">Search movies</label>
          <input
            id="movie-search"
            type="text"
            placeholder="Search movies"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <div className="controls-row">
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="year-desc">Newest first</option>
              <option value="year-asc">Oldest first</option>
              <option value="title-asc">Title A-Z</option>
            </select>
            <button type="button" onClick={handleSearch}>Search</button>
          </div>
          <p className="status">Current search: {query}</p>
        </div>
      </section>

      <section className="results-section">
        <div className="section-heading">
          <h2>Featured picks</h2>
          <p>{movies.length} results</p>
        </div>

        {loading && <p className="status">Loading cinematic picks...</p>}
        {error && <p className="status error">{error}</p>}

        {!loading && !error && movies.length === 0 && (
          <p className="status">Start with a search like “Batman”, “Marvel”, or “Space”.</p>
        )}

        <div className="movie-grid">
          {movies.map((movie) => (
            <article className="movie-card" key={movie.imdbID}>
              <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/300x450/png?text=No+Poster'} alt={movie.Title} />
              <div className="movie-info">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
                <Link to={`/movie/${movie.imdbID}`}>View details</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${encodeURIComponent(id)}`)
        const data = await response.json()

        if (data.Response === 'False') {
          setMovie(null)
          setError(data.Error || 'Movie details unavailable.')
        } else {
          setMovie(data)
        }
      } catch {
        setMovie(null)
        setError('We could not fetch details for this film right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  return (
    <main className="page-shell details-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}>
        ← Back to results
      </button>
      {loading && <p className="status">Loading details...</p>}
      {error && <p className="status error">{error}</p>}
      {movie && (
        <section className="detail-card">
          <img src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/400x600/png?text=No+Poster'} alt={movie.Title} />
          <div>
            <p className="eyebrow">Now showing</p>
            <h1>{movie.Title}</h1>
            <p className="hero-copy">Released in {movie.Year}</p>
            <p className="detail-copy">{movie.Plot || 'A cinematic experience for gamers, streamers, and movie lovers.'}</p>
            <p className="detail-copy">Genre: {movie.Genre || 'Adventure'}</p>
          </div>
        </section>
      )}
    </main>
  )
}

function App() {
  const [searchTerm, setSearchTerm] = useState('batman')
  const [query, setQuery] = useState('batman')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortOrder, setSortOrder] = useState('year-desc')

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.Response === 'False') {
          setMovies([])
          setError(data.Error || 'No results found for this search.')
        } else {
          setMovies(data.Search || [])
        }
      } catch {
        setMovies([])
        setError('We could not reach the movie service right now. Please try again soon.')
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = window.setTimeout(fetchMovies, 300)
    return () => window.clearTimeout(timeoutId)
  }, [query])

  const sortedMovies = useMemo(() => {
    const items = [...movies]
    switch (sortOrder) {
      case 'year-asc':
        return items.sort((a, b) => Number(a.Year) - Number(b.Year))
      case 'title-asc':
        return items.sort((a, b) => a.Title.localeCompare(b.Title))
      case 'year-desc':
      default:
        return items.sort((a, b) => Number(b.Year) - Number(a.Year))
    }
  }, [movies, sortOrder])

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">StreamQuest</Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/movie/tt3896198">Featured</Link>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              query={query}
              setQuery={setQuery}
              movies={sortedMovies}
              loading={loading}
              error={error}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
      </Routes>

      <footer className="footer">
        <p>Built for gaming nights, streaming marathons, and cinematic discovery.</p>
      </footer>
    </div>
  )
}

export default App
