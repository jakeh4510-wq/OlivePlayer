import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const playlistUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // direct playable stream

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(playlistUrl);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;
    const player = videojs(playerRef.current, { autoplay: false, controls: true });
    player.src({ src: currentUrl, type: "application/x-mpegURL" });
    return () => {
      player.dispose();
    };
  }, [currentUrl]);

  const channels = [
    { name: "Big Buck Bunny", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    { name: "Sintel", url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
    { name: "Tears of Steel", url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8" }
  ];

  return (
    <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0 }}>
      <div
        style={{
          width: "250px",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "10px",
          boxSizing: "border-box",
          overflowY: "auto"
        }}
      >
        <h2 style={{ textAlign: "center" }}>OlivePlayer</h2>
        {channels.map((ch, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentUrl(ch.url)}
            style={{
              cursor: "pointer",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#333",
              borderRadius: "6px"
            }}
          >
            {ch.name}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <video
          ref={playerRef}
          className="video-js vjs-big-play-centered"
          controls
          style={{ width: "90%", height: "90%", maxHeight: "90vh", maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
