/**
 * run-daily.mjs
 *
 * Entry point for scheduled runs (Windows Task Scheduler / cron).
 * Loads .env then runs the Apify fetch.
 *
 * Usage:
 *   node run-daily.mjs
 *
 * Schedule setup:
 *   Windows  → run setup-windows-task.ps1 (once, as Administrator)
 *   Mac/Linux → run setup-cron.sh (once)
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env before anything else
const envPath = join(__dirname, ".env");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf("=");
    if (idx === -1) continue;
    const key = t.slice(0, idx).trim();
    const val = t.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

// Run the fetch
console.log(`[${new Date().toISOString()}] Starting daily job fetch...`);
execSync("node apify-fetch.mjs", { stdio: "inherit", cwd: __dirname });
