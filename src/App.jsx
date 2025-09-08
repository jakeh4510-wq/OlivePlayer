import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Playlist sources
const PLAYLISTS = {
  live: "https://iptv-org.github.io/iptv/index.m3u",
  tvshows:
    "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
  movies: null, // placeholder until you have a link
};

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channels, setChannels] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [section, setSection] = useState("live"); // live, movies, tvshows

  // Fetch and parse M3U playlist
  useEffect(() => {
    const playlistUrl = PLAYLISTS[section];
    if (!playlistUrl) {
      setChannels([]);
      setCurrentUrl("");
      return;
    }

    fetch(playlistUrl)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parse(text);

        const parsedChannels = parsed.items
          .filter((item) => item.url && item.url.endsWith(".m3u8"))
          .map((item) => ({
            name: item.name || "Unknown",
            url: item.url,
            type: "application/x-mpegURL",
          }));

        setChannels(parsedChannels);
        if (parsedChannels.length) {
          setCurrentUrl(parsedChannels[0].url);
        }
      });
  }, [section]);

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

  // Update source when currentUrl changes
  useEffect(() => {
    if (playerInstance.current && currentUrl) {
      playerInstance.current.src({
        src: currentUrl,
        type: "application/x-mpegURL",
      });
      playerInstance.current.load();
    }
  }, [currentUrl]);

  // Group TV Shows -> { ShowTitle: { Season: [episodes] } }
  const groupedShows = {};
  if (section === "tvshows") {
    channels.forEach((ch) => {
      // Example: "Invincible S01E02" or "Breaking Bad Season 2 Episode 5"
      const match = ch.name.match(/(.+?)(?:\sS?(\d+)[\sE]?\s?(\d+)?)/i);
      let show = ch.name;
      let season = "Season 1";
      let episode = ch.name;

      if (match) {
        show = match[1].trim();
        season = match[2] ? `Season ${match[2]}` : "Season 1";
        episode = match[3] ? `Episode ${match[3]}` : ch.name;
      }

      if (!groupedShows[show]) groupedShows[show] = {};
      if (!groupedShows[show][season]) groupedShows[show][season] = [];
      groupedShows[show][season].push({ ...ch, episode });
    });
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundImage: `url(${BACKGROUND_GIF})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "260px" : "0px",
          transition: "width 0.3s",
          backgroundColor: "rgba(26,26,26,0.95)",
          color: "#fff",
          overflowY: "auto",
          flexShrink: 0,
          padding: sidebarOpen ? "20px" : "0px",
        }}
      >
        {sidebarOpen && (
          <>
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                marginBottom: "10px",
              }}
            />
            <h1
              style={{
                color: "#fff",
                fontFamily: "'Brush Script MT', cursive",
                fontSize: "32px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              OlivePlayer
            </h1>

            {/* Channels / Shows */}
            {section === "tvshows" ? (
              Object.keys(groupedShows).length ? (
                Object.entries(groupedShows).map(([show, seasons]) => (
                  <details
                    key={show}
                    style={{
                      backgroundColor: "#222",
                      marginBottom: "10px",
                      borderRadius: "6px",
                      padding: "5px",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        padding: "10px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {show}
                    </summary>
                    {Object.entries(seasons).map(([season, eps]) => (
                      <details
                        key={season}
                        style={{
                          marginLeft: "15px",
                          marginBottom: "5px",
                          backgroundColor: "#333",
                          borderRadius: "4px",
                          padding: "5px",
                        }}
                      >
                        <summary style={{ cursor: "pointer", padding: "6px" }}>
                          {season}
                        </summary>
                        {eps.map((ep, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCurrentUrl(ep.url)}
                            style={{
                              cursor: "pointer",
                              padding: "6px",
                              margin: "3px 0",
                              backgroundColor:
                                currentUrl === ep.url ? "#555" : "#444",
                              borderRadius: "4px",
                            }}
                          >
                            {ep.episode}
                          </div>
                        ))}
                      </details>
                    ))}
                  </details>
                ))
              ) : (
                <p>Loading TV Shows...</p>
              )
            ) : channels.length ? (
              channels.map((ch, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentUrl(ch.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor:
                      currentUrl === ch.url ? "#555" : "#333",
                    borderRadius: "6px",
                  }}
                >
                  {ch.name}
                </div>
              ))
            ) : (
              <p>Loading channels...</p>
            )}
          </>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Top navigation */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setSection("live")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              background: section === "live" ? "#28a745" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Live TV
          </button>
          <button
            onClick={() => setSection("movies")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              background: section === "movies" ? "#28a745" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Movies
          </button>
          <button
            onClick={() => setSection("tvshows")}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              background: section === "tvshows" ? "#28a745" : "#333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            TV Shows
          </button>
        </div>

        {/* Video player */}
        <div style={{ width: "95%", maxWidth: "1400px", textAlign: "center" }}>
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            controls
            playsInline
            style={{ width: "100%", height: "700px", backgroundColor: "#000" }}
          />
          <button
            onClick={() => {
              if (playerInstance.current) {
                try {
                  playerInstance.current.play();
                } catch (e) {
                  console.log("Play blocked:", e);
                }
              }
            }}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#28a745",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Play
          </button>
        </div>
      </div>

      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: sidebarOpen ? "270px" : "20px",
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
