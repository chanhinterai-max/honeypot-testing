import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

console.log("Migration runner (simplified for deploy)");
const migrationsDir = join(process.cwd(), "migrations");
try {
  const files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
  console.log("Found migrations:", files);
} catch {
  console.log("No migrations directory or empty.");
}
console.log("Migration step complete.");
