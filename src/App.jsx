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
          .filter((item) => item.url) // accept all URLs
          .map((item) => ({
            name: item.name || "Unknown",
            url: item.url,
            type: item.url.endsWith(".m3u8")
              ? "application/x-mpegURL"
              : "video/mp4", // fallback for mp4 or others
          }));

        setChannels(parsedChannels);
        if (parsedChannels.length) {
          setCurrentUrl(parsedChannels[0].url);
        }
      })
      .catch((err) => console.error("Playlist load error:", err));
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
        type: currentUrl.endsWith(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      });
      playerInstance.current.load();
    }
  }, [currentUrl]);

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
          width: sidebarOpen ? "240px" : "0px",
          transition: "width 0.3s",
          backgroundColor: "rgba(26,26,26,0.95)",
          color: "#fff",
          overflowX: "hidden",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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
              }}
            >
              OlivePlayer
            </h1>

            {/* Channels */}
            {channels.length ? (
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
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <span>{ch.name}</span>
                </div>
              ))
            ) : (
              <p>No channels available.</p>
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
          left: sidebarOpen ? "260px" : "20px",
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
