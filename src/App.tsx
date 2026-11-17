import { useEffect, useState, type FormEvent } from "react";
import { DeskView } from "./components/desk-view";
import type { DeskReport } from "./types";

export default function App() {
  const [phase, setPhase] = useState<"boot" | "gate" | "desk">("boot");
  const [report, setReport] = useState<DeskReport | null>(null);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"lock" | "update" | "sign" | null>(null);
  const [note, setNote] = useState("");

  async function loadReport() {
    const response = await fetch("/api/portfolio");
    if (!response.ok) return false;
    setReport((await response.json()) as DeskReport);
    setPhase("desk");
    return true;
  }

  useEffect(() => {
    loadReport()
      .catch(() => setPhase("gate"))
      .then((ok) => {
        if (ok === false) setPhase("gate");
      });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending("sign");
    setError("");
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, code }),
      });
      if (!response.ok) {
        setError("Not recognised.");
        setPending(null);
        return;
      }
      setCode("");
      const ok = await loadReport();
      if (!ok) setError("Not recognised.");
    } catch {
      setError("Not recognised.");
    }
    setPending(null);
  }

  async function onUpdate() {
    setPending("update");
    setNote("");
    try {
      const response = await fetch("/api/portfolio", { method: "POST" });
      if (!response.ok) {
        setNote("Update failed.");
        setPending(null);
        return;
      }
      setReport((await response.json()) as DeskReport);
    } catch {
      setNote("Update failed.");
    }
    setPending(null);
  }

  async function onLock() {
    setPending("lock");
    await fetch("/api/lock", { method: "POST" });
    setReport(null);
    setPhase("gate");
    setPending(null);
  }

  if (phase === "boot") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
        <p className="text-sm text-muted">Opening the desk…</p>
      </main>
    );
  }

  if (phase === "gate" || !report) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
        <h1 className="font-serif text-4xl font-medium text-fg">Honeypot Testing</h1>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
          <label htmlFor="username" className="text-sm text-fg">
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-12 rounded-card border border-line bg-surface px-4 text-base text-fg outline-none focus:border-brass"
          />
          <label htmlFor="access-code" className="text-sm text-fg">
            Password
          </label>
          <input
            id="access-code"
            name="access-code"
            type="password"
            autoComplete="current-password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-12 rounded-card border border-line bg-surface px-4 text-base text-fg outline-none focus:border-brass"
          />
          {error ? (
            <p className="text-sm text-down" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending !== null || username.length === 0 || code.length === 0}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-card bg-brass px-4 text-sm font-semibold text-brass-ink disabled:opacity-50"
          >
            {pending === "sign" ? "Checking…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <DeskView
      report={report}
      onLock={onLock}
      onUpdate={onUpdate}
      pending={pending === "sign" ? null : pending}
      note={note}
    />
  );
}
