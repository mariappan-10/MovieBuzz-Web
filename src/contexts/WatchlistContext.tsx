import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface WatchlistMovie {
  id: number;
  imdbId: string;
  applicationUserId: string;
  movieDetails?: {
    title: string;
    year: string;
    poster: string;
    type: string;
    imdbRating?: string;
  };
}

interface WatchlistContextType {
  watchlist: WatchlistMovie[];
  isLoading: boolean;
  fetchWatchlist: () => Promise<void>;
  removeFromWatchlist: (imdbId: string) => Promise<boolean>;
  refreshWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  // Add error state to prevent crashes
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    if (!user || !token) {
      setWatchlist([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('https://localhost:7188/api/Movies/display-watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      // Process array of imdbId strings
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Set basic watchlist items immediately (with loading state)
        const basicWatchlistItems = response.data.map((imdbId: string, index: number) => ({
          id: index + 1,
          imdbId: imdbId,
          applicationUserId: null,
          movieDetails: {
            title: 'Loading...',
            year: 'Loading...',
            poster: '/placeholder.svg',
            type: 'movie'
          }
        }));
        
        setWatchlist(basicWatchlistItems);
        
        // Then fetch movie details for each imdbId
        const detailedItems = [];
        for (let i = 0; i < response.data.length; i++) {
          const imdbId = response.data[i];
          try {
            const movieResponse = await axios.get(`https://localhost:7188/api/Movies/${imdbId}`);
            
            detailedItems.push({
              id: i + 1,
              imdbId: imdbId,
              applicationUserId: null,
              movieDetails: {
                title: movieResponse.data?.title || 'Unknown Title',
                year: movieResponse.data?.year || 'Unknown',
                poster: (movieResponse.data?.poster && movieResponse.data.poster !== "N/A") 
                  ? movieResponse.data.poster : '/placeholder.svg',
                type: movieResponse.data?.type || 'movie',
                imdbRating: movieResponse.data?.imdbRating
              }
            });
          } catch (error) {
            detailedItems.push({
              id: i + 1,
              imdbId: imdbId,
              applicationUserId: null,
              movieDetails: {
                title: 'Failed to Load Movie',
                year: 'Unknown',
                poster: '/placeholder.svg',
                type: 'movie'
              }
            });
          }
        }
        
        setWatchlist(detailedItems);
      } else {
        setWatchlist([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch watchlist');
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (imdbId: string): Promise<boolean> => {
    if (!user || !token) {
      return false;
    }

    try {
      const response = await axios.delete(`https://localhost:7188/api/Movies/remove-from-watchlist?imdbId=${imdbId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setWatchlist(prev => prev.filter(item => item.imdbId !== imdbId));
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    }
  };

  const refreshWatchlist = () => {
    fetchWatchlist();
  };

  useEffect(() => {
    if (user && token) {
      fetchWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user, token]);

  const value = {
    watchlist,
    isLoading,
    fetchWatchlist,
    removeFromWatchlist,
    refreshWatchlist
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};