import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function App() {
  const playerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(
    "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8"
  );

  // Working HLS/MP4 streams
  const channels = [
    {
      name: "Big Buck Bunny HLS",
      url: "https://playertest.longtailvideo.com/adaptive/bbbfull/bbbfull.m3u8",
    },
    {
      name: "Sintel HLS",
      url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    },
    {
      name: "Tears of Steel HLS",
      url: "https://bitdash-a.akamaihd.net/content/tears-of-steel/tears-of-steel.m3u8",
    },
    {
      name: "Big Buck Bunny MP4",
      url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
    },
    {
      name: "Sintel MP4",
      url: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4",
    },
  ];

  // Initialize Video.js once
  useEffect(() => {
    const play
