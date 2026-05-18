/**
 * apify-fetch.mjs
 *
 * Scrapes LinkedIn job listings via Apify and feeds them into the
 * career-ops pipeline (data/pipeline.md) for AI evaluation.
 *
 * Config is read automatically from:
 *   config/profile.yml  →  search queries (target_roles.primary) + location
 *   portals.yml         →  title keyword filters (title_filter.positive/negative)
 *   .env                →  APIFY_API_TOKEN
 *
 * Usage:
 *   node apify-fetch.mjs
 *
 * Setup:
 *   1. Copy .env.example → .env and add your Apify token
 *   2. Fill in config/profile.yml with your target roles and location
 *   3. Fill in portals.yml with your title keyword filters
 *   4. Run: node apify-fetch.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load environment variables ────────────────────────────────────────────────
dotenv.config({ path: join(__dirname, ".env") });

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
if (!APIFY_TOKEN) {
  console.error("ERROR: APIFY_API_TOKEN not set. Copy .env.example → .env and add your token.");
  console.error("Get a free token at https://apify.com (free tier: 5 USD/month compute included)");
  process.exit(1);
}

// LinkedIn Jobs scraper — 2M+ runs, actively maintained
const ACTOR_ID = "curious_coder~linkedin-jobs-scraper";

// Max jobs per search query — keep at 25–50 to stay within Apify free tier
const MAX_JOBS_PER_QUERY = parseInt(process.env.APIFY_MAX_JOBS_PER_QUERY || "25", 10);

// Time filters — scrape both windows for maximum coverage
// r86400 = past 24 hours (fresh daily jobs)
// r604800 = past 1 week (catches anything missed in prior runs)
const TIME_FILTERS = [
  { label: "24h",  value: "r86400"  },
  { label: "7d",   value: "r604800" },
];

// ── Load config from career-ops profile files ─────────────────────────────────

function loadProfile() {
  const profilePath = join(__dirname, "config", "profile.yml");
  if (!existsSync(profilePath)) {
    console.error("ERROR: config/profile.yml not found. Copy config/profile.example.yml → config/profile.yml and fill it in.");
    process.exit(1);
  }
  return yaml.load(readFileSync(profilePath, "utf-8"));
}

function loadPortals() {
  const portalsPath = join(__dirname, "portals.yml");
  if (!existsSync(portalsPath)) {
    console.error("ERROR: portals.yml not found. Copy templates/portals.example.yml → portals.yml and customise title_filter.");
    process.exit(1);
  }
  return yaml.load(readFileSync(portalsPath, "utf-8"));
}

function buildSearchConfig(profile, portals) {
  // Search queries: target role titles from profile.yml
  const queries = profile?.target_roles?.primary || [];
  if (queries.length === 0) {
    console.error("ERROR: No target roles found in config/profile.yml under target_roles.primary");
    process.exit(1);
  }

  // Locations: derive from profile
  const locations = [];
  if (profile?.location?.country) locations.push(profile.location.country);
  if (profile?.location?.city) locations.push(profile.location.city);
  // Always include Remote if profile prefers remote
  const flex = (profile?.compensation?.location_flexibility || "").toLowerCase();
  if (flex.includes("remote") && !locations.includes("Remote")) {
    locations.push("Remote");
  }
  if (locations.length === 0) locations.push("India"); // safe default

  // Title filters from portals.yml
  const positiveKeywords = portals?.title_filter?.positive || [];
  const negativeKeywords = portals?.title_filter?.negative || [];

  return { queries, locations, positiveKeywords, negativeKeywords };
}

// ── Title filtering ───────────────────────────────────────────────────────────

function titleMatches(title, positiveKeywords, negativeKeywords) {
  if (!title) return false;
  const t = title.toLowerCase();
  const hasPositive = positiveKeywords.length === 0 || positiveKeywords.some((kw) => t.includes(kw.toLowerCase()));
  const hasNegative = negativeKeywords.some((kw) => t.includes(kw.toLowerCase()));
  return hasPositive && !hasNegative;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function loadExistingUrls() {
  const files = [
    join(__dirname, "data", "pipeline.md"),
    join(__dirname, "data", "applications.md"),
  ];
  const urls = new Set();
  for (const p of files) {
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf-8");
    for (const m of content.matchAll(/https?:\/\/[^\s)\]"]+/g)) {
      // Normalise: strip query params for dedup
      try {
        urls.add(new URL(m[0]).pathname);
      } catch {
        urls.add(m[0].trim());
      }
    }
  }
  return urls;
}

// ── Pipeline writer ───────────────────────────────────────────────────────────

function appendToPipeline(entries) {
  const pipelinePath = join(__dirname, "data", "pipeline.md");
  let content = existsSync(pipelinePath)
    ? readFileSync(pipelinePath, "utf-8")
    : "# Pipeline — Pending Evaluations\n\nPaste job URLs here. Run `/career-ops pipeline` to process them.\n\n";

  const lines = entries
    .map((e) => `- [ ] ${e.url}  <!-- ${e.title} @ ${e.company} | ${e.location} | scraped ${e.date} -->`)
    .join("\n");

  writeFileSync(pipelinePath, content.trimEnd() + "\n" + lines + "\n");
}

// ── Apify API ─────────────────────────────────────────────────────────────────

async function startRun(searchUrl) {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [searchUrl], maxJobs: MAX_JOBS_PER_QUERY }),
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to start Apify run (${res.status}): ${txt}`);
  }
  const { data } = await res.json();
  return data.id;
}

async function waitForRun(runId) {
  const deadline = Date.now() + 15 * 60 * 1000; // 15 min timeout
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 8000));
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const { data } = await res.json();
    if (data.status === "SUCCEEDED") { process.stdout.write(" done.\n"); return; }
    if (data.status === "FAILED") { process.stdout.write(" finished with errors (fetching partial data).\n"); return; }
    if (["ABORTED", "TIMED-OUT"].includes(data.status)) throw new Error(`Run ${data.status}`);
    process.stdout.write(".");
  }
  process.stdout.write(" timed out (fetching partial data).\n");
}

async function fetchItems(runId) {
  const res = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&format=json&clean=true&limit=500`
  );
  return res.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== career-ops / Apify Job Fetch ===");
  console.log(`Started: ${new Date().toISOString()}\n`);

  const profile = loadProfile();
  const portals = loadPortals();
  const { queries, locations, positiveKeywords, negativeKeywords } = buildSearchConfig(profile, portals);

  console.log(`Target roles:   ${queries.join(", ")}`);
  console.log(`Locations:      ${locations.join(", ")}`);
  console.log(`Title filters:  +[${positiveKeywords.slice(0, 5).join(", ")}...] -[${negativeKeywords.slice(0, 3).join(", ")}...]`);
  console.log(`Max per query:  ${MAX_JOBS_PER_QUERY}\n`);

  const existingUrls = loadExistingUrls();
  console.log(`Already tracked: ${existingUrls.size} URLs\n`);

  const allNew = [];

  for (const query of queries) {
    for (const location of locations) {
      for (const timeFilter of TIME_FILTERS) {
        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=${timeFilter.value}`;
        process.stdout.write(`Scraping "${query}" in "${location}" [${timeFilter.label}]...`);

        let runId;
        try {
          runId = await startRun(searchUrl);
          await waitForRun(runId);
        } catch (err) {
          console.warn(`  WARN: ${err.message} — skipping`);
          continue;
        }

        const items = await fetchItems(runId);
        let added = 0;

        for (const item of items) {
          const url = item.link || item.jobUrl || item.url;
          const title = item.title || item.jobTitle || "";
          const company = item.companyName || item.company || "";
          const location2 = item.location || "";

          if (!url) continue;

          // Normalise URL for dedup
          let urlKey = url;
          try { urlKey = new URL(url).pathname; } catch { /* keep raw */ }
          if (existingUrls.has(urlKey)) continue;

          if (!titleMatches(title, positiveKeywords, negativeKeywords)) continue;

          existingUrls.add(urlKey);
          allNew.push({ url, title, company, location: location2, date: new Date().toISOString().slice(0, 10) });
          added++;
        }

        console.log(`  → ${items.length} scraped, ${added} new matches`);
      }
    }
  }

  if (allNew.length === 0) {
    console.log("\nNo new jobs found. Pipeline unchanged.");
    return;
  }

  appendToPipeline(allNew);
  console.log(`\n✓ Added ${allNew.length} new job(s) to data/pipeline.md`);
  console.log('  Open Claude Code in this folder and run: /career-ops pipeline');
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
