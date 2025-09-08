import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

// Olive main logo
const OLIVE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Olive_icon.png";

// Reliable test logos for channels
const TEST_LOGOS = {
  bbb: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
  sintel: "https://durian.blender.org/wp-content/uploads/2010/04/sintel_poster.jpg",
  tears: "https://mango.blender.org/wp-content/uploads/2013/05/tears_of_steel_poster.jpg",
};

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
      logo: TEST_LOGOS.bbb,
    },
    {
      name: "Sintel HLS",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      logo: TEST_LOGOS.sintel,
    },
    {
      name: "Tears of Steel HLS",
      url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
      logo: TEST_LOGOS.tears,
    },
    {
      name: "Big Buck Bunny MP4",
      url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
      logo: TEST_LOGOS.bbb,
    },
    {
      name: "Sintel MP4",
      url: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
      logo: TEST_LOGOS.sintel,
    },
  ];

  // Initialize Video.js player
  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
    });

    player.src({ src: currentUrl, type: "application/x-mpegURL" });

    // Force a resize after mount to fix white screen
    const resizeInterval = setInterval(() => {
      if (playerRef.current) {
        player.trigger("resize");
      }
    }, 100);

    // Stop after 1 second
    setTimeout(() => clearInterval(resizeInterval), 1000);

    return () => player.dispose();
  }, []);

  // Update video source on channel change
  useEffect(() => {
    if (playerRef.current && currentUrl) {
      const player = videojs(playerRef.current);
      player.src({ src: currentUrl, type: "application/x-mpegURL" });
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
                  onError={(e) => e.target.style.display = "none"} // hide if logo fails
                />
