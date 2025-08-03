import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserWatchlist, getMovieDetails } from '../services/movieService';

interface MovieDetail {
  title: string;
  year: string;
  poster: string;
  type: string;
  imdbID: string;
}

interface WatchlistItem {
  id: number;
  imdbId: string;
  movieDetails: MovieDetail;
}

const UserWatchlist: React.FC = () => {
  const { userId, userName } = useParams<{ userId: string; userName: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'admin') {
      navigate('/');
      return;
    }

    if (!userId || !token) {
      setError('Invalid user or authentication');
      setIsLoading(false);
      return;
    }

    fetchUserWatchlist();
  }, [user, userId, token, navigate]);

  const fetchUserWatchlist = async () => {
    if (!userId || !token) return;

    try {
      setIsLoading(true);
      setError('');

      const watchlistIds = await getUserWatchlist(userId, token);
      
      if (watchlistIds.length > 0) {
        const watchlistData: WatchlistItem[] = [];
        
        for (let i = 0; i < watchlistIds.length; i++) {
          const imdbId = watchlistIds[i];
          try {
            const movieDetail = await getMovieDetails(imdbId);
            watchlistData.push({
              id: i + 1,
              imdbId: imdbId,
              movieDetails: {
                title: movieDetail.title || 'Unknown Title',
                year: movieDetail.year || 'Unknown',
                poster: movieDetail.poster && movieDetail.poster !== 'N/A' ? movieDetail.poster : '/placeholder.svg',
                type: movieDetail.type || 'movie',
                imdbID: imdbId
              }
            });
          } catch (error) {
            console.error(`Failed to fetch details for movie ${imdbId}:`, error);
            watchlistData.push({
              id: i + 1,
              imdbId: imdbId,
              movieDetails: {
                title: 'Failed to Load Movie',
                year: 'Unknown',
                poster: '/placeholder.svg',
                type: 'movie',
                imdbID: imdbId
              }
            });
          }
        }
        
        setWatchlist(watchlistData);
      } else {
        setWatchlist([]);
      }
    } catch (error) {
      console.error('Error fetching user watchlist:', error);
      setError('Failed to fetch user watchlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieClick = (imdbId: string) => {
    navigate(`/movie/${imdbId}`);
  };

  const handleBackToManageUsers = () => {
    navigate('/manage-users');
  };

  if (!user || user.role?.toLowerCase() !== 'admin') {
    return (
      <div className="watchlist-container">
        <div className="auth-required">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
          <button onClick={() => navigate('/')} className="login-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {decodeURIComponent(userName || 'user')}'s watchlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackToManageUsers} className="back-button">
            Back to Manage Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>{decodeURIComponent(userName || 'User')}'s Watchlist</h1>
        <div className="watchlist-stats">
          <p>{watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} in watchlist</p>
          <button onClick={fetchUserWatchlist} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <div className="empty-watchlist-content">
            <h3>This user's watchlist is empty</h3>
            <p>This user hasn't added any movies to their watchlist yet.</p>
            <button onClick={handleBackToManageUsers} className="browse-movies-button">
              Back to Manage Users
            </button>
          </div>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((item, index) => {
            if (!item || !item.imdbId) {
              return null;
            }
            
            return (
              <div key={item.id || index} className="watchlist-movie-card">
                <div 
                  className="movie-poster-container"
                  onClick={() => handleMovieClick(item.imdbId)}
                >
                  <img 
                    src={item.movieDetails?.poster || "/placeholder.svg"} 
                    alt={item.movieDetails?.title || 'Movie poster'}
                    className="watchlist-movie-poster"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="movie-overlay">
                    <button className="view-details-button">
                      View Details
                    </button>
                  </div>
                </div>
                
                <div className="watchlist-movie-info">
                  <h3 
                    className="movie-title"
                    onClick={() => handleMovieClick(item.imdbId)}
                  >
                    {item.movieDetails?.title || `Movie ${item.imdbId}`}
                  </h3>
                  <p className="movie-year">{item.movieDetails?.year || 'Unknown Year'}</p>
                  
                  <div className="movie-actions">
                    <button
                      onClick={() => handleMovieClick(item.imdbId)}
                      className="view-button"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="watchlist-footer">
        <button onClick={handleBackToManageUsers} className="back-to-search-button">
          ← Back to Manage Users
        </button>
      </div>
    </div>
  );
};

export default UserWatchlist;