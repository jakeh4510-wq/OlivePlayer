import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Movies list using embedded URLs
const MOVIES = [
  { name: "195388-watch-metallica-live-shit-binge-amp-purge-seattle-1993-online", url: "https://hyhd.org/embed/tt1700430/" },
  { name: "195411-watch-nostalgia-2018-online", url: "https://hyhd.org/embed/tt10160758/" },
  { name: "195404-watch-dial-h-i-s-t-o-r-y-1997-online", url: "https://hyhd.org/embed/tt0367655/" },
  { name: "195408-watch-whaledreamers-2006-online", url: "https://hyhd.org/embed/tt0867160/" },
  { name: "195390-watch-a-leap-in-the-dark-1980-online", url: "https://hyhd.org/embed/tt0079845/" },
  { name: "195394-watch-snnike-2025-online", url: "https://hyhd.org/embed/tt34807878/" },
  { name: "195401-watch-a-film-like-any-other-1968-online", url: "https://hyhd.org/embed/tt0063736/" },
  { name: "195406-watch-a-father-for-brittany-1998-online", url: "https://hydrahd.io/movie/195406-watch-a-father-for-brittany-1998-online" },
  { name: "195389-watch-inspector-zende-2025-online", url: "https://hydrahd.io/movie/195389-watch-inspector-zende-2025-online" },
  { name: "195405-watch-noi-uomini-duri-1987-online", url: "https://hyhd.org/embed/tt0093645/" },
];

const PLAYLISTS = {
  live: "https://iptv-org.github.io/iptv/index.m3u",
  tvshows:
    "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
};

export default function OlivePlayer() {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [section, setSection] = useState("live"); // live, movies, tvshows

  const [liveChannels, setLiveChannels] = useState([]);
  const [tvShowsGrouped, setTvShowsGrouped] = useState({});
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  const [currentUrl, setCurrentUrl] = useState(""); // For live TV & TV shows
  const [currentMovie, setCurrentMovie] = useState(null); // For movies

  // Load playlists
  useEffect(() => {
    // Live TV
    fetch(PLAYLISTS.live)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parse(text);
        const live = parsed.items
          .filter((i) => i.url)
          .map((ch) => ({
            name: ch.name || "Unknown",
            url: ch.url,
            type: ch.url.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          }));
        setLiveChannels(live);
        if (live.length) setCurrentUrl(live[0].url);
      })
      .catch(() => console.warn("Failed to load live channels"));

    // TV Shows
    fetch(PLAYLISTS.tvshows)
      .then((res) => res.text())
      .then((text) => {
        const grouped = {};
        parse(text)
          .items.filter((i) => i.url)
          .forEach((ch) => {
            const showName = ch.name.split(" S")[0];
            const season = ch.name.match(/S\d+/)?.[0] || "S01";
            if (!grouped[showName]) grouped[showName] = {};
            if (!grouped[showName][season]) grouped[showName][season] = [];
            grouped[showName][season].push({
              name: ch.name,
              url: ch.url,
              type: ch.url.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
            });
          });
        setTvShowsGrouped(grouped);
      })
      .catch(() => console.warn("Failed to load TV shows"));
  }, []);

  // Initialize Video.js for live TV and TV Shows only
  useEffect(() => {
    if (!playerInstance.current && playerRef.current && section !== "movies") {
      playerInstance.current = videojs(playerRef.current, { controls: true, fluid: true });
    }
  }, [section]);

  // Update Video.js source
  useEffect(() => {
    if (playerInstance.current && currentUrl && section !== "movies") {
      playerInstance.current.pause();
      playerInstance.current.src({ src: currentUrl });
      playerInstance.current.load();
    }
  }, [currentUrl, section]);

  const handleSectionChange = (newSection) => {
    setSection(newSection);

    if (newSection === "live" && liveChannels.length) setCurrentUrl(liveChannels[0].url);
    if (newSection === "movies" && MOVIES.length) setCurrentMovie(MOVIES[0]);
    if (newSection === "tvshows" && Object.keys(tvShowsGrouped).length) {
      const firstShow = Object.keys(tvShowsGrouped)[0];
      setSelectedTvShow(firstShow);
      const firstSeason = Object.keys(tvShowsGrouped[firstShow])[0];
      setCurrentUrl(tvShowsGrouped[firstShow][firstSeason][0].url);

      const collapseStates = {};
      Object.keys(tvShowsGrouped[firstShow]).forEach((season) => (collapseStates[season] = true));
      setSeasonCollapse(collapseStates);
    }
  };

  const toggleSeason = (season) => {
    setSeasonCollapse((prev) => ({ ...prev, [season]: !prev[season] }));
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${BACKGROUND_GIF})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "260px" : "0px",
          backgroundColor: "rgba(26,26,26,0.95)",
          color: "#fff",
          flexShrink: 0,
          transition: "width 0.3s",
          padding: sidebarOpen ? "20px" : "0px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {sidebarOpen && (
          <>
            <img
              src={OLIVE_LOGO}
              alt="Olive Logo"
              style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "10px" }}
            />
            <h1 style={{ color: "#fff", fontFamily: "'Brush Script MT', cursive", fontSize: "32px", marginBottom: "20px" }}>
              OlivePlayer
            </h1>

            {/* Live TV */}
            {section === "live" &&
              liveChannels.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentUrl(ch.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    backgroundColor: currentUrl === ch.url ? "#555" : "#333",
                    width: "100%",
                  }}
                >
                  {ch.name}
                </div>
              ))}

            {/* Movies */}
            {section === "movies" &&
              MOVIES.map((mv, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentMovie(mv)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    backgroundColor: currentMovie?.url === mv.url ? "#555" : "#333",
                    width: "100%",
                  }}
                >
                  {mv.name}
                </div>
              ))}

            {/* TV Shows */}
            {section === "tvshows" &&
              Object.keys(tvShowsGrouped).map((showName, i) => (
                <div key={i} style={{ marginBottom: "10px", width: "100%" }}>
                  <h3 style={{ color: "#fff", cursor: "pointer" }} onClick={() => setSelectedTvShow(showName)}>
                    {showName}
                  </h3>
                  {selectedTvShow === showName &&
                    Object.keys(tvShowsGrouped[showName]).map((season) => (
                      <div key={season} style={{ marginLeft: "10px" }}>
                        <h4
                          style={{ color: "#ccc", cursor: "pointer" }}
                          onClick={() => toggleSeason(season)}
                        >
                          {season}
                        </h4>
                        {seasonCollapse[season] &&
                          tvShowsGrouped[showName][season].map((ep, idx) => (
                            <div
                              key={idx}
                              onClick={() => setCurrentUrl(ep.url)}
                              style={{
                                cursor: "pointer",
                                padding: "6px",
                                marginBottom: "4px",
                                borderRadius: "4px",
                                backgroundColor: currentUrl === ep.url ? "#555" : "#333",
                              }}
                            >
                              {ep.name}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              ))}
          </>
        )}
      </div>

      {/* Main player area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
        {/* Section buttons */}
        <div style={{ marginBottom: "15px" }}>
          <button onClick={() => handleSectionChange("live")} style={{ marginRight: "10px" }}>
            Live TV
          </button>
          <button onClick={() => handleSectionChange("movies")} style={{ marginRight: "10px" }}>
            Movies
          </button>
          <button onClick={() => handleSectionChange("tvshows")}>TV Shows</button>
        </div>

        {/* Video / iframe display */}
        {section === "movies" && currentMovie && (
          <div className="iframe-container" style={{ position: "relative", width: "80%", height: "450px" }}>
            <div id="loader" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "20px", color: "#fff" }}>
              Loading...
            </div>
            <iframe
              id="iframe"
              src={currentMovie.url}
              style={{ display: "none", width: "100%", height: "100%", border: "none" }}
              onLoad={() => {
                document.getElementById("loader").style.display = "none";
                document.getElementById("iframe").style.display = "block";
              }}
            ></iframe>
          </div>
        )}

        {section !== "movies" && (
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            style={{ width: "80%", height: "450px" }}
            controls
            autoPlay
          ></video>
        )}
      </div>
    </div>
  );
}
