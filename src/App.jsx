import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function App() {
  const playerRef = useRef(null);

  // Sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Default stream
  const [currentUrl, setCurrentUrl] = useState(
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  );

  // Sample playable HLS streams
  const channels = [
    {
      name: "Big Buck Bunny",
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    },
    {
      name: "Sintel",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    },
    {
      name: "Tears of Steel",
      url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
    },
  ];

  // Initialize Video.js player once
  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true, // fills container
    });

    // Set initial source
    player.src({ src: currentUrl, type: "application/x-mpegURL" });
    player.play().catch(() => {});

    return () => {
      player.dispose();
    };
  }, []);

  // Update source on channel change
  useEffect(() => {
    if (playerRef.current && currentUrl) {
      const player = videojs(playerRef.current);
      player.src({ src: currentUrl, type: "application/x-mpegURL" });
      player.play().catch(() => {});
    }
  }, [currentUrl]);

  return (
    <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "250px" : "0px",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: sidebarOpen ? "10px" : "0px",
          boxSizing: "border-box",
          overflowY: "auto",
          transition: "0.3s",
        }}
      >
        <h2 style={{ textAlign: "center" }}>OlivePlayer</h2>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "5px",
            cursor: "pointer",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </button>
        {channels.map((ch, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentU
