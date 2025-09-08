import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

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

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(channels[0].url);

  // Video.js initialization (keep video section untouched)
  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true,
      preload: "auto",
    });

    player.src({ src: currentUrl, type: channels.find((ch) => ch.url === currentUrl)?.type });

    const timeout = setTimeout(() => {
      player.trigger("resize");
    }, 300);

    return () => {
      clearTimeout(timeout);
      player.dispose();
    };
  }, [currentUrl]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#000" }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "220px" : "0px",
          transition: "width 0.3s",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          overflowX: "hidden",
          flexShrink: 0,
        }}
      >
        {sidebarOpen && (
          <div style={{ padding: "15px" }}>
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "15px" }}
            />
            {channels.map((ch, idx) => (
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
                  transition: "background-color 0.2s",
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
          position: "relative",
          padding: "20px",
        }}
      >
        {/* Show sidebar toggle button when hidden */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "absolute",
              left: "10px",
              top: "10px",
              zIndex: 10,
              padding: "8px 12px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Show Sidebar
          </button>
        )}

        {/* Olive Logo + App Title */}
        <img
          src={OLIVE_LOGO}
          alt="Olive Logo"
          style={{ width: "120px", height: "120px", marginBottom: "15px" }}
        />
        <h1
          style={{
            color: "#fff",
            fontFamily: "'Brush Script MT', cursive",
            fontSize: "36px",
            marginBottom: "20px",
          }}
        >
          OlivePlayer
        </h1>

        {/* Video Player */}
        <div style={{ width: "90%", maxWidth: "1000px" }}>
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            controls
            playsInline
            style={{ width: "100%", height: "500px", backgroundColor: "#000" }}
          />
        </div>
      </div>
    </div>
  );
}
