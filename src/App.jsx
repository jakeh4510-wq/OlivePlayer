import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const playlistUrl =
  "https://raw.githubusercontent.com/iptv-org/iptv/master/tests/test.m3u"; // working test playlist

function parseM3U(data) {
  const lines = data.split("\n");
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/,(.*)$/);
      const name = nameMatch ? nameMatch[1].trim() : "Unknown";
      const logoMatch = lines[i].match(/tvg-logo="(.*?)"/);
      const logo = logoMatch ? logoMatch[1] : "";
      const url = lines[i + 1] ? lines[i + 1].trim() : "";
      items.push({ name, logo, url });
    }
  }
  return items;
}

export default function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const playerRef = useRef(null);

  useEffect(() => {
    fetch(playlistUrl)
      .then((res) => res.text())
      .then((text) => {
        const items = parseM3U(text);
        setPlaylist(items);
        if (items.length > 0) setCurrentUrl(items[0].url);
      });
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;
    const player = videojs(playerRef.current);
    if (currentUrl) {
      player.src({ src: currentUrl, type: "application/x-mpegURL" });
      player.play().catch(() => {});
    }
    return () => {
      player.dispose();
    };
  }, [currentUrl]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div
        style={{
          width: "250px",
          background: "#222",
          color: "#fff",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        <h2 style={{ textAlign: "center" }}>OlivePlayer</h2>
        {playlist.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentUrl(item.url)}
            style={{
              cursor: "pointer",
              marginBottom: "10px",
              padding: "5px",
              background: "#333",
              borderRadius: "5px",
            }}
          >
            {item.logo && (
              <img
                src={item.logo}
                alt={item.name}
                style={{ width: "40px", verticalAlign: "middle", marginRight: "5px" }}
              />
            )}
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: "#000" }}>
        <video
          ref={playerRef}
          className="video-js vjs-default-skin"
          controls
          style={{ width: "100%", height: "100%" }}
        ></video>
      </div>
    </div>
  );
}
