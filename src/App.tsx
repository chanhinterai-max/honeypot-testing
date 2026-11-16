import { useState } from "react";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "peter" && code === "051203#Interpol") {
      setUnlocked(true);
      setError("");
    } else {
      setError("Not recognised.");
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-serif mb-2">Honeypot Testing</h1>
          <p className="text-gray-400 mb-8">Portfolio desk access</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-600 text-white py-2.5 rounded text-sm font-medium"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-serif">Portfolio Desk</h1>
        <button
          onClick={() => setUnlocked(false)}
          className="text-sm text-gray-400 hover:text-white"
        >
          Sign out
        </button>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <section className="mb-8">
          <h2 className="text-lg mb-3">Holdings Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-zinc-800 rounded p-4">
              <p className="text-sm text-gray-400">2388.HK</p>
              <p className="text-2xl font-medium">~HK$49.60</p>
              <p className="text-sm text-green-400">+0.3% · MV ~HK$49.6k</p>
            </div>
            <div className="border border-zinc-800 rounded p-4">
              <p className="text-sm text-gray-400">0728.HK</p>
              <p className="text-2xl font-medium">~HK$4.445</p>
              <p className="text-sm text-green-400">+0.6% · MV ~HK$26.7k</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Total MV ~HK$76.3k · Remaining capital ~HK$104k
          </div>
        </section>

        <section className="border border-zinc-800 rounded p-4">
          <h2 className="text-lg mb-2">Notes</h2>
          <ul className="text-sm space-y-1 text-gray-300 list-disc pl-5">
            <li>2388.HK: 9M profit +9% YoY, dividend ex 12 Nov</li>
            <li>0728.HK: 9M profit -14.8% YoY (VAT drag), AI resilience, yield ~6.5%</li>
            <li>HSI recent range ~23,600–24,800</li>
            <li>00101.HK still near 52-week low (Income/Defensive candidate)</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
