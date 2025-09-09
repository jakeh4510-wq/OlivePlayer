import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Playlists
const PLAYLISTS = {
  live: "https://iptv-org.github.io/iptv/index.m3u",
  movies:
    "https://gist.githubusercontent.com/cirrusUK/f2ec33786c4820e4b4ac4670b2a8afea/raw/320031be25bb03b3b1d5fac9f93b19c82a7e9cef/imdb250.m3u",
};

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  const [section, setSection] = useState("live");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveChannels, setLiveChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("");

  // Load playlists
  useEffect(() => {
    // Live TV (untouched)
    fetch(PLAYLISTS.live)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parse(text);
        const live = parsed.items
          .filter((i) => i.url)
          .map((ch) => ({
            name: ch.name || "Unknown",
            url: ch.url,
          }));
        setLiveChannels(live);
        if (live.length) setCurrentUrl(live[0].url);
      });

    // Movies
    fetch(PLAYLISTS.movies)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parse(text);
        const movieList = parsed.items
          .filter((i) => i.url)
          .map((mv) => ({
            name: mv.name || mv.url.split("/").pop(),
            url: mv.url,
          }));
        setMovies(movieList);
      });
  }, []);

  // Initialize Video.js once
  useEffect(() => {
    if (!playerInstance.current) {
      playerInstance.current = videojs(playerRef.current, {
        autoplay: false,
        controls: true,
        fluid: true,
        preload: "auto",
      });
    }
  }, []);

  // Update video source
  useEffect(() => {
    if (playerInstance.current && currentUrl) {
      playerInstance.current.src({ src: currentUrl, type: "video/mp4" });
      playerInstance.current.load();
    }
  }, [currentUrl]);

  const handleSectionChange = (newSection) => {
    setSection(newSection);
    // Only auto-select first item if switching sections
    if (newSection === "live" && liveChannels.length) setCurrentUrl(liveChannels[0].url);
    if (newSection === "movies" && movies.length) setCurrentUrl(""); // Do not auto-play movie until clicked
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${BACKGROUND_GIF})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "260px" : "0px",
          backgroundColor: "rgba(26,26,26,0.95)",
          color: "#fff",
          transition: "width 0.3s",
          overflowY: "auto",
          padding: sidebarOpen ? "20px" : "0px",
          flexShrink: 0,
        }}
      >
        {sidebarOpen && (
          <>
            <img src={OLIVE_LOGO} alt="Olive Logo" style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "10px" }} />
            <h1 style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "32px", color: "#fff", marginBottom: "20px" }}>
              OlivePlayer
            </h1>

            {section === "live" &&
              liveChannels.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentUrl(ch.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor: currentUrl === ch.url ? "#555" : "#333",
                    borderRadius: "6px",
                  }}
                >
                  {ch.name}
                </div>
              ))}

            {section === "movies" &&
              movies.map((mv, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentUrl(mv.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor: currentUrl === mv.url ? "#555" : "#333",
                    borderRadius: "6px",
                  }}
                >
                  {mv.name}
                </div>
              ))}
          </>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => handleSectionChange("live")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "live" ? "#28a745" : "#333", color: "#fff", borderRadius: "6px", border: "none" }}>
            Live TV
          </button>
          <button onClick={() => handleSectionChange("movies")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "movies" ? "#28a745" : "#333", color: "#fff", borderRadius: "6px", border: "none" }}>
            Movies
          </button>
        </div>

        <video ref={playerRef} className="video-js vjs-big-play-centered" controls playsInline style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000" }} />
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
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {sidebarOpen ? "Hide Sidebar" : "☰ Show Sidebar"}
      </button>
    </div>
  );
}
