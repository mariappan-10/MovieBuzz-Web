import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import axios from 'axios';

interface MovieDetail {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: Array<{
    source: string;
    value: string;
  }>;
  metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  type: string;
  dvd: string;
  boxOffice: string;
  production: string;
  website: string;
}

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { refreshWatchlist } = useWatchlist();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError('');
        
        // Use the correct endpoint with imdbId as path parameter
        const response = await axios.get(`https://localhost:7188/api/Movies/${id}`);
        
        if (response.data) {
          setMovie(response.data);
        } else {
          setError('Movie details not found');
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError('Movie not found');
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to load movie details. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleAddToWatchlist = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      setIsAddingToWatchlist(true);
      const response = await axios.post(`https://localhost:7188/api/Movies/add-to-watchlist?imdbId=${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setWatchlistMessage('Movie added to your watchlist!');
        refreshWatchlist(); // Refresh the watchlist to include the new movie
        setTimeout(() => setWatchlistMessage(''), 3000);
      }
    } catch (error) {
      setWatchlistMessage('Failed to add to watchlist. Movie might already be in your list.');
      setTimeout(() => setWatchlistMessage(''), 3000);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const getRatingColor = (rating: string) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return '#4CAF50';
    if (numRating >= 6) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Movie not found'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="movie-details">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Search
      </button>

      <div className="movie-details-container">
        <div className="movie-poster-section">
          <img 
            src={movie.poster !== "N/A" ? movie.poster : "/placeholder.svg"} 
            alt={movie.title}
            className="movie-poster-large"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          
          {user && (
            <div className="watchlist-section">
              <button 
                onClick={handleAddToWatchlist}
                disabled={isAddingToWatchlist}
                className="add-to-watchlist-button"
              >
                {isAddingToWatchlist ? 'Adding...' : '+ Add to Watchlist'}
              </button>
              {watchlistMessage && (
                <p className={`watchlist-message ${watchlistMessage.includes('Failed') ? 'error' : 'success'}`}>
                  {watchlistMessage}
                </p>
              )}
            </div>
          )}
          
          {!user && (
            <div className="login-prompt">
              <p>
                <button onClick={() => navigate('/login')} className="login-link">
                  Login
                </button> to add movies to your watchlist
              </p>
            </div>
          )}
        </div>

        <div className="movie-info-section">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-meta">
            <span className="year">{movie.year}</span>
            <span className="runtime">{movie.runtime}</span>
          </div>

          <div className="ratings-section">
            {movie.imdbRating && movie.imdbRating !== "N/A" && (
              <div className="rating">
                <span className="rating-label">IMDb:</span>
                <span 
                  className="rating-value"
                  style={{ color: getRatingColor(movie.imdbRating) }}
                >
                  {movie.imdbRating}/10
                </span>
              </div>
            )}
            {movie.metascore && movie.metascore !== "N/A" && (
              <div className="rating">
                <span className="rating-label">Metascore:</span>
                <span className="rating-value">{movie.metascore}/100</span>
              </div>
            )}
          </div>

          <div className="movie-details-grid">
            <div className="detail-item">
              <strong>Genre:</strong>
              <span>{movie.genre}</span>
            </div>
            
            <div className="detail-item">
              <strong>Director:</strong>
              <span>{movie.director}</span>
            </div>
            
            <div className="detail-item">
              <strong>Actors:</strong>
              <span>{movie.actors}</span>
            </div>
            
            <div className="detail-item">
              <strong>Released:</strong>
              <span>{movie.released}</span>
            </div>
            
            <div className="detail-item">
              <strong>Language:</strong>
              <span>{movie.language}</span>
            </div>
            
          </div>

          <div className="plot-section">
            <h3>Plot</h3>
            <p>{movie.plot}</p>
          </div>

          {movie.awards && movie.awards !== "N/A" && (
            <div className="awards-section">
              <h3>Awards</h3>
              <p>{movie.awards}</p>
            </div>
          )}

          {movie.boxOffice && movie.boxOffice !== "N/A" && (
            <div className="box-office-section">
              <strong>Box Office:</strong>
              <span>{movie.boxOffice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;