import { useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { unlockDesk } from "@/lib/desk-fns";

export function GateView({ blocked }: { blocked: boolean }) {
  const router = useRouter();
  const unlock = useServerFn(unlockDesk);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [lockedOut, setLockedOut] = useState(blocked);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await unlock({ data: { username, code } });
      if (!result.ok) {
        setError(result.blocked ? "Access blocked." : "Not recognised.");
        if (result.blocked) setLockedOut(true);
        setPending(false);
        return;
      }
      setCode("");
      await router.invalidate();
    } catch {
      setError("Not recognised.");
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <h1 className="font-serif text-4xl font-medium text-fg">Honeypot Testing</h1>
      {lockedOut ? (
        <p className="mt-6 text-sm text-down" role="alert">
          Access blocked.
        </p>
      ) : (
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
            disabled={pending || username.length === 0 || code.length === 0}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-card bg-brass px-4 text-sm font-semibold text-brass-ink disabled:opacity-50"
          >
            {pending ? "Checking…" : "Sign in"}
          </button>
        </form>
      )}
    </main>
  );
}
