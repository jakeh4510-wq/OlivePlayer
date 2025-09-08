// OlivePlayer.jsx
import React, { useState, useEffect } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

function OlivePlayer() {
  const [channels, setChannels] = useState([]);
  const [currentStream, setCurrentStream] = useState("");

  // Example default playlist (replace with your own URL or file)
  const playlistUrl =
    "https://raw.githubusercontent.com/iptv-org/iptv/refs/heads/master/streams/ad.m3u";

  useEffect(() => {
    // Fetch and parse M3U
    fetch(playlistUrl)
      .then((res) => res.text())
      .then((data) => {
        const parsed = parseM3U(data);
        setChannels(parsed);
        if (parsed.length > 0) {
          setCurrentStream(parsed[0].url);
        }
      });
  }, []);

  // Parse M3U file
  function parseM3U(m3uText) {
    const lines = m3uText.split("\n");
    const result = [];
    let current = {};
    lines.forEach((line) => {
      if (line.startsWith("#EXTINF")) {
        const nameMatch = line.match(/,(.*)$/);
        const logoMatch = line.match(/tvg-logo="(.*?)"/);
        current = {
          name: nameMatch ? nameMatch[1] : "Unknown",
          logo: logoMatch ? logoMatch[1] : "",
        };
      } else if (line.startsWith("http")) {
        current.url = line.trim();
        result.push(current);
      }
    });
    return result;
  }

  // Initialize Video.js player
  useEffect(() => {
    if (currentStream) {
      const player = videojs("olive-video", {
        autoplay: false,
        controls: true,
        preload: "auto",
        fluid: true,
        sources: [{ src: currentStream, type: "application/x-mpegURL" }],
      });
      return () => {
        player.dispose();
      };
    }
  }, [currentStream]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar for channels */}
      <div className="w-1/4 overflow-y-scroll border-r border-gray-700 p-2">
        <h2 className="text-xl mb-4 font-bold">OlivePlayer</h2>
        {channels.map((ch, idx) => (
          <div
            key={idx}
            className="flex items-center mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => setCurrentStream(ch.url)}
          >
            {ch.logo && (
              <img
                src={ch.logo}
                alt={ch.name}
                className="w-8 h-8 mr-2 rounded"
              />
            )}
            <span>{ch.name}</span>
          </div>
        ))}
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center p-4">
        <video
          id="olive-video"
          className="video-js vjs-big-play-centered w-full h-full"
        ></video>
      </div>
    </div>
  );
}

export default OlivePlayer;
