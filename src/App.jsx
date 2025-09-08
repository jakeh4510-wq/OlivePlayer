import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Parser } from "m3u8-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF =
  "https://wallpaperaccess.com/full/869923.gif";

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channels, setChannels] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("");

  // Fetch and parse M3U playlist
  useEffect(() => {
    fetch("https://iptv-org.github.io/iptv/index.m3u")
      .then((res) => res.text())
      .then((text) => {
        const parser = new Parser();
        parser.push(text);
        parser.end();

        let parsedChannels = [];

        // Parse segments or playlists
        if (parser.manifest.segments?.length) {
          parsedChannels = parser.manifest.segments.map((seg, idx) => ({
            name: seg.title || seg.attributes?.["tvg-name"] || `Channel ${idx + 1}`,
            url: seg.uri,
            type: "application/x-mpegURL",
          }));
        } else if (parser.manifest.playlists?.length) {
          parsedChannels = parser.manifest.playlists.map((pl, idx) => ({
            name: pl.attributes?.title || pl.attributes?.["tvg-name"] || `Channel ${idx + 1}`,
            url: pl.uri,
            type: "application/x-mpegURL",
          }));
        }

        setChannels(parsedChannels);
        if (parsedChannels.length) setCurrentUrl(parsedChannels[0].url);
      });
  }, []);

  // Initialize Video.js player
  useEffect(() => {
    if (!currentUrl) return;

    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true,
      preload: "auto",
    });

    player.src({ src: currentUrl, type: "application/x-mpegURL" });

    // Attempt to autoplay when switching channels
    player.ready(() => {
      try {
        player.play();
      } catch (e) {
        console.log("Autoplay blocked:", e);
      }
    });

    const timeout = setTimeout(() => player.trigger("resize"), 300);

    return () => {
      clearTimeout(timeout);
      player.dispose();
    };
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
        backgroundRepeat: "no-repeat",
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
            {/* Logo + Title */}
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "10px" }}
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
                    backgroundColor: currentUrl === ch.url ? "#555" : "#333",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    transition: "background-color 0.2s",
                  }}
                >
                  <span>{ch.name}</span>
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "95%", maxWidth: "1400px" }}>
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            controls
            playsInline
            style={{ width: "100%", height: "700px", backgroundColor: "#000" }}
          />
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
