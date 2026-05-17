# Apify Integration for career-ops

Automatically scrapes LinkedIn job listings daily via [Apify](https://apify.com) and feeds them into the career-ops pipeline for AI evaluation. Works for any role — just configure your target titles in `config/profile.yml`.

## How it works

```
Daily at 8 AM
  ↓
apify-fetch.mjs reads your target roles from config/profile.yml
  ↓
Searches LinkedIn via Apify (free tier works)
  ↓
Filters results against your title keywords in portals.yml
  ↓
Deduplicates against jobs you've already seen
  ↓
Appends new URLs to data/pipeline.md
  ↓
Open Claude Code → /career-ops pipeline → AI scores each job A–F + generates tailored CV
```

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [Claude Code](https://claude.ai/code) (for the `/career-ops pipeline` evaluation step)
- [Apify account](https://apify.com) — free tier includes ~$5/month compute, enough for daily scans

## Setup (5 minutes)

### 1. Clone this repo

```bash
git clone https://github.com/mehbul/job-search-automation.git
cd job-search-automation
npm install
```

### 2. Get your Apify token

1. Sign up at [apify.com](https://apify.com) (free)
2. Go to **Settings → Integrations → API tokens**
3. Copy your Personal API token

### 3. Configure your environment

```bash
cp .env.example .env
```

Open `.env` and add your token:
```
APIFY_API_TOKEN=apify_api_your_token_here
```

### 4. Set up your profile

```bash
cp config/profile.example.yml config/profile.yml
```

Edit `config/profile.yml` — the key fields for Apify:

```yaml
target_roles:
  primary:
    - "Your Target Role"        # e.g. "Senior Frontend Engineer"
    - "Your Second Role"        # e.g. "React Developer"

location:
  country: "India"              # or "United States", "Germany", etc.
  city: "Bengaluru"             # optional — adds a city-specific search
```

### 5. Set up title filters

```bash
cp templates/portals.example.yml portals.yml
```

Edit the `title_filter` section in `portals.yml`:

```yaml
title_filter:
  positive:
    - "Frontend"
    - "React"
    - "Vue"
  negative:
    - "intern"
    - "unpaid"
```

### 6. Test the fetch

```bash
node apify-fetch.mjs
```

You should see jobs being scraped and written to `data/pipeline.md`.

### 7. Set up daily automation

**Windows:**
```powershell
.\setup-windows-task.ps1
```

**Mac / Linux:**
```bash
chmod +x setup-cron.sh && ./setup-cron.sh
```

This schedules `run-daily.mjs` to run every morning at **8:00 AM**.

## Daily usage

Once set up, new jobs land in `data/pipeline.md` every morning automatically.

To evaluate them:

1. Open Claude Code in this folder
2. Run: `/career-ops pipeline`

career-ops will:
- Score each job A–F against your CV and profile
- Write a detailed report in `reports/`
- Generate a tailored CV PDF for strong matches (score ≥ 3.0)
- Log everything in `data/applications.md`

## Configuration options

| env var | default | description |
|---|---|---|
| `APIFY_API_TOKEN` | required | Your Apify personal API token |
| `APIFY_MAX_JOBS_PER_QUERY` | `25` | Jobs fetched per search query. Increase for broader coverage (uses more Apify compute) |

## Credits

- [career-ops](https://github.com/santifer/career-ops) by [@santifer](https://github.com/santifer) — the AI job search pipeline this integration builds on
- [LinkedIn Jobs Scraper](https://apify.com/curious_coder/linkedin-jobs-scraper) by curious_coder on Apify
