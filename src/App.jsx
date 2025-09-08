import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

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
      logo: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
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
  ];

  // Mount player after container is visible
  useEffect(() => {
    const player = videojs(playerRef.current, {
      autoplay: false,
      controls: true,
      fluid: true, // fill container
    });

    // Initial source
    player.src({ src: currentUrl, type: "application/x-mpegURL" });

    // Force Video.js to resize after render
    const resizeInterval = setInterval(() => {
      if (playerRef.current) {
