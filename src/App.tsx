import { useState } from "react";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Credentials from site-access.md
    if (username === "peter" && code === "051203#Interpol") {
      setUnlocked(true);
      setError("");
    } else {
      setError("Not recognised.");
    }
  }

  if (unlocked) {
    return (
      <main style={{ maxWidth: 640, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>Portfolio Desk</h1>
        <p>Welcome. Honeypot Testing site is live.</p>
        <div style={{ border: "1px solid #333", padding: 16, borderRadius: 8, marginTop: 16 }}>
          <p><strong>Holdings (latest monitor):</strong></p>
          <ul>
            <li>2388.HK ~HK$49.6 (MV ~HK$49.6k)</li>
            <li>0728.HK ~HK$4.445 (MV ~HK$26.7k)</li>
            <li>Total MV ~HK$76.3k</li>
            <li>Remaining capital ~HK$104k</li>
          </ul>
        </div>
        <button onClick={() => setUnlocked(false)} style={{ marginTop: 20 }}>
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Honeypot Testing</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        <label>
          Password
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </label>
        {error && <p style={{ color: "#e05a5a", margin: 0 }}>{error}</p>}
        <button type="submit" style={{ padding: 12, marginTop: 8, background: "#c4a574", border: "none", borderRadius: 6 }}>
          Sign in
        </button>
      </form>
    </main>
  );
}
