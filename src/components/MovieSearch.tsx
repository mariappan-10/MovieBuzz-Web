import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Movie, searchMovies, getMovieDetails } from '../services';

const MovieSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  const languages = useMemo(() => [
    { value: 'all', label: 'All Languages' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'marathi', label: 'Marathi' }
  ], []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearResults = () => {
    setSearchTerm('');
    setMovies([]);
    setFilteredMovies([]);
    setSelectedLanguage('all');
    setSelectedYear('');
    setCurrentPage(1);
    setTotalResults(0);
    setHasMorePages(true);
    setError('');
    setHasSearched(false);
  };

  const filterMoviesByLanguage = useCallback(async (movieList: Movie[], language: string) => {
    if (language === 'all') {
      return movieList;
    }

    const moviesWithLanguage = await Promise.all(
      movieList.map(async (movie) => {
        try {
          const details = await getMovieDetails(movie.imdbID);
          const movieLanguages = details.language.toLowerCase();
          return movieLanguages.includes(language.toLowerCase()) ? movie : null;
        } catch {
          return null;
        }
      })
    );

    return moviesWithLanguage.filter(movie => movie !== null) as Movie[];
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear results when input is cleared
    if (!value.trim()) {
      clearResults();
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (value === '' || (/^\d{0,4}$/.test(value))) {
      setSelectedYear(value);
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value;
    setSelectedLanguage(language);
    
    if (movies.length > 0) {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      try {
        const filtered = await filterMoviesByLanguage(movies, language);
        setFilteredMovies(filtered);
        
        // Set appropriate error message if no movies found for selected language
        if (filtered.length === 0 && language !== 'all') {
          const selectedLanguageLabel = languages.find(l => l.value === language)?.label || language;
          setError(`No movies found for "${searchTerm}" in ${selectedLanguageLabel}. Try a different search term or language filter.`);
        }
      } catch {
        setError('Failed to filter movies by language');
      } finally {
        setIsLoading(false);
      }
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
    setCurrentPage(1);
    setHasMorePages(true);
    
    try {
      const searchResponse = await searchMovies(searchTerm, selectedYear, 1, abortControllerRef.current.signal);
      const moviesWithPosters = searchResponse.movies;
      
      setMovies(moviesWithPosters);
      setTotalResults(searchResponse.totalResults);
      
      // Check if we already have all results on first page
      if (moviesWithPosters.length >= searchResponse.totalResults) {
        setHasMorePages(false);
      }
      
      // Apply language filter to the search results
      const filtered = await filterMoviesByLanguage(moviesWithPosters, selectedLanguage);
      setFilteredMovies(filtered);
      
      if (filtered.length === 0 && selectedLanguage !== 'all') {
        const selectedLanguageLabel = languages.find(l => l.value === selectedLanguage)?.label || selectedLanguage;
        setError(`No movies found for "${searchTerm}" in ${selectedLanguageLabel}. Try a different search term or language filter.`);
      } else if (moviesWithPosters.length === 0) {
        setError('No movies found with posters. Try a different search term.');
      } else {
        // Clear error if movies are found
        setError('');
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        setError('Failed to search movies. Please try again.');
        setMovies([]);
        setFilteredMovies([]);
        setTotalResults(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedYear, selectedLanguage, filterMoviesByLanguage, languages]);

  const loadMoreResults = useCallback(async () => {
    if (!searchTerm.trim() || isLoadingMore || !hasMorePages) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoadingMore(true);
    setError('');

    try {
      const nextPage = currentPage + 1;
      const searchResponse = await searchMovies(searchTerm, selectedYear, nextPage, abortControllerRef.current.signal);
      const moviesWithPosters = searchResponse.movies;

      if (moviesWithPosters.length === 0) {
        // No more results available
        setHasMorePages(false);
      } else {
        // Append new results to existing movies
        const updatedMovies = [...movies, ...moviesWithPosters];
        setMovies(updatedMovies);
        setCurrentPage(nextPage);

        // Check if we've loaded all available results
        // Use the totalResults from state (from first search) instead of current response
        if (updatedMovies.length >= totalResults) {
          setHasMorePages(false);
        }

        // Apply language filter to the updated results
        const filtered = await filterMoviesByLanguage(updatedMovies, selectedLanguage);
        setFilteredMovies(filtered);
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        setError('Failed to load more movies. Please try again.');
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [searchTerm, selectedYear, currentPage, movies, selectedLanguage, filterMoviesByLanguage, isLoadingMore, hasMorePages, totalResults]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.imdbID}`, { state: { movie } });
  };

  // Compute if we should show the load more button
  const shouldShowLoadMore = useMemo(() => {
    if (!hasSearched || totalResults === 0 || movies.length === 0) return false;
    if (!hasMorePages) return false;
    return movies.length < totalResults;
  }, [hasSearched, totalResults, movies.length, hasMorePages]);

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
        <input
          type="text"
          placeholder="Year (e.g., 2012)"
          value={selectedYear}
          onChange={handleYearChange}
          onKeyPress={handleKeyPress}
          className="year-filter"
          disabled={isLoading}
          maxLength={4}
        />
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="language-filter"
          disabled={isLoading}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
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

      {filteredMovies.length > 0 && !isLoading && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results for "{searchTerm}"
              {selectedYear && ` (${selectedYear})`}
            </h3>
            <p>
              {filteredMovies.length} of {totalResults} movies found
              {selectedLanguage !== 'all' && ` in ${languages.find(l => l.value === selectedLanguage)?.label}`}
            </p>
          </div>
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
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
          
          {shouldShowLoadMore && (
            <div className="pagination-container">
              <button 
                className="load-more-button"
                onClick={loadMoreResults}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  <>
                    <span>Load More</span>
                    <span className="arrow-icon">→</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {hasSearched && filteredMovies.length === 0 && movies.length > 0 && !isLoading && !error && (
        <div className="no-results">
          <h3>No movies found for "{searchTerm}" in {languages.find(l => l.value === selectedLanguage)?.label}</h3>
          <p>Try selecting a different language filter or search with different keywords.</p>
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