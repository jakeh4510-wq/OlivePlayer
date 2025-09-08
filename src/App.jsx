import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const OLIVE_LOGO = "https://upload.wikimedia.org/wikipedia/commons/7/7f/Olive_icon.png";

export default function App() {
  const playerRef = useRef(null);
  const containerRef = useRef(null); // container with definite height
  const [currentUrl, setCurrentUrl] = useState(
    "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8"
  );

  const channels = [
    {
      name: "Big Buck Bunny HLS",
      url: "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8",
      type: "application/x-mpegURL",
    },
    {
      name: "Big Buck Bunny MP4",
      url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
      type: "video/mp4",
    },
  ];

  // Initialize player AFTER container renders
  useEffect(() => {
    if (!containerRef.current) return;

    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true,
    });

    player.src({ src: currentUrl, type: channels.find(ch => ch.url === currentUrl)?.type });

    // Force resize after mount
    const timeout = setTimeout(() => {
      player.trigger("resize");
    }, 200); // 200ms after render

    return () => {
      clearTimeout(timeout);
      player.dispose();
    };
  }, [containerRef]);

  // Update video source on change
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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", background: "#1a1a1a", padding: "10px", color: "#fff" }}>
        <img src={OLIVE_LOGO} style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "10px" }} />
        {channels.map((ch, i) => (
          <div
            key={i}
            style={{ cursor: "pointer", marginBottom: "10px", display: "flex", alignItems: "center", background: "#333", padding: "5px", borderRadius: "5px" }}
            onClick={() => setCurrentUrl(ch.url)}
          >
            <span>{ch.name}</span>
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%", // ensure container has height
        }}
      >
        <video
          ref={playerRef}
          className="video-js vjs-big-play-centered"
          playsInline
          controls
          style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
    </div>
  );
}
