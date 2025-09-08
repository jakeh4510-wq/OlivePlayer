import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

const PLAYLISTS = {
  live: "https://iptv-org.github.io/iptv/index.m3u",
  tvshows:
    "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
  movies:
    "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/top-movies.m3u",
};

export default function OlivePlayer() {
  const livePlayerRef = useRef(null);
  const moviesPlayerRef = useRef(null);
  const tvPlayerRef = useRef(null);

  const liveInstance = useRef(null);
  const moviesInstance = useRef(null);
  const tvInstance = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [section, setSection] = useState("live");

  const [liveChannels, setLiveChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvShowsGrouped, setTvShowsGrouped] = useState({});
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  const [currentLiveUrl, setCurrentLiveUrl] = useState("");
  const [currentMovieUrl, setCurrentMovieUrl] = useState("");
  const [currentTvUrl, setCurrentTvUrl] = useState("");

  // Parse TV show names into show/season/episode
  const parseTvShowName = (name) => {
    const match = name.match(/^(.*?)\s*(\(\d{4}\))?\s*S(\d+)E(\d+)/i);
    if (match) {
      return {
        showName: match[1].trim(),
        season: "S" + match[3],
        episode: "E" + match[4],
        fullName: name,
      };
    } else {
      return { showName: name, season: "S01", episode: "", fullName: name };
    }
  };

  // Fetch playlists
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
        if (live.length) setCurrentLiveUrl(live[0].url);
      });

    // Movies
    fetch(PLAYLISTS.movies)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parse(text);
        const movieList = parsed.items
          .filter((i) => i.url)
          .map((ch) => ({
            name: ch.name || "Unknown",
            url: ch.url,
            type: ch.url.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          }));
        setMovies(movieList);
        if (movieList.length) setCurrentMovieUrl(movieList[0].url);
      });

    // TV Shows
    fetch(PLAYLISTS.tvshows)
      .then((res) => res.text())
      .then((text) => {
        const grouped = {};
        parse(text)
          .items.filter((i) => i.url)
          .forEach((ch) => {
            const { showName, season, fullName } = parseTvShowName(ch.name);
            if (!grouped[showName]) grouped[showName] = {};
            if (!grouped[showName][season]) grouped[showName][season] = [];
            grouped[showName][season].push({
              name: fullName,
              url: ch.url,
              type: ch.url.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
            });
          });
        setTvShowsGrouped(grouped);
      });
  }, []);

  // Initialize players
  useEffect(() => {
    if (!liveInstance.current && livePlayerRef.current)
      liveInstance.current = videojs(livePlayerRef.current, { controls: true, fluid: true });
    if (!moviesInstance.current && moviesPlayerRef.current)
      moviesInstance.current = videojs(moviesPlayerRef.current, { controls: true, fluid: true });
    if (!tvInstance.current && tvPlayerRef.current)
      tvInstance.current = videojs(tvPlayerRef.current, { controls: true, fluid: true });
  }, []);

  // Update player sources with big play button reset
  const updatePlayerSource = (player, url) => {
    if (!player) return;
    player.pause();
    player.src({ src: url });
    player.poster(""); // reset UI to show big play button
    player.load();
  };

  // Live TV source update
  useEffect(() => {
    updatePlayerSource(liveInstance.current, currentLiveUrl);
  }, [currentLiveUrl]);

  // Movies source update
  useEffect(() => {
    updatePlayerSource(moviesInstance.current, currentMovieUrl);
  }, [currentMovieUrl]);

  // TV Shows source update
  useEffect(() => {
    updatePlayerSource(tvInstance.current, currentTvUrl);
  }, [currentTvUrl]);

  const handleSectionChange = (newSection) => {
    setSection(newSection);

    // Pause all players
    liveInstance.current?.pause();
    moviesInstance.current?.pause();
    tvInstance.current?.pause();

    if (newSection === "live" && liveChannels.length) setCurrentLiveUrl(liveChannels[0].url);
    if (newSection === "movies" && movies.length) setCurrentMovieUrl(movies[0].url);
    if (newSection === "tvshows" && Object.keys(tvShowsGrouped).length) {
      const firstShow = Object.keys(tvShowsGrouped)[0];
      setSelectedTvShow(firstShow);
      const firstSeason = Object.keys(tvShowsGrouped[firstShow])[0];
      setCurrentTvUrl(tvShowsGrouped[firstShow][firstSeason][0].url);

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
                  onClick={() => setCurrentLiveUrl(ch.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    backgroundColor: currentLiveUrl === ch.url ? "#555" : "#333",
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
                  onClick={() => setCurrentMovieUrl(mv.url)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                    backgroundColor: currentMovieUrl === mv.url ? "#555" : "#333",
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
                    setCurrentTvUrl(tvShowsGrouped[show][firstSeason][0].url);
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
        {/* Section buttons */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => handleSectionChange("live")}
            style={{ margin: "0 10px", padding: "10px 20px", background: section === "live" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Live TV
          </button>
          <button
            onClick={() => handleSectionChange("movies")}
            style={{ margin: "0 10px", padding: "10px 20px", background: section === "movies" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Movies
          </button>
          <button
            onClick={() => handleSectionChange("tvshows")}
            style={{ margin: "0 10px", padding: "10px 20px", background: section === "tvshows" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            TV Shows
          </button>
        </div>

        {/* Video players */}
        <video
          ref={livePlayerRef}
          className="video-js vjs-big-play-centered"
          controls
          playsInline
          style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "live" ? "block" : "none" }}
        />
        <video
          ref={moviesPlayerRef}
          className="video-js vjs-big-play-centered"
          controls
          playsInline
          style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "movies" ? "block" : "none" }}
        />
        <video
          ref={tvPlayerRef}
          className="video-js vjs-big-play-centered"
          controls
          playsInline
          style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "tvshows" ? "block" : "none" }}
        />

        {/* TV Shows episodes */}
        {section === "tvshows" && selectedTvShow && (
          <div
            style={{
              marginTop: "20px",
              width: "95%",
              maxWidth: "1400px",
              flex: 1,
              overflowY: "auto",
              maxHeight: "300px",
              padding: "10px",
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: "6px",
            }}
          >
            {Object.keys(tvShowsGrouped[selectedTvShow]).map((season) => (
              <div key={season} style={{ marginBottom: "10px" }}>
                <div
                  onClick={() => toggleSeason(season)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    backgroundColor: "#444",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                >
                  {season} {seasonCollapse[season] ? "▼" : "▶"}
                </div>
                {!seasonCollapse[season] &&
                  tvShowsGrouped[selectedTvShow][season].map((ep, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentTvUrl(ep.url)}
                      style={{
                        cursor: "pointer",
                        padding: "6px",
                        marginLeft: "10px",
                        marginTop: "2px",
                        borderRadius: "4px",
                        color: "#fff",
                        backgroundColor: currentTvUrl === ep.url ? "#555" : "#222",
                      }}
                    >
                      {ep.name}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: sidebarOpen ? "280px" : "20px",
          padding: "8px 12px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {sidebarOpen ? "Hide Sidebar" : "☰ Show Sidebar"}
      </button>
    </div>
  );
}
