import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWatchlist } from '../contexts/WatchlistContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h2>MovieBuzz</h2>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Search Movies
          </Link>
          
          <Link to="/about" className="nav-link">
            About
          </Link>

          {user ? (
            <>
              <Link to="/watchlist" className="nav-link watchlist-link">
                My Watchlist
                {watchlist.length > 0 && (
                  <span className="watchlist-count">{watchlist.length}</span>
                )}
              </Link>
              
              {user.role?.toLowerCase() === 'admin' && (
                <Link to="/manage-users" className="nav-link admin-link">
                  Manage Users
                </Link>
              )}
              
              <div className="user-section">
                <span className="user-greeting">Hello, {user.personName}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link login-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;