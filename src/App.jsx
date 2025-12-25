import { useEffect, useState } from "react";
import MovieCard from "./components/MovieCard";
import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

function App() {
  /* 🔍 SEARCH */
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🎬 DETAILS + TRAILER */
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  /* 🔍 SEARCH MOVIES (DEBOUNCE) */
  useEffect(() => {
    if (!query) {
      setMovies([]);
      return;
    }

    const delay = setTimeout(() => {
      searchMovies(query);
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const searchMovies = async (text) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          text
        )}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* 🎬 OPEN MOVIE DETAILS */
  const openMovieDetails = async (movie) => {
    try {
      const [detailsRes, creditsRes, externalRes, videosRes] =
        await Promise.all([
          fetch(`${BASE}/movie/${movie.id}?api_key=${API_KEY}`),
          fetch(`${BASE}/movie/${movie.id}/credits?api_key=${API_KEY}`),
          fetch(`${BASE}/movie/${movie.id}/external_ids?api_key=${API_KEY}`),
          fetch(`${BASE}/movie/${movie.id}/videos?api_key=${API_KEY}`)
        ]);

      const details = await detailsRes.json();
      const credits = await creditsRes.json();
      const external = await externalRes.json();
      const videos = await videosRes.json();

      const director =
        credits.crew.find((c) => c.job === "Director")?.name || "N/A";

      const writers =
        credits.crew
          .filter(
            (c) => c.job === "Writer" || c.job === "Screenplay"
          )
          .map((w) => w.name)
          .join(", ") || "N/A";

      const actors =
        credits.cast
          .slice(0, 5)
          .map((a) => a.name)
          .join(", ") || "N/A";

      const trailer = videos.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );

      setTrailerKey(trailer ? trailer.key : null);
      setShowTrailer(false);

      setMovieDetails({
        ...details,
        director,
        writers,
        actors,
        imdbId: external.imdb_id
      });
    } catch (err) {
      console.error("Details error:", err);
    }
  };

  return (
    <div className="app">
      {/* 🔥 HERO */}
      <header className="hero">
        <h1>STEALIGHT</h1>
        <p className="tagline">
          Discover cinema. Feel the craft.
        </p>

        <div className="search-wrap">
          <input
            className="search"
            placeholder="Search movies, actors, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      {/* ⏳ LOADING */}
      {loading && <p className="loading">Loading…</p>}

      {/* 🎞 MOVIE GRID */}
      <section className="grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={openMovieDetails}
          />
        ))}
      </section>

      {/* 🪟 MOVIE DETAILS MODAL */}
      {movieDetails && (
        <div
          className="modal-overlay"
          onClick={() => {
            setMovieDetails(null);
            setShowTrailer(false);
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* POSTER */}
            <img
              src={
                movieDetails.poster_path
                  ? IMG + movieDetails.poster_path
                  : ""
              }
              alt={movieDetails.title}
            />

            {/* INFO */}
            <div className="modal-info">
              <h2>{movieDetails.title}</h2>

              <p className="overview">
                {movieDetails.overview}
              </p>

              <div className="modal-meta">
                <div>
                  <span>Release</span><br />
                  <strong>{movieDetails.release_date}</strong>
                </div>

                <div>
                  <span>Language</span><br />
                  <strong>
                    {movieDetails.original_language?.toUpperCase()}
                  </strong>
                </div>

                <div>
                  <span>Genre</span><br />
                  <strong>
                    {movieDetails.genres
                      ?.map((g) => g.name)
                      .join(", ")}
                  </strong>
                </div>

                <div>
                  <span>IMDb</span><br />
                  <strong>⭐ {movieDetails.vote_average}</strong>
                </div>

                <div>
                  <span>Director</span><br />
                  <strong>{movieDetails.director}</strong>
                </div>

                <div>
                  <span>Actors</span><br />
                  <strong>{movieDetails.actors}</strong>
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ marginTop: "28px" }}>
                {movieDetails.imdbId && (
                  <a
                    href={`https://www.imdb.com/title/${movieDetails.imdbId}`}
                    target="_blank"
                    className="imdb-link"
                  >
                    View on IMDb
                  </a>
                )}

                {trailerKey && (
                  <button
                    className="trailer-btn"
                    onClick={() => setShowTrailer(true)}
                  >
                    ▶ Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ▶ TRAILER POPUP */}
      {showTrailer && trailerKey && (
        <div
          className="trailer-overlay"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="trailer-box"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Movie Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
       <footer className="footer">
        <p>
          © {new Date().getFullYear()} KEEN • Created by{" "}
          <span>Lakshya Jain</span>
        </p>
      </footer>
    </div>
  );
}
   
    
export default App;
