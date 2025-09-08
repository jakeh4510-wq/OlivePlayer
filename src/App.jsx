import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

// Example live broadcasts (HLS streams)
const channels = [
  {
    name: "Big Buck Bunny HLS",
    url: "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8",
    type: "application/x-mpegURL",
  },
  {
    name: "Sintel HLS",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    type: "application/x-mpegURL",
  },
  {
    name: "Tears of Steel HLS",
    url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
    type: "application/x-mpegURL",
  },
  {
    name: "Test MP4",
    url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
    type: "video/mp4",
  },
];

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(channels[0].url);

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
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Star background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(#000 0%, #000 100%)",
          overflow: "hidden",
          zIndex: -2,
        }}
      >
        <div className="stars"></div>
      </div>

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
                  width: "100%",
                  transition: "background-color 0.2s",
                }}
              >
                <span>{ch.name}</span>
              </div>
            ))}
          </>
        )}

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            marginTop: "auto",
            padding: "8px 12px",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: sidebarOpen ? "100%" : "40px",
            transition: "width 0.3s",
          }}
        >
          {sidebarOpen ? "Hide Sidebar" : "☰"}
        </button>
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

      {/* Star CSS */}
      <style>
        {`
          .stars {
            width: 200%;
            height: 200%;
            background: transparent;
            box-shadow: 
              0 0 2px white,
              50px 100px 2px white,
              120px 50px 2px white,
              200px 200px 2px white,
              300px 120px 2px white,
              400px 250px 2px white,
              500px 80px 2px white;
            animation: twinkle 20s linear infinite;
          }

          @keyframes twinkle {
            0% { transform: translate(0, 0); }
            50% { transform: translate(-50px, 50px); }
            100% { transform: translate(0,0); }
          }
        `}
      </style>
    </div>
  );
}
