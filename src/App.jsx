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
    "https://gist.githubusercontent.com/cirrusUK/f2ec33786c4820e4b4ac4670b2a8afea/raw/320031be25bb03b3b1d5fac9f93b19c82a7e9cef/imdb250.m3u",
};

// Detect media type based on URL
const getMediaType = (url) => {
  if (url.endsWith(".m3u8")) return "application/x-mpegURL";
  if (url.endsWith(".mp4")) return "video/mp4";
  return "video/mp4"; // fallback
};

export default function OlivePlayer() {
  const liveRef = useRef(null);
  const moviesRef = useRef(null);
  const tvRef = useRef(null);

  const livePlayer = useRef(null);
  const moviesPlayer = useRef(null);
  const tvPlayer = useRef(null);

  const [section, setSection] = useState("live");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [liveChannels, setLiveChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvShowsGrouped, setTvShowsGrouped] = useState({});
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  const [currentLiveUrl, setCurrentLiveUrl] = useState("");
  const [currentMovieUrl, setCurrentMovieUrl] = useState("");
  const [currentTvUrl, setCurrentTvUrl] = useState("");

  // Parse TV show names
  const parseTvShowName = (name) => {
    const match = name.match(/^(.*?)\s*(?:\(\d{4}\))?\s*S(\d+)E(\d+)/i);
    if (match) {
      return {
        showName: match[1].trim(),
        season: "S" + match[2],
        episode: "E" + match[3],
        fullName: name,
      };
    }
    return { showName: name, season: "S01", episode: "", fullName: name };
  };

  // Fetch all playlists
  useEffect(() => {
    const loadPlaylist = async (url, setter, firstUrlSetter) => {
      const res = await fetch(url);
      const text = await res.text();
      const parsed = parse(text);
      const list = parsed.items
        .filter((i) => i.url)
        .map((ch) => ({
          name: ch.name || "Unknown",
          url: encodeURI(ch.url),
          type: getMediaType(ch.url),
        }));
      setter(list);
      if (list.length) firstUrlSetter(list[0].url);
    };

    loadPlaylist(PLAYLISTS.live, setLiveChannels, setCurrentLiveUrl);
    loadPlaylist(PLAYLISTS.movies, setMovies, setCurrentMovieUrl);

    // TV Shows with grouping
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
              url: encodeURI(ch.url),
              type: getMediaType(ch.url),
            });
          });
        setTvShowsGrouped(grouped);

        // Select first show
        const firstShow = Object.keys(grouped)[0];
        if (firstShow) {
          setSelectedTvShow(firstShow);
          const firstSeason = Object.keys(grouped[firstShow])[0];
          setCurrentTvUrl(grouped[firstShow][firstSeason][0].url);
          const collapseStates = {};
          Object.keys(grouped[firstShow]).forEach((s) => (collapseStates[s] = true));
          setSeasonCollapse(collapseStates);
        }
      });
  }, []);

  // Initialize Video.js
  useEffect(() => {
    if (liveRef.current && !livePlayer.current) livePlayer.current = videojs(liveRef.current, { controls: true, fluid: true });
    if (moviesRef.current && !moviesPlayer.current) moviesPlayer.current = videojs(moviesRef.current, { controls: true, fluid: true });
    if (tvRef.current && !tvPlayer.current) tvPlayer.current = videojs(tvRef.current, { controls: true, fluid: true });
  }, []);

  const updatePlayer = (player, url, type) => {
    if (!player) return;
    player.pause();
    player.src({ src: url, type });
    player.load();
  };

  useEffect(() => updatePlayer(livePlayer.current, currentLiveUrl, getMediaType(currentLiveUrl)), [currentLiveUrl]);
  useEffect(() => updatePlayer(moviesPlayer.current, currentMovieUrl, getMediaType(currentMovieUrl)), [currentMovieUrl]);
  useEffect(() => updatePlayer(tvPlayer.current, currentTvUrl, getMediaType(currentTvUrl)), [currentTvUrl]);

  const handleSectionChange = (newSection) => {
    setSection(newSection);
    livePlayer.current?.pause();
    moviesPlayer.current?.pause();
    tvPlayer.current?.pause();

    if (newSection === "live" && liveChannels.length) setCurrentLiveUrl(liveChannels[0].url);
    if (newSection === "movies" && movies.length) setCurrentMovieUrl(movies[0].url);
    if (newSection === "tvshows" && Object.keys(tvShowsGrouped).length) {
      const firstShow = Object.keys(tvShowsGrouped)[0];
      setSelectedTvShow(firstShow);
      const firstSeason = Object.keys(tvShowsGrouped[firstShow])[0];
      setCurrentTvUrl(tvShowsGrouped[firstShow][firstSeason][0].url);
    }
  };

  const toggleSeason = (season) => setSeasonCollapse((prev) => ({ ...prev, [season]: !prev[season] }));

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundImage: `url(${BACKGROUND_GIF})`, backgroundSize: "cover", backgroundPosition: "center", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? "260px" : "0px", backgroundColor: "rgba(26,26,26,0.95)", color: "#fff", flexShrink: 0, transition: "width 0.3s", padding: sidebarOpen ? "20px" : "0px", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto" }}>
        {sidebarOpen && (
          <>
            <img src={OLIVE_LOGO} alt="Olive Logo" style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "10px" }} />
            <h1 style={{ color: "#fff", fontFamily: "'Brush Script MT', cursive", fontSize: "32px", marginBottom: "20px" }}>OlivePlayer</h1>

            {section === "live" && liveChannels.map((ch, i) => (
              <div key={i} onClick={() => setCurrentLiveUrl(ch.url)} style={{ cursor: "pointer", padding: "10px", marginBottom: "10px", borderRadius: "6px", backgroundColor: currentLiveUrl === ch.url ? "#555" : "#333", width: "100%" }}>{ch.name}</div>
            ))}

            {section === "movies" && movies.map((mv, i) => (
              <div key={i} onClick={() => setCurrentMovieUrl(mv.url)} style={{ cursor: "pointer", padding: "10px", marginBottom: "10px", borderRadius: "6px", backgroundColor: currentMovieUrl === mv.url ? "#555" : "#333", width: "100%" }}>{mv.name}</div>
            ))}

            {section === "tvshows" && Object.keys(tvShowsGrouped).map((show, idx) => (
              <div key={idx} onClick={() => {
                setSelectedTvShow(show);
                const firstSeason = Object.keys(tvShowsGrouped[show])[0];
                setCurrentTvUrl(tvShowsGrouped[show][firstSeason][0].url);
                const collapseStates = {};
                Object.keys(tvShowsGrouped[show]).forEach((s) => collapseStates[s] = true);
                setSeasonCollapse(collapseStates);
              }} style={{ cursor: "pointer", padding: "10px", marginBottom: "10px", borderRadius: "6px", width: "100%", backgroundColor: selectedTvShow === show ? "#555" : "#333" }}>{show}</div>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <button onClick={() => handleSectionChange("live")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "live" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Live TV</button>
          <button onClick={() => handleSectionChange("movies")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "movies" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Movies</button>
          <button onClick={() => handleSectionChange("tvshows")} style={{ margin: "0 10px", padding: "10px 20px", background: section === "tvshows" ? "#28a745" : "#333", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>TV Shows</button>
        </div>

        <video ref={liveRef} className="video-js vjs-big-play-centered" controls playsInline style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "live" ? "block" : "none" }} />
        <video ref={moviesRef} className="video-js vjs-big-play-centered" controls playsInline style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "movies" ? "block" : "none" }} />
        <video ref={tvRef} className="video-js vjs-big-play-centered" controls playsInline style={{ width: "95%", maxWidth: "1400px", height: "700px", backgroundColor: "#000", display: section === "tvshows" ? "block" : "none" }} />

        {/* TV show episodes */}
        {section === "tvshows" && selectedTvShow && (
          <div style={{ marginTop: "20px", maxHeight: "400px", overflowY: "auto", width: "95%", backgroundColor: "rgba(26,26,26,0.8)", padding: "10px", borderRadius: "8px", color: "#fff" }}>
            {Object.keys(tvShowsGrouped[selectedTvShow]).map((season) => (
              <div key={season}>
                <div onClick={() => toggleSeason(season)} style={{ cursor: "pointer", padding: "6px", backgroundColor: "#444", marginTop: "5px", borderRadius: "4px" }}>{season}</div>
                {!seasonCollapse[season] && tvShowsGrouped[selectedTvShow][season].map((ep, idx) => (
                  <div key={idx} onClick={() => setCurrentTvUrl(ep.url)} style={{ cursor: "pointer", padding: "6px", marginLeft: "10px", marginTop: "2px", borderRadius: "4px", color: "#fff", backgroundColor: currentTvUrl === ep.url ? "#555" : "#222" }}>{ep.name}</div>
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
