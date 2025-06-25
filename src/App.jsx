import React from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import Modal from './components/Modal'
import { useEffect, useState } from 'react'
import { updateSearchCount, getTrendingMovies } from './appwrite'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Debounce the search term to prevent unnecessary API calls
  // Debounce is a function that delays the execution of a function until a certain amount of time has passed since the last time it was called.
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm)
  }, 500, [searchTerm])
  
  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')
    try {
        const endpoint = query 
          ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
       
       
        const response = await fetch(endpoint, API_OPTIONS);
          if (!response.ok) {
            throw new Error('Error fetching movies');
          }

        const data = await response.json();
          if(data.Response === 'False') {
            setErrorMessage(data.Error || 'An error occurred while fetching movies. Please try again later.');
            setMovieList([])
            return;
          }

        setMovieList(data.results || [])

        if(query && data.results.length > 0) {
          await updateSearchCount(query, data.results[0])
        }

        }catch (error) {
          console.error(`Error fetching movies:, ${error}`);
          setErrorMessage('An error occurred while fetching movies. Please try again later.');
        }finally {
          setIsLoading(false)
        }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    } catch (error) {
      console.error('Error fetching trending movies:', error)
  }
}

  const openModal = (movie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMovie(null)
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies()
  }, [])
  
  return (

<main>

  <div className='pattern' />

  <div className='wrapper'>
    <header>
      <img src="./hero.png" alt="Hero Banner" />
      <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    </header>

    {trendingMovies.length > 0 && (
      <section className='trending'>
        <h2>Trending Movies</h2>
        <ul>
          {trendingMovies.map((movie, index) => (
            <li key={movie.$id}>
              <p>{index + 1}</p>
              <img src={movie.poster_url} alt={movie.title} />
            </li>
          ))}
        </ul>
      </section>
    )}

    <section className='all-movies'>
      <h2>All Movies</h2>
      {isLoading ? (
        <Spinner />
      ) : errorMessage ? (
        <p className='text-red-500'>{errorMessage}</p>
      ) : (
        <ul>
          {movieList.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={openModal} />
          ))}
        </ul>
      )}

    </section>
  </div>
  <Modal isOpen={isModalOpen} onClose={closeModal}>
    {selectedMovie && (
      <div>
        <h2>{selectedMovie.title}</h2>
        <p>
          Contenu à ajouter plus tard
        </p>
      </div>
    )}
  </Modal>

</main>

  )
}

export default App
