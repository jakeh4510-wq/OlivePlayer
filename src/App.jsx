import React, { useState, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { parse } from "iptv-playlist-parser";

/**
 * OlivePlayer — Live TV (video.js), Movies (iframe OR video.js if direct stream), TV Shows
 *
 * Notes:
 * - Movies array can contain { name, url, directUrl } where directUrl is an mp4/m3u8 stream.
 * - If directUrl exists we play with video.js (same as Live TV). Otherwise we load the embed page in iframe.
 * - iframe only mounts after a movie is clicked. Loader hides when iframe onLoad fires.
 * - If an embed page blocks being framed (X-Frame-Options/CSP) it will remain blank — see debugging notes below.
 */

const OLIVE_LOGO =
  "https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0";

const BACKGROUND_GIF = "https://wallpaperaccess.com/full/869923.gif";

// Movies: url = embed page; directUrl (optional) = direct stream (.mp4/.m3u8)
const MOVIES = [
  { name: "Metallica Live 1993", url: "https://hyhd.org/embed/tt1700430/", directUrl: null },
  { name: "Nostalgia (2018)", url: "https://hyhd.org/embed/tt10160758/", directUrl: null },
  { name: "Dial H I S T O R Y (1997)", url: "https://hyhd.org/embed/tt0367655/", directUrl: null },
  { name: "Whaledreamers (2006)", url: "https://hyhd.org/embed/tt0867160/", directUrl: null },
  { name: "A Leap in the Dark (1980)", url: "https://hyhd.org/embed/tt0079845/", directUrl: null },
  { name: "Snnike (2025)", url: "https://hyhd.org/embed/tt34807878/", directUrl: null },
  { name: "A Film Like Any Other (1968)", url: "https://hyhd.org/embed/tt0063736/", directUrl: null },
  { name: "A Father for Brittany (1998)", url: "https://hydrahd.io/movie/195406-watch-a-father-for-brittany-1998-online", directUrl: null },
  { name: "Inspector Zende (2025)", url: "https://hydrahd.io/movie/195389-watch-inspector-zende-2025-online", directUrl: null },
  { name: "Noi Uomini Duri (1987)", url: "https://hyhd.org/embed/tt0093645/", directUrl: null },
];

const PLAYLISTS = {
  live: "https://iptv-org.github.io/iptv/index.m3u",
  tvshows:
    "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u",
};

export default function OlivePlayer() {
  // video.js refs
  const videoRef = useRef(null);
  const vjsPlayer = useRef(null);

  // iframe refs for movies (only one iframe mounted at a time)
  const iframeRef = useRef(null);
  const loaderRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [section, setSection] = useState("live"); // 'live' | 'movies' | 'tvshows'
  const [liveChannels, setLiveChannels] = useState([]);
  const [tvShowsGrouped, setTvShowsGrouped] = useState({});
  const [selectedTvShow, setSelectedTvShow] = useState(null);
  const [seasonCollapse, setSeasonCollapse] = useState({});

  // state for player sources
  const [currentStreamUrl, setCurrentStreamUrl] = useState(""); // used by video.js (live & direct movie streams)
  const [currentMovie, setCurrentMovie] = useState(null); // selected movie object for iframe/embed playback

  // -----------------------
  // Load playlists on mount
  // -----------------------
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
        if (live.length) {
          setCurrentStreamUrl(live[0].url); // initialize video.js first stream
        }
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

  // -----------------------
  // Initialize video.js once
  // -----------------------
  useEffect(() => {
    if (!vjsPlayer.current && videoRef.current) {
      vjsPlayer.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        autoplay: false,
      });

      vjsPlayer.current.on("error", () => {
        console.warn("video.js player error:", vjsPlayer.current.error());
      });
    }

    return () => {
      if (vjsPlayer.current) {
        vjsPlayer.current.dispose();
        vjsPlayer.current = null;
      }
    };
  }, []);

  // whenever currentStreamUrl changes, update video.js source and play (if visible)
  useEffect(() => {
    if (vjsPlayer.current && currentStreamUrl) {
      // Pause/hide iframe if any
      if (iframeRef.current) {
        try {
          iframeRef.current.src = "about:blank";
        } catch (e) { /* ignore cross-origin */ }
      }

      vjsPlayer.current.pause();
      vjsPlayer.current.src({ src: currentStreamUrl });
      // Try to play — browsers may block autoplay until user interacts
      vjsPlayer.current.load();
      vjsPlayer.current.play().catch(() => {
        // autoplay may be blocked; that's okay — user interaction will allow it
        console.log("Autoplay blocked or requires user interaction");
      });
      console.log("Playing stream in video.js:", currentStreamUrl);
    }
  }, [currentStreamUrl]);

  // -----------------------
  // Section handling
  // -----------------------
  const handleSectionChange = (newSection) => {
    setSection(newSection);

    if (newSection === "live" && liveChannels.length) {
      setCurrentMovie(null);
      setCurrentStreamUrl(liveChannels[0].url);
    }

    if (newSection === "movies") {
      // clear stream and keep player ready — will either play direct movie stream or show iframe after click
      setCurrentStreamUrl("");
      setCurrentMovie(null);
      // hide iframe if previously visible
      if (iframeRef.current) {
        iframeRef.current.src = "about:blank";
        iframeRef.current.style.display = "none";
        if (loaderRef.current) loaderRef.current.style.display = "none";
      }
    }

    if (newSection === "tvshows" && Object.keys(tvShowsGrouped).length) {
      const firstShow = Object.keys(tvShowsGrouped)[0];
      setSelectedTvShow(firstShow);
      const firstSeason = Object.keys(tvShowsGrouped[firstShow])[0];
      setCurrentStreamUrl(tvShowsGrouped[firstShow][firstSeason][0].url);
      setCurrentMovie(null);
      const collapseStates = {};
      Object.keys(tvShowsGrouped[firstShow]).forEach((season) => (collapseStates[season] = true));
      setSeasonCollapse(collapseStates);
    }
  };

  // -----------------------
  // Play a movie (click handler)
  // -----------------------
  const playMovie = (movie) => {
    console.log("Requested movie:", movie.name);
    setCurrentMovie(movie);

    // If movie has a direct stream (mp4/m3u8) use video.js
    if (movie.directUrl) {
      console.log("Movie has direct stream, using video.js:", movie.directUrl);
      setCurrentStreamUrl(movie.directUrl);
      // ensure video element is visible (we render both but hide via CSS below)
      return;
    }

    // else: we need to load the embed page in iframe
    // Reset video.js source (stop playback)
    if (vjsPlayer.current) {
      try {
        vjsPlayer.current.pause();
        vjsPlayer.current.currentTime(0);
      } catch (e) {}
    }

    // Show loader and then set iframe src
    requestAnimationFrame(() => {
      if (loaderRef.current) loaderRef.current.style.display = "block";
      if (iframeRef.current) {
        iframeRef.current.style.display = "none";
        // set src AFTER short tick to ensure loader shows
        setTimeout(() => {
          try {
            iframeRef.current.src = movie.url;
          } catch (e) {
            console.warn("Failed to set iframe src:", e);
            if (loaderRef.current) loaderRef.current.style.display = "none";
          }
        }, 50);
      }
    });
  };

  // iframe onLoad handler
  const onIframeLoad = () => {
    // when iframe finishes loading, hide loader and show iframe
    if (loaderRef.current) loaderRef.current.style.display = "none";
    if (iframeRef.current) iframeRef.current.style.display = "block";
    console.log("iframe loaded (may still be blank if site blocks framing).");
  };

  // -----------------------
  // Debug helper: test if iframe blocked
  // -----------------------
  const checkEmbedBlocked = (embedUrl) => {
    // best bet: open in new tab manually to confirm. We can't reliably detect headers client-side due to CORS
    console.log("If iframe stays white, open this URL in a new tab to verify:", embedUrl);
  };

  // -----------------------
  // render
  // -----------------------
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
          width: sidebarOpen ? 260 : 0,
          backgroundColor: "rgba(26,26,26,0.95)",
          color: "#fff",
          flexShrink: 0,
          transition: "width 0.3s",
          padding: sidebarOpen ? 20 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
      >
        {sidebarOpen && (
          <>
            <img src={OLIVE_LOGO} alt="Olive Logo" style={{ width: 120, height: 120, borderRadius: "50%", marginBottom: 10 }} />
            <h1 style={{ color: "#fff", fontFamily: "'Brush Script MT', cursive", fontSize: 32, marginBottom: 20 }}>
              OlivePlayer
            </h1>

            {/* Live */}
            {section === "live" &&
              liveChannels.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setCurrentMovie(null);
                    setCurrentStreamUrl(ch.url);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 6,
                    backgroundColor: currentStreamUrl === ch.url ? "#555" : "#333",
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
                  onClick={() => playMovie(mv)}
                  style={{
                    cursor: "pointer",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 6,
                    backgroundColor: currentMovie?.url === mv.url ? "#555" : "#333",
                    width: "100%",
                  }}
                >
                  {mv.name}
                </div>
              ))}

            {/* TV Shows */}
            {section === "tvshows" &&
              Object.keys(tvShowsGrouped).map((show, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTvShow(show);
                    const firstSeason = Object.keys(tvShowsGrouped[show])[0];
                    setCurrentStreamUrl(tvShowsGrouped[show][firstSeason][0].url);
                    const collapseStates = {};
                    Object.keys(tvShowsGrouped[show]).forEach((season) => (collapseStates[season] = true));
                    setSeasonCollapse(collapseStates);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 6,
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => handleSectionChange("live")} style={{ margin: "0 10px", padding: "10px 20px" }}>
            Live TV
          </button>
          <button onClick={() => handleSectionChange("movies")} style={{ margin: "0 10px", padding: "10px 20px" }}>
            Movies
          </button>
          <button onClick={() => handleSectionChange("tvshows")} style={{ margin: "0 10px", padding: "10px 20px" }}>
            TV Shows
          </button>
        </div>

        {/* Player area: both video.js element and iframe container exist, but we show/hide depending on section & mode */}
        <div style={{ width: "95%", maxWidth: 1400, height: 700, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Video.js element (used for Live TV, TV Shows, and direct movie streams) */}
          <div style={{ width: "100%", height: "100%", display: section === "movies" && !currentMovie?.directUrl ? "none" : "block" }}>
            <video ref={videoRef} className="video-js vjs-big-play-centered" style={{ width: "100%", height: "100%", backgroundColor: "#000" }} />
          </div>

          {/* Iframe container for embed pages (only used when currentMovie exists and has no directUrl) */}
          {section === "movies" && currentMovie && !currentMovie.directUrl && (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <div ref={loaderRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 20, color: "#fff", zIndex: 2 }}>
                Loading...
              </div>
              <iframe
                ref={iframeRef}
                title={currentMovie.name}
                src=""
                style={{ display: "none", width: "100%", height: "100%", border: "none" }}
                onLoad={onIframeLoad}
                // allow autoplay & fullscreen (some players require these)
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                sandbox="" // leave sandbox empty or remove if you need full functionality; sandbox may restrict embed JS
              />
            </div>
          )}

          {/* when movies selected but no movie chosen yet */}
          {section === "movies" && !currentMovie && (
            <div style={{ color: "#fff", fontSize: 18 }}>Select a movie from the left to play</div>
          )}
        </div>

        {/* TV Shows list when selected */}
        {section === "tvshows" && selectedTvShow && (
          <div style={{ marginTop: 20, maxHeight: 300, overflowY: "auto", width: "95%", backgroundColor: "rgba(26,26,26,0.8)", padding: 10, borderRadius: 8, color: "#fff" }}>
            {Object.keys(tvShowsGrouped[selectedTvShow]).map((season) => (
              <div key={season}>
                <div onClick={() => toggleSeason(season)} style={{ cursor: "pointer", padding: 6, backgroundColor: "#444", marginTop: 5, borderRadius: 4 }}>
                  {season}
                </div>
                {seasonCollapse[season] &&
                  tvShowsGrouped[selectedTvShow][season].map((ep, idx) => (
                    <div key={idx} onClick={() => setCurrentStreamUrl(ep.url)} style={{ cursor: "pointer", padding: 6, marginLeft: 10, marginTop: 2, borderRadius: 4, color: "#fff", backgroundColor: currentStreamUrl === ep.url ? "#555" : "#222" }}>
                      {ep.name}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "absolute", top: 20, left: sidebarOpen ? 280 : 20, padding: "8px 12px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", zIndex: 1000 }}>
        {sidebarOpen ? "Hide Sidebar" : "☰ Show Sidebar"}
      </button>
    </div>
  );
}
