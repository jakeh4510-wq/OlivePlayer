import { useEffect, useState } from "react";

export default function App() {
  const [channels, setChannels] = useState([]);
  const [shows, setShows] = useState([]);
  const [currentUrl, setCurrentUrl] = useState(null);

  // Load Live TV
  useEffect(() => {
    fetch("https://iptv-org.github.io/iptv/index.m3u")
      .then((res) => res.text())
      .then(parseM3U)
      .then(setChannels)
      .catch((err) => console.error("Error loading channels:", err));
  }, []);

  // Load TV Shows
  useEffect(() => {
    fetch(
      "https://aymrgknetzpucldhpkwm.supabase.co/storage/v1/object/public/tmdb/trending-series.m3u"
    )
      .then((res) => res.text())
      .then(parseM3U)
      .then(setShows)
      .catch((err) => console.error("Error loading shows:", err));
  }, []);

  // Parse M3U into objects
  function parseM3U(data) {
    const lines = data.split("\n");
    const list = [];
    let currentName = "";
    lines.forEach((line) => {
      if (line.startsWith("#EXTINF:")) {
        const name = line.split(",").pop().trim();
        currentName = name;
      } else if (line.startsWith("http")) {
        list.push({ name: currentName, url: line.trim() });
      }
    });
    return list;
  }

  // Group shows into collapsible sections
  const groupedShows = shows.reduce((groups, ch) => {
    const match = ch.name.match(/(.+?)\s(S\d+E\d+|Season\s\d+|Episode\s\d+)/i);
    const showTitle = match ? match[1].trim() : ch.name;

    if (!groups[showTitle]) {
      groups[showTitle] = [];
    }
    groups[showTitle].push(ch);
    return groups;
  }, {});

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundImage:
          "url('https://wallpaperaccess.com/full/869923.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          backgroundColor: "rgba(0,0,0,0.85)",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="https://th.bing.com/th/id/R.3e964212a23eecd1e4c0ba43faece4d7?rik=woa0mnDdtNck5A&riu=http%3a%2f%2fcliparts.co%2fcliparts%2f5cR%2fezE%2f5cRezExni.png&ehk=ATHoTK2nkPsJzRy7%2b8AnWq%2f5gEqvwgzBW3GRbMjId4E%3d&risl=&pid=ImgRaw&r=0"
            alt="Olive Logo"
            style={{ width: "100px", marginBottom: "10px" }}
          />
          <h1 style={{ fontFamily: "cursive", fontSize: "24px" }}>
            OlivePlayer
          </h1>
        </div>

        {/* Live TV */}
        <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>📺 Live TV</h2>
        <div>
          {channels.length ? (
            channels.slice(0, 50).map((ch, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentUrl(ch.url)}
                style={{
                  cursor: "pointer",
                  padding: "8px",
                  marginBottom: "5px",
                  backgroundColor:
                    currentUrl === ch.url ? "#555" : "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                }}
              >
                {ch.name || `Channel ${idx + 1}`}
              </div>
            ))
          ) : (
            <p>Loading channels...</p>
          )}
        </div>

        {/* TV Shows */}
        <h2 style={{ fontSize: "18px", margin: "20px 0 10px" }}>
          🎬 TV Shows
        </h2>
        <div>
          {Object.keys(groupedShows).length ? (
            Object.entries(groupedShows).map(([showTitle, episodes], idx) => (
              <details
                key={idx}
                style={{
                  backgroundColor: "#222",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  width: "100%",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {showTitle}
                </summary>
                <div style={{ paddingLeft: "15px" }}>
                  {episodes.map((ep, epIdx) => (
                    <div
                      key={epIdx}
                      onClick={() => setCurrentUrl(ep.url)}
                      style={{
                        cursor: "pointer",
                        padding: "8px",
                        marginBottom: "5px",
                        backgroundColor:
                          currentUrl === ep.url ? "#555" : "#333",
                        borderRadius: "4px",
                      }}
                    >
                      {ep.name}
                    </div>
                  ))}
                </div>
              </details>
            ))
          ) : (
            <p>Loading shows...</p>
          )}
        </div>
      </div>

      {/* Main Player */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {currentUrl ? (
          <video
            key={currentUrl}
            src={currentUrl}
            controls
            autoPlay={false}
            style={{
              width: "80%",
              height: "80%",
              backgroundColor: "#000",
              borderRadius: "10px",
            }}
          />
        ) : (
          <p>Select a channel or show</p>
        )}
      </div>
    </div>
  );
}
