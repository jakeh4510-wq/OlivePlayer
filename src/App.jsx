import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Movies list with Hydra embed links
const MOVIES = [
  { name: "Metallica Live Shit Binge & Purge (1993)", url: "https://hyhd.org/embed/tt1700430/", img: "" },
  { name: "Nostalgia (2018)", url: "https://hyhd.org/embed/tt10160758/", img: "" },
  { name: "Dial H I S T O R Y (1997)", url: "https://hyhd.org/embed/tt0367655/", img: "" },
  { name: "Whaledreamers (2006)", url: "https://hyhd.org/embed/tt0867160/", img: "" },
  { name: "A Leap in the Dark (1980)", url: "https://hyhd.org/embed/tt0079845/", img: "" },
  { name: "Snnike (2025)", url: "https://hyhd.org/embed/tt34807878/", img: "" },
  { name: "A Film Like Any Other (1968)", url: "https://hyhd.org/embed/tt0063736/", img: "" },
  { name: "A Father for Brittany (1998)", url: "https://hydrahd.io/movie/195406-watch-a-father-for-brittany-1998-online", img: "" },
  { name: "Inspector Zende (2025)", url: "https://hydrahd.io/movie/195389-watch-inspector-zende-2025-online", img: "" },
  { name: "Noi Uomini Duri (1987)", url: "https://hyhd.org/embed/tt0093645/", img: "" },
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

  const [currentUrl, setCurrentUrl] = useState("");
  const [currentMovie, setCurrentMovie] = useState(null);

  // Load Live TV
  useEffect(() => {
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
  }, []);

  // Load TV Shows
  useEffect(() => {
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
            if (!grouped[showName][season]) grouped[season] = [];
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

  // Initialize Video.js for Live TV & TV Shows
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
    if (newSection === "movies") setCurrentMovie(null); // Reset movie selection
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
              MOVIES.map((mv, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "15px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundColor: currentMovie?.url === mv.url ? "#555" : "#333",
                    padding: "10px",
                  }}
                >
                  <h4 style={{ color: "#fff", marginBottom: "10px" }}>{mv.name}</h4>

                  {/* Movie placeholder using Codegena iframe */}
                  <div
                    className="codegena_iframe"
                    data-src={mv.url}
                    data-img={mv.img || "https://via.placeholder.com/680x400?text=Movie+Poster"}
                    style={{ height: "400px", width: "680px" }}
                    data-responsive="true"
                  ></div>

                  {/* Load button */}
                  <button
                    onClick={() => {
                      setCurrentMovie(mv);
                      window.load_iframe(i + 1);
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Play
                  </button>
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

        {/* Video player */}
        {section !== "movies" && (
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

      {/* Codegena script */}
      <script src="https://codegena.com/assets/js/async-iframe.js"></script>
    </div>
  );
}
