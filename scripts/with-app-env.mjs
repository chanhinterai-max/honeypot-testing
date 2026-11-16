import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-app-env.mjs <command> [args...]");
  process.exit(1);
}

const child = spawn(args[0], args.slice(1), {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || "development" },
});

child.on("exit", (code) => process.exit(code ?? 0));
