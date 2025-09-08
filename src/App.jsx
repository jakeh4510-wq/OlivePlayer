import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const VIDEO_URL =
  "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8"; // HLS test stream

export default function OlivePlayer() {
  const playerRef = useRef(null);

  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true,
      preload: "auto",
    });

    player.src({ src: VIDEO_URL, type: "application/x-mpegURL" });

    const timeout = setTimeout(() => {
      player.trigger("resize");
    }, 300);

    return () => {
      clearTimeout(timeout);
      player.dispose();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#000",
        padding: "20px",
      }}
    >
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
      <div style={{ width: "80%", maxWidth: "800px" }}>
        <video
          ref={playerRef}
          className="video-js vjs-big-play-centered"
          controls
          playsInline
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
        />
      </div>
    </div>
  );
}
