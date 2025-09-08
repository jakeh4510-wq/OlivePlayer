import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Olive logo URL
const OLIVE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Olive_icon.png";

export default function App() {
  const playerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(
    "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8"
  );

  const channels = [
    {
      name: "Big Buck Bunny HLS",
      url: "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8",
      logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    },
    {
      name: "Sintel HLS",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      logo: "https://durian.blender.org/wp-content/uploads/2010/04/sintel_poster.jpg",
    },
    {
      name: "Tears of Steel HLS",
      url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
      logo: "https://mango.blender.org/wp-content/uploads/2013/05/tears_of_steel_poster.jpg",
    },
    {
      name: "Big Buck Bunny MP4",
      url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
      logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    },
    {
      name: "Sintel MP4",
      url: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
      logo: "https://durian.blender.org/wp-content/uploads/2010/04/sintel_poster.jpg",
    },
  ];

  // Initialize Video.js player
  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true, // ensures player fills container
    });

    // Set initial source
    player.src({ src: currentUrl, type: "application/x-mpegURL" });

    // Force resize to fix white screen
    setTimeout(() => {
      player.trigger("resize");
    }, 100);

    return () => player.dispose();
  }, []);

  // Update source on channel change
  useEffect(() => {
    if (playerRef.current && currentUrl) {
      const player = videojs(playerRef.current);
      player.src({ src: currentUrl, type: "application/x-mpegURL" });
      player.play().catch(() => {});
      player.trigger("resize"); // ensure video fills container
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
        {/* Olive logo */}
        {sidebarOpen && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            />
          </div>
        )}

        {/* Toggle sidebar */}
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

        {/* Channel list */}
        {channels.map((ch, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentUrl(ch.url)}
            style={{
              cursor: "pointer",
              padding: "10px",
              marginBottom: "10px",
              backgroundColor: "#333",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {ch.logo && (
              <img
                src={ch.logo}
                alt={ch.name}
                style={{ width: "40px", height: "40px", marginRight: "10px", borderRadius: "4px" }}
              />
            )}
            <span>{ch.name}</span>
          </div>
        ))}
      </div>

      {/* Video player */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <video
          ref={playerRef}
          className="video-js vjs-big-play-centered"
          controls
          playsInline
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            backgroundColor: "#000",
          }}
        />
      </div>
    </div>
  );
}
