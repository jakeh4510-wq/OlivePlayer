import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [section, setSection] = useState("live"); // live | movies | tvshows
  const [currentUrl, setCurrentUrl] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  // Example movie list with embed links
  const movies = [
    { name: "Smile", url: "https://player.autoembed.cc/embed/movie/882598" },
    { name: "The Batman", url: "https://player.autoembed.cc/embed/movie/414906" },
    { name: "Dune", url: "https://player.autoembed.cc/embed/movie/438631" },
  ];

  // Example TV shows grouped by season
  const tvShowsGrouped = {
    "Breaking Bad": {
      "Season 1": [
        { name: "Episode 1", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
        { name: "Episode 2", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
      ],
    },
  };

  useEffect(() => {
    if (section === "live" || section === "tvshows") {
      if (player) {
        player.dispose();
      }
      const videoElement = playerRef.current;
      if (videoElement) {
        const newPlayer = videojs(videoElement, {
          controls: true,
          autoplay: false,
          preload: "auto",
        });
        setPlayer(newPlayer);
      }
    }
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [section]);

  const toggleSeason = (season) => {
    setSeasonCollapse((prev) => ({
      ...prev,
      [season]: !prev[season],
    }));
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#121212" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          style={{
            width: "260px",
            backgroundColor: "#1e1e1e",
            padding: "15px",
            overflowY: "auto",
            color: "#fff",
          }}
        >
          <h2>Olive Player</h2>
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => setSection("live")} style={btnStyle}>
              Live TV
            </button>
            <button onClick={() => setSection("movies")} style={btnStyle}>
              Movies
            </button>
            <button onClick={() => setSection("tvshows")} style={btnStyle}>
              TV Shows
            </button>
          </div>

          {section === "movies" && (
            <div style={{ marginTop: "20px" }}>
              <h3>🎬 Movies</h3>
              {movies.map((movie, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentUrl(movie.url)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    marginTop: "6px",
                    borderRadius: "4px",
                    backgroundColor: currentUrl === movie.url ? "#333" : "#222",
                  }}
                >
                  {movie.name}
                </div>
              ))}
            </div>
          )}

          {section === "tvshows" && (
            <div style={{ marginTop: "20px" }}>
              <h3>📺 TV Shows</h3>
              {Object.keys(tvShowsGrouped).map((show) => (
                <div
                  key={show}
                  onClick={() => setSelectedTvShow(show)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    marginTop: "6px",
                    borderRadius: "4px",
                    backgroundColor: selectedTvShow === show ? "#333" : "#222",
                  }}
                >
                  {show}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {section === "movies" ? (
          currentUrl ? (
            <iframe
              src={currentUrl}
              title="Movie Player"
              width="95%"
              height="700"
              style={{ border: "none", borderRadius: "8px", backgroundColor: "#000" }}
              allowFullScreen
            ></iframe>
          ) : (
            <div style={{ color: "#aaa", marginTop: "20px", fontSize: "18px" }}>
              🎬 Select a movie from the sidebar to start watching
            </div>
          )
        ) : (
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            controls
            playsInline
            style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000" }}
          />
        )}

        {section === "tvshows" && selectedTvShow && (
          <div
            style={{
              marginTop: "20px",
              maxHeight: "300px",
              overflowY: "auto",
              width: "95%",
              backgroundColor: "rgba(26,26,26,0.8)",
              padding: "10px",
              borderRadius: "8px",
              color: "#fff",
            }}
          >
            {Object.keys(tvShowsGrouped[selectedTvShow]).map((season) => (
              <div key={season}>
                <div
                  onClick={() => toggleSeason(season)}
                  style={{
                    cursor: "pointer",
                    padding: "6px",
                    backgroundColor: "#444",
                    marginTop: "5px",
                    borderRadius: "4px",
                  }}
                >
                  {season}
                </div>
                {!seasonCollapse[season] &&
                  tvShowsGrouped[selectedTvShow][season].map((ep, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentUrl(ep.url)}
                      style={{
                        cursor: "pointer",
                        padding: "6px",
                        marginLeft: "10px",
                        marginTop: "2px",
                        borderRadius: "4px",
                        color: "#fff",
                        backgroundColor: currentUrl === ep.url ? "#555" : "#222",
                      }}
                    >
                      {ep.name}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: sidebarOpen ? "280px" : "20px",
          padding: "8px 12px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {sidebarOpen ? "Hide Sidebar" : "☰ Show Sidebar"}
      </button>
    </div>
  );
}

const btnStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  backgroundColor: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
