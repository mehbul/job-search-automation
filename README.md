# job-search-automation

> AI-powered end-to-end job search pipeline — scrapes LinkedIn daily via Apify, scores every role A–F against your CV using [career-ops](https://github.com/santifer/career-ops) + Claude, generates tailored resume PDFs, finds recruiters, preps you for interviews, and tracks every application. Zero manual searching.

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

## How It All Connects

This is the full picture — how GitHub Actions, Apify, and Claude Code career-ops work together:

```
┌─────────────────────────────────────────────────────┐
│           CLOUD (GitHub Actions — 8 AM IST)         │
│                                                     │
│  apify-fetch.mjs runs                               │
│    → reads your target roles + location             │
│    → scrapes LinkedIn via Apify                     │
│    → filters by title keywords                      │
│    → deduplicates against already-seen jobs         │
│    → commits new URLs to data/pipeline.md           │
└─────────────────────┬───────────────────────────────┘
                      │
                      │  data/pipeline.md updated in repo
                      │
┌─────────────────────▼───────────────────────────────┐
│           YOUR LOCAL MACHINE (whenever you want)    │
│                                                     │
│  git pull                ← get fresh pipeline.md   │
│  claude                  ← open Claude Code         │
│  /career-ops pipeline    ← AI takes over            │
│                                                     │
│  career-ops:                                        │
│    → reads each job URL from pipeline.md            │
│    → fetches the full job description               │
│    → reads your cv.md + config/profile.yml          │
│    → scores the role A–F across 10 dimensions       │
│    → writes report → reports/001-company-date.md    │
│    → generates tailored CV PDF → output/            │
│    → logs entry → data/applications.md             │
└─────────────────────────────────────────────────────┘
```

**The handoff file is `data/pipeline.md`** — GitHub Actions writes job URLs into it every morning, career-ops reads and processes them when you're ready.

---

## Your Daily Routine

Once set up, this is all you do each day:

```bash
# 1. Get the fresh jobs scraped overnight
git pull

# 2. Open Claude Code in the project folder
claude

# 3. Let AI evaluate everything
/career-ops pipeline

# 4. Check the reports — only apply to A/B grades
# Reports are in reports/ — open any to see the full breakdown
```

That's it. The boring part (finding jobs) runs automatically. You only spend time on the interesting part (deciding which ones to pursue).

---

## Full Command Reference

All commands run inside Claude Code (`claude`) from your project folder.

### 🔁 Core Pipeline

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/career-ops pipeline` | Processes all pending URLs from `data/pipeline.md` — evaluates, scores, generates PDFs, updates tracker | Every morning after `git pull` |
| `/career-ops {URL or JD text}` | Full evaluation of a single job (paste URL or JD directly) | Any time you spot a role manually |
| `/career-ops scan` | Zero-token scanner — hits Greenhouse, Ashby & Lever APIs for 45+ companies directly | Weekly, to catch roles not on LinkedIn |

### 📊 Evaluation & Scoring

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/career-ops oferta` | Deep A–G evaluation of one role (no auto PDF) | When you want to analyse a role carefully |
| `/career-ops ofertas` | Side-by-side comparison of multiple roles | When you have 2+ strong options |
| `/career-ops tracker` | Full application status dashboard | Every Monday morning |
| `/career-ops patterns` | Detects rejection patterns across your history | After every 10–15 applications |

### 📄 CV & Applications

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/career-ops pdf` | Generate a tailored CV PDF for a specific role | Before applying to any A/B role |
| `/career-ops apply` | Live application assistant — reads the form, drafts answers, stops before Submit | When a role has a long application form |

### 🔍 Research & Outreach

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/career-ops deep` | Full company intelligence report (funding, culture, tech stack, layoff history) | Before applying to any A/B company |
| `/career-ops contacto` | Finds the right person to contact + drafts a personalised LinkedIn DM | After applying — boosts response rate 3× |
| `/career-ops interview-prep` | Company-specific interview prep doc with likely questions + STAR stories | The day before any interview |

### 📅 Follow-Up & Tracking

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/career-ops followup` | Flags overdue follow-ups + drafts follow-up emails | Every Friday |
| `/career-ops training` | Evaluates whether a course/cert is worth your time | Before paying for any certification |
| `/career-ops project` | Scores a side project idea for career/resume value | Before starting a new project |

---

## How the Scoring Works

career-ops evaluates each job across 6 dimensions and assigns a global score from 1–5:

| Score | Grade | Action |
|-------|-------|--------|
| 4.5–5.0 | A | Strong match — apply immediately |
| 4.0–4.4 | B | Good fit — worth applying |
| 3.5–3.9 | C | Partial fit — apply if specifically interested |
| 3.0–3.4 | D | Weak fit — consider carefully |
| < 3.0 | F | Not worth your time — skip |

The system **never submits an application**. You always review before clicking Apply.

---

## Weekly Workflow (Full)

```
Monday     → git pull + /career-ops pipeline   (evaluate overnight jobs)
             /career-ops tracker               (review status of all apps)

Tuesday–   → /career-ops deep {company}        (research before applying)
Thursday     /career-ops apply {URL}           (fill application forms)
             /career-ops contacto {URL}        (DM the team after applying)

Friday     → /career-ops followup              (chase overdue applications)
             /career-ops scan                  (catch jobs not on LinkedIn)

Anytime    → /career-ops interview-prep {URL}  (before any interview)
             /career-ops ofertas               (when comparing multiple offers)
```

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

## Project Structure

```
job-search-automation/
├── apify-fetch.mjs              # LinkedIn scraper bridge
├── run-daily.mjs                # Daily automation wrapper
├── setup-windows-task.ps1       # Windows Task Scheduler setup
├── setup-cron.sh                # Mac/Linux cron setup
├── APIFY_SETUP.md               # Detailed Apify setup guide
│
├── .github/
│   └── workflows/
│       └── daily-fetch.yml      # GitHub Actions — runs daily at 8 AM IST
│
├── config/
│   └── profile.example.yml      # Profile template (copy → profile.yml)
│
├── templates/
│   └── cv-template.html         # HTML CV template (A4, ATS-optimized)
│   └── portals.example.yml      # Title filter + company list template
│
├── modes/                       # career-ops AI evaluation logic
│   ├── oferta.md                # A–G job evaluation engine
│   ├── pipeline.md              # Batch pipeline processor
│   ├── scan.md                  # Zero-token portal scanner
│   ├── deep.md                  # Company deep research
│   ├── contacto.md              # LinkedIn outreach generator
│   ├── interview-prep.md        # Interview prep generator
│   ├── apply.md                 # Application form assistant
│   ├── ofertas.md               # Multi-offer comparator
│   ├── pdf.md                   # Tailored CV PDF generator
│   ├── tracker.md               # Application status dashboard
│   ├── patterns.md              # Rejection pattern analyser
│   ├── followup.md              # Follow-up cadence tracker
│   ├── training.md              # Course/cert evaluator
│   └── project.md               # Side project evaluator
│
├── data/
│   ├── pipeline.md              # Inbox of new job URLs (auto-updated daily)
│   ├── applications.md          # Full application tracker (gitignored)
│   └── follow-ups.md            # Follow-up history (gitignored)
│
├── interview-prep/
│   └── story-bank.md            # Reusable STAR+R stories (built over time)
│
├── writing-samples/             # Add your cover letters/LinkedIn About here
│                                # → AI learns your voice and writes like you
│
├── reports/                     # AI evaluation reports (gitignored)
├── output/                      # Generated CV PDFs (gitignored)
└── cv.md                        # Your CV in markdown (gitignored)
```

### Privacy by Design

Files marked **gitignored** contain personal data and never leave your machine:
`cv.md` · `config/profile.yml` · `data/applications.md` · `data/pipeline.md` · `reports/` · `output/`

---

## Power Features — Unlock Over Time

### ✍️ Writing Style Calibration
Drop any personal writing into `writing-samples/` (a past cover letter, your LinkedIn About section, an email you wrote) and the system learns your voice — tone, sentence length, vocabulary, punctuation style. Every cover letter, outreach message, and application answer it generates will sound like *you*, not generic AI.

```
writing-samples/
├── cover-letter-example.md     ← past cover letter
├── linkedin-about.md           ← your LinkedIn About section
└── any-professional-writing.md ← emails, blog posts, anything
```

### 📖 STAR+R Story Bank
Every evaluation builds your `interview-prep/story-bank.md` — a growing library of reusable interview stories. After 20–30 evaluations you'll have a polished bank of 10–15 master stories that can be adapted to any interview question at any company.

### 🔄 Auto-Update System
career-ops updates silently in the background. Your data (`cv.md`, reports, tracker) is never touched by updates. To check manually: open Claude Code and say *"check for updates"*.

### 🌍 International Job Markets
Switch evaluation language by setting `language.modes_dir` in `config/profile.yml`:
- `modes/de` → German (DACH market)
- `modes/fr` → French (France, Belgium, Switzerland)
- `modes/ja` → Japanese (Japan)
- `modes/tr` → Turkish (Turkey)

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
