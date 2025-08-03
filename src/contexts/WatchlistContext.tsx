import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getWatchlist, removeFromWatchlist as removeFromWatchlistService, getMovieDetails } from '../services';

interface WatchlistMovie {
  id: number;
  imdbId: string;
  applicationUserId: string | null;
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

  const [, setError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    if (!user || !token) {
      setWatchlist([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const imdbIds = await getWatchlist(token);


      if (imdbIds && imdbIds.length > 0) {
        const basicWatchlistItems = imdbIds.map((imdbId: string, index: number) => ({
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
        
        const detailedItems = [];
        for (let i = 0; i < imdbIds.length; i++) {
          const imdbId = imdbIds[i];
          try {
            const movieData = await getMovieDetails(imdbId);
            
            detailedItems.push({
              id: i + 1,
              imdbId: imdbId,
              applicationUserId: null,
              movieDetails: {
                title: movieData?.title || 'Unknown Title',
                year: movieData?.year || 'Unknown',
                poster: (movieData?.poster && movieData.poster !== "N/A") 
                  ? movieData.poster : '/placeholder.svg',
                type: movieData?.type || 'movie',
                imdbRating: movieData?.imdbRating
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
      const success = await removeFromWatchlistService(imdbId, token);
      
      if (success) {
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