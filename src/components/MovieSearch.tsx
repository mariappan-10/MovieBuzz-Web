import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Movie, searchMovies } from '../services';

const MovieSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearResults = () => {
    setMovies([]);
    setError('');
    setHasSearched(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results when input is cleared
    if (!value.trim()) {
      clearResults();
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a movie title to search');
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const searchResults = await searchMovies(searchTerm, abortControllerRef.current.signal);
      
      // Additional client-side filtering to ensure no movies without posters are rendered
      const moviesWithPosters = searchResults.filter(movie => {
        return movie.poster && 
               movie.poster !== "N/A" && 
               movie.poster.trim() !== "" && 
               movie.poster !== "null" && 
               movie.poster !== "undefined";
      });
      
      setMovies(moviesWithPosters);
      if (moviesWithPosters.length === 0) {
        setError('No movies found with posters. Try a different search term.');
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        setError('Failed to search movies. Please try again.');
        setMovies([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.imdbID}`, { state: { movie } });
  };

  return (
    <div className="movie-search">
      <div className="search-header">
        <h1>Discover Movies</h1>
        <p>Search for your favorite movies and discover new ones</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a movie (e.g., 'Avengers', 'Dark Knight')..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
          disabled={isLoading}
        />
        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        {searchTerm && (
          <button 
            onClick={clearResults}
            className="clear-button"
            disabled={isLoading}
          >
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for "{searchTerm}"...</p>
        </div>
      )}

      {movies.length > 0 && !isLoading && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results for "{searchTerm}"</h3>
            <p>{movies.length} movies found {movies.length === 20 ? '(showing first 20)' : ''}</p>
          </div>
          <div className="movie-grid">
            {movies.map((movie) => (
              <div 
                className="movie-card" 
                key={movie.imdbID}
                onClick={() => handleMovieClick(movie)}
              >
                <div className="movie-poster">
                  <img 
                    src={movie.poster !== "N/A" ? movie.poster : "/placeholder.svg"} 
                    alt={movie.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="movie-info">
                  <h4 className="movie-title" title={movie.title}>{movie.title}</h4>
                  <p className="movie-year">{movie.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && movies.length === 0 && !isLoading && !error && (
        <div className="no-results">
          <h3>No movies found for "{searchTerm}"</h3>
          <p>Try searching with different keywords or check your spelling.</p>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;