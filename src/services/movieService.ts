import axios from 'axios';
import { API_BASE_URL } from './api';

export interface Movie {
  title: string;
  year: string;
  imdbID: string;
  type: string;
  poster: string;
}

export interface SearchResponse {
  movies: Movie[];
  totalResults: number;
}

export interface MovieDetail {
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

export const searchMovies = async (searchTerm: string, year?: string, page?: number, signal?: AbortSignal): Promise<SearchResponse> => {
  let url = `${API_BASE_URL}/Movies/search/${encodeURIComponent(searchTerm)}`;
  
  const params = new URLSearchParams();
  
  // Add year parameter if provided
  if (year && year.trim() !== '') {
    params.append('year', year.trim());
  }
  
  // Add page parameter if provided
  if (page && page > 0) {
    params.append('page', page.toString());
  }
  
  // Append parameters to URL if any exist
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await axios.get(url, { signal });
  
  if (response.data && response.data.search) {
    const filteredMovies = response.data.search
      .filter((movie: Movie) => {
        return movie.poster && 
               movie.poster !== "N/A" && 
               movie.poster.trim() !== "" && 
               movie.poster !== "null" && 
               movie.poster !== "undefined";
      })
      .slice(0, 20);
    
    return {
      movies: filteredMovies,
      totalResults: parseInt(response.data.totalResults || '0', 10)
    };
  }
  
  return {
    movies: [],
    totalResults: 0
  };
};

export const getMovieDetails = async (imdbId: string): Promise<MovieDetail> => {
  const response = await axios.get(`${API_BASE_URL}/Movies/${imdbId}`);
  return response.data;
};

export const addToWatchlist = async (imdbId: string, token: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/Movies/add-to-watchlist?imdbId=${imdbId}`, 
      {}, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const removeFromWatchlist = async (imdbId: string, token: string): Promise<boolean> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/Movies/remove-from-watchlist?imdbId=${imdbId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getWatchlist = async (token: string): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/Movies/display-watchlist`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return Array.isArray(response.data) ? response.data : [];
};

export const getUserWatchlist = async (userId: string, token: string): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/Movies/display-watchlist/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return Array.isArray(response.data) ? response.data : [];
};