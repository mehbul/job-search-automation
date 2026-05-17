# job-search-automation

> AI-powered job search pipeline — scrapes LinkedIn daily via Apify, scores every role against your CV using [career-ops](https://github.com/santifer/career-ops) + Claude, and generates tailored resume PDFs. Zero manual searching.

<p align="center">
  <img src="https://img.shields.io/badge/Built_on-career--ops-000?style=flat&logo=anthropic&logoColor=white" alt="Built on career-ops">
  <img src="https://img.shields.io/badge/Scraper-Apify-00C4CC?style=flat" alt="Apify">
  <img src="https://img.shields.io/badge/Automation-GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT">
</p>

---

## What This Does

Instead of manually checking LinkedIn every day, this system does it for you:

```
Every day at 8 AM (GitHub Actions, no PC needed)
         │
         ▼
Apify scrapes LinkedIn for your target roles
         │
         ▼
Bridge script filters by title keywords + deduplicates
         │
         ▼
New job URLs land in data/pipeline.md
         │
         ▼
You open Claude Code → /career-ops pipeline
         │
         ▼
AI reads each JD, scores it A–F against your CV,
writes a detailed report, generates a tailored PDF
for strong matches (score ≥ 3.0)
```

**You only see roles worth your time.** Anything below 4.0/5 gets flagged — the system tells you not to apply.

---

## What I Added on Top of career-ops

[career-ops](https://github.com/santifer/career-ops) by [@santifer](https://github.com/santifer) is the AI evaluation engine. I built the automated scraping layer on top:

| File | What it does |
|------|-------------|
| `apify-fetch.mjs` | Hits the Apify API, filters by keywords, deduplicates, writes to pipeline |
| `run-daily.mjs` | Wrapper for scheduled runs |
| `setup-windows-task.ps1` | Windows Task Scheduler setup (local machine) |
| `setup-cron.sh` | Mac/Linux cron setup (local machine) |
| `.github/workflows/daily-fetch.yml` | GitHub Actions — runs daily at 8 AM IST, no PC needed |
| `APIFY_SETUP.md` | Detailed setup guide |

---

## Quick Start (5 minutes)

### 1. Fork or clone this repo

```bash
git clone https://github.com/mehbul/job-search-automation.git
cd job-search-automation
npm install
```

### 2. Get a free Apify token

1. Sign up at [apify.com](https://apify.com) — free tier includes ~$5/month compute, enough for daily scans
2. Go to **Settings → Integrations → API tokens**
3. Copy your Personal API token

### 3. Configure your environment

```bash
cp .env.example .env
```

Open `.env` and add your token:

```
APIFY_API_TOKEN=your_apify_token_here
```

> The `.env` file is gitignored — your token will never be committed.

### 4. Set up your profile

```bash
cp config/profile.example.yml config/profile.yml
```

Edit `config/profile.yml` with your details. The key fields:

```yaml
target_roles:
  primary:
    - "Your Target Role"         # e.g. "Senior Backend Engineer"
    - "Your Second Role"         # e.g. "Platform Engineer"

location:
  country: "India"               # or "United States", "Germany", etc.
  # city: "Pune"                 # optional — adds a city-specific search

compensation:
  location_flexibility: "Remote worldwide"   # adds Remote as a search location
```

> `config/profile.yml` is gitignored — your personal info (name, email, phone) stays local.

### 5. Set up title filters

```bash
cp templates/portals.example.yml portals.yml
```

Edit the `title_filter` section in `portals.yml`:

```yaml
title_filter:
  positive:
    - "Backend Engineer"
    - "Platform Engineer"
    - "Software Engineer"
  negative:
    - "Junior"
    - "Intern"
```

### 6. Add your CV

Create `cv.md` in the project root with your CV in markdown. This is what career-ops uses to score your fit against each job description.

### 7. Test the fetch

```bash
node apify-fetch.mjs
```

You should see jobs being scraped and written to `data/pipeline.md`.

### 8. Evaluate the jobs

Open Claude Code in this folder and run:

```
/career-ops pipeline
```

career-ops will score each job, write a report in `reports/`, and generate a tailored CV PDF for strong matches.

---

## Running Automatically (GitHub Actions — No PC Needed)

This is the recommended setup. The workflow runs every morning at **8 AM IST** on GitHub's servers.

### Setup

1. Push your fork to GitHub (keep it public or private — your choice)
2. Go to **Settings → Secrets and variables → Actions → New repository secret**
3. Add:
   - **Name:** `APIFY_API_TOKEN`
   - **Value:** your Apify token

That's it. The workflow at `.github/workflows/daily-fetch.yml` handles everything else.

> The workflow generates a clean search config at runtime — only target roles and location, no personal info. Your name, email, and phone are never in the repo.

### Manual trigger

You can also run it anytime from **Actions → Daily Job Fetch → Run workflow** without waiting for 8 AM.

---

## How the Scoring Works

career-ops evaluates each job across 10 dimensions and assigns a score from 1–5:

| Score | Grade | Meaning |
|-------|-------|---------|
| 4.5–5.0 | A | Strong match — prioritize |
| 4.0–4.4 | B | Good fit — worth applying |
| 3.5–3.9 | C | Partial fit — apply if interested |
| 3.0–3.4 | D | Weak fit — consider carefully |
| < 3.0 | F | Not worth your time |

The system never submits an application. You always review before clicking Apply.

---

## Project Structure

```
job-search-automation/
├── apify-fetch.mjs              # LinkedIn scraper bridge (the core addition)
├── run-daily.mjs                # Daily automation wrapper
├── setup-windows-task.ps1       # Windows Task Scheduler setup
├── setup-cron.sh                # Mac/Linux cron setup
├── APIFY_SETUP.md               # Detailed Apify setup guide
├── .github/
│   └── workflows/
│       └── daily-fetch.yml      # GitHub Actions daily schedule
├── .env.example                 # Environment variable template
├── config/
│   └── profile.example.yml      # Profile template (copy → profile.yml)
├── templates/
│   └── portals.example.yml      # Title filter template (copy → portals.yml)
├── data/
│   └── pipeline.md              # Inbox of new job URLs (auto-updated daily)
├── reports/                     # AI evaluation reports (gitignored)
├── output/                      # Generated CV PDFs (gitignored)
└── modes/                       # career-ops evaluation logic
```

---

## Built On

This project is built on top of **[career-ops](https://github.com/santifer/career-ops)** by [@santifer](https://github.com/santifer) — an open-source AI job search system that handles evaluation, CV generation, and pipeline tracking. All credit for the core engine goes to him.

I added the automated LinkedIn scraping layer via Apify and the GitHub Actions workflow to make it fully hands-off.

---

## Requirements

- [Node.js](https://nodejs.org) v18+
- [Apify account](https://apify.com) — free tier works
- [Claude Code](https://claude.ai/code) — for the `/career-ops pipeline` evaluation step

---

## Let's Connect

Built by **Mehbul Islam** — Performance Engineer at NielsenIQ.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mehbulislam/)

---

## License

MIT — see [LICENSE](LICENSE). The career-ops name and brand are governed by the [Trademark Policy](TRADEMARK.md).
