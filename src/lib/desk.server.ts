import { readFileSync } from "node:fs";
import { join } from "node:path";

const ACCESS_FILE = join(process.cwd(), "src/lib/site-access.md");

function loadAccess() {
  try {
    const raw = readFileSync(ACCESS_FILE, "utf-8");
    const userMatch = raw.match(/username:\s*"([^"]+)"/);
    const codeMatch = raw.match(/code:\s*"([^"]+)"/);
    return {
      username: userMatch?.[1] ?? "",
      code: codeMatch?.[1] ?? "",
    };
  } catch {
    return { username: "", code: "" };
  }
}

export function getDeskState() {
  // Simplified for deploy: always start locked
  return { unlocked: false, blocked: false, report: null };
}

export function unlockDesk({ username, code }: { username: string; code: string }) {
  const access = loadAccess();
  if (username === access.username && code === access.code) {
    return { ok: true };
  }
  return { ok: false, blocked: false };
}
