import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Hydra Movies M3U
const MOVIES_M3U = `
#EXTM3U
#EXTINF:0,195388-watch-metallica-live-shit-binge-amp-purge-seattle-1993-online
https://hyhd.org/embed/tt1700430/
#EXTINF:0,195411-watch-nostalgia-2018-online
https://hyhd.org/embed/tt10160758/
#EXTINF:0,195404-watch-dial-h-i-s-t-o-r-y-1997-online
https://hyhd.org/embed/tt0367655/
#EXTINF:0,195408-watch-whaledreamers-2006-online
https://hyhd.org/embed/tt0867160/
#EXTINF:0,195390-watch-a-leap-in-the-dark-1980-online
https://hyhd.org/embed/tt0079845/
#EXTINF:0,195394-watch-snnike-2025-online
https://hyhd.org/embed/tt34807878/
#EXTINF:0,195401-watch-a-film-like-any-other-1968-online
https://hyhd.org/embed/tt0063736/
#EXTINF:0,195406-watch-a-father-for-brittany-1998-online
https://hydrahd.io/movie/195406-watch-a-father-for-brittany-1998-online
#EXTINF:0,195389-watch-inspector-zende-2025-online
https://hydrahd.io/movie/195389-watch-inspector-zende-2025-online
#EXTINF:0,195405-watch-noi-uomini-duri-1987-online
https://hyhd.org/embed/tt0093645/
`;

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
  const [movies, setMovies] = useState([]);
  const [tvShowsGrouped, setTvShowsGrouped] = useState({});
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  const [currentUrl, setCurrentUrl] = useState("");

  // Parse hardcoded movies M3U manually
  const parseMoviesM3U = (m3u) => {
    const lines = m3u.split("\n").filter((l) => l.trim() !== "");
    const movieList = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF:")) {
        const name = lines[i].split(",")[1] || "Unknown";
        const url = lines[i + 1] || "";
        if (url) movieList.push({ name, url });
      }
    }
    return movieList;
  };

  useEffect(() => {
    // Load Live TV
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

    // Load Movies
    const movieList = parseMoviesM3U(MOVIES_M3U);
    setMovies(movieList);

    // Load TV Shows
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

  // Initialize Video.js only for non-Movies sections
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
    if (newSection === "movies" && movies.length) setCurrentUrl(movies[0].url);
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

            {section === "movies" &&
              movies.map((mv, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentUrl(mv.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    backgroundColor: currentUrl === mv.url ? "#555" : "#333",
                    width: "100%",
                  }}
                >
                  {mv.name}
                </div>
              ))}

            {section === "tvshows" &&
              Object.keys(tvShowsGrouped).map((show, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTvShow(show);
                    const firstSeason = Object.keys(tvShowsGrouped[show])[0];
                    setCurrentUrl(tvShowsGrouped[show][firstSeason][0].url);
                    const collapseStates = {};
                    Object.keys(tvShowsGrouped[show]).forEach((season) => (collapseStates[season] = true));
                    setSeasonCollapse(collapseStates);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    width: "100%",
                    backgroundColor: selectedTvShow === show ? "#555" : "#333",
                  }}
                >
                  {show}
                </div>
              ))}
          </>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => handleSectionChange("live")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "live" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Live TV
          </button>
          <button onClick={() => handleSectionChange("movies")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "movies" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Movies
          </button>
          <button onClick={() => handleSectionChange("tvshows")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "tvshows" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            TV Shows
          </button>
        </div>

        {/* Video player or iframe */}
        {section === "movies" && currentUrl ? (
          <div style={{ width: "95%", maxWidth: "1400px", height: "700px" }}>
            <iframe
              src={currentUrl}
              title="Movie Player"
              width="100%"
              height="100%"
              style={{ border: "none", borderRadius: "8px", backgroundColor: "#000" }}
              allowFullScreen
            />
          </div>
        ) : (
          <video
            ref={playerRef}
            className="video-js vjs-big-play-centered"
            controls
            playsInline
            style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000" }}
          />
        )}

        {section === "tvshows" && selectedTvShow && (
          <div style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto", width: "95%", backgroundColor: "rgba(26,26,26,0.8)", padding: "10px", borderRadius: "8px", color: "#fff" }}>
            {Object.keys(tvShowsGrouped[selectedTvShow]).map((season) => (
              <div key={season}>
                <div onClick={() => toggleSeason(season)} style={{ cursor: "pointer", padding: "6px", backgroundColor: "#444", marginTop: "5px", borderRadius: "4px" }}>
                  {season}
                </div>
                {!seasonCollapse[season] &&
                  tvShowsGrouped[selectedTvShow][season].map((ep, idx) => (
                    <div key={idx} onClick={() => setCurrentUrl(ep.url)} style={{ cursor: "pointer", padding: "6px", marginLeft: "10px", marginTop: "2px", borderRadius: "4px", color: "#fff", backgroundColor: currentUrl === ep.url ? "#555" : "#222" }}>
                      {ep.name}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "absolute", top: "20px", left: sidebarOpen ? "280px" : "20px", padding: "8px 12px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", zIndex: 1000 }}>
        {sidebarOpen ? "Hide Sidebar" : "☰ Show Sidebar"}
      </button>
    </div>
  );
}
