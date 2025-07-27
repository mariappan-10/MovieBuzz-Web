// MovieList.tsx
import React, { useState } from "react";
import axios from "axios";

interface Movie {
  title: string;
  year: string;
  imdbID: string;
  type: string;
  poster: string;
}

const MovieList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://localhost:7188/api/Movies/search/${searchTerm}`);
      if (response.data && response.data.search) {
        setMovies(response.data.search);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter movie name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="movie-container">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.imdbID}>
            <img src={movie.poster !== "N/A" ? movie.poster : "/placeholder.jpg"} alt={movie.title} />
            <div className="movie-title">{movie.title}</div>
            <div className="movie-year">{movie.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
