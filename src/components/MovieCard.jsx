import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie, onSelect }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    async function fetchTrailer() {
      try {
        const res = await fetch(
          `${BASE}/movie/${movie.id}/videos?api_key=${API_KEY}`
        );
        const data = await res.json();
        const trailer = data.results?.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        if (trailer) setTrailerKey(trailer.key);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTrailer();
  }, [movie.id]);

  return (
    <div
      className={`card ${hover && trailerKey ? "glow" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(movie)}
    >
      {/* POSTER */}
      <img
        src={movie.poster_path ? IMG + movie.poster_path : ""}
        alt={movie.title}
        className={`card-poster ${hover && trailerKey ? "hide" : ""}`}
      />

      {/* TRAILER FULL CARD */}
      {hover && trailerKey && (
        <iframe
          className="card-trailer"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {/* RATING */}
      <div className="rating">
        {movie.vote_average?.toFixed(1)}
      </div>

      {/* INFO */}
      <div className="info">
        <h3>{movie.title}</h3>
        <p>{movie.release_date?.slice(0, 4)}</p>
      </div>
    </div>
  );
}
