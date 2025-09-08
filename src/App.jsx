import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const OLIVE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Olive_icon.png";

export default function App() {
  const playerRef = useRef(null);
  const containerRef = useRef(null); // container with proper height
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(
    "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8"
  );

  const channels = [
    {
      name: "Big Buck Bunny HLS",
      url: "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8",
      type: "application/x-mpegURL",
      logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    },
    {
      name: "Sintel HLS",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      type: "application/x-mpegURL",
      logo: "https://durian.blender.org/wp-content/uploads/2010/04/sintel_poster.jpg",
    },
    {
      name: "Tears of Steel HLS",
      url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
      type: "application/x-mpegURL",
      logo: "https://mango.blender.org/wp-content/uploads/2013/05/tears_of_steel_poster.jpg",
    },
    {
      name: "Big Buck Bunny MP4",
      url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
      type: "video/mp4",
      logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    },
  ];

  // Initialize Video.js after container mounts
  useEffect(() => {
    if (!containerRef.current) return;

    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true,
      preload: "auto",
    });

    player.src({ src: currentUrl, type: channels.find(ch => ch.url === currentUrl)?.type });

    // Force resize to fix white screen / invisible UI
    const timeout = setTimeout(() => {
      player.trigger("resize");
    }, 200);

    return () => {
      clearTimeout(timeout);
      player.dispose();
    };
  }, [containerRef]);

  // Update source when currentUrl changes
  useEffect(() => {
    if (playerRef.current) {
      const player = videojs(playerRef.current);
      const channel = channels.find(ch => ch.url === currentUrl);
      player.src({ src: currentUrl, type: channel?.type });
      player.play().catch(() => {});
      player.trigger("resize");
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
        {sidebarOpen && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{ width: "80px", height: "80px", borderRadius: "50%" }}
            />
          </div>
        )}

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

        {sidebarOpen &&
          channels.map((ch, idx) => (
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
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <span>{ch.name}</span>
            </div>
          ))}
      </div>

      {/* Video container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          minHeight: "100%",
          minWidth: "100%",
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
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}
