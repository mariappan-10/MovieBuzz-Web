import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import Navigation from './components/Navigation';
import MovieSearch from './components/MovieSearch';
import TestHome from './components/TestHome';
import MovieDetails from './components/MovieDetails';
import Login from './components/Login';
import Register from './components/Register';
import Watchlist from './components/Watchlist';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="App">
        <div className="app-loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading MovieBuzz...</h2>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MovieSearch />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
