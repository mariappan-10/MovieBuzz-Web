import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';

const Watchlist: React.FC = () => {
  const { user } = useAuth();
  const { watchlist, isLoading, removeFromWatchlist, refreshWatchlist } = useWatchlist();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleRemoveFromWatchlist = async (imdbId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your watchlist?`)) {
      setRemovingId(imdbId);
      const success = await removeFromWatchlist(imdbId);
      
      if (!success) {
        alert('Failed to remove movie from watchlist. Please try again.');
      }
      
      setRemovingId(null);
    }
  };

  const handleMovieClick = (imdbId: string) => {
    navigate(`/movie/${imdbId}`);
  };

  if (!user) {
    return (
      <div className="watchlist-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in to view your watchlist.</p>
          <button onClick={() => navigate('/login')} className="login-button">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your watchlist...</p>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>My Watchlist</h1>
        <div className="watchlist-stats">
          <p>{watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} in your watchlist</p>
          <button onClick={refreshWatchlist} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>


      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <div className="empty-watchlist-content">
            <h3>Your watchlist is empty</h3>
            <p>Start adding movies to your watchlist by searching and clicking on movies you want to watch later.</p>
            <button onClick={() => navigate('/')} className="browse-movies-button">
              Browse Movies
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
                  <p className="movie-type">{item.movieDetails?.type || 'movie'}</p>
                  
                  <div className="movie-actions">
                    <button
                      onClick={() => handleMovieClick(item.imdbId)}
                      className="view-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRemoveFromWatchlist(item.imdbId, item.movieDetails?.title || `Movie ${item.imdbId}`)}
                      className="remove-button"
                      disabled={removingId === item.imdbId}
                    >
                      {removingId === item.imdbId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="watchlist-footer">
        <button onClick={() => navigate('/')} className="back-to-search-button">
          ← Back to Search
        </button>
      </div>
    </div>
  );
};

export default Watchlist;