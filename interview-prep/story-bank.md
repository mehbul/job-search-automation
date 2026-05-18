# Story Bank — Master STAR+R Stories

This file accumulates your best interview stories over time. Each evaluation (Block F) adds new stories here. Instead of memorizing 100 answers, maintain 5-10 deep stories that you can bend to answer almost any behavioral question.

## How it works

1. Every time `/career-ops oferta` generates Block F (Interview Plan), new STAR+R stories get appended here
2. Before your next interview, review this file — your stories are already organized by theme
3. The "Big Three" questions can be answered with stories from this bank:
   - "Tell me about yourself" → combine 2-3 stories into a narrative
   - "Tell me about your most impactful project" → pick your highest-impact story
   - "Tell me about a conflict you resolved" → find a story with a Reflection

## Stories

<!-- Stories will be added here as you evaluate offers -->
<!-- Format:
### [Theme] Story Title
**Source:** Report #NNN — Company — Role
**S (Situation):** ...
**T (Task):** ...
**A (Action):** ...
**R (Result):** ...
**Reflection:** What I learned / what I'd do differently
**Best for questions about:** [list of question types this story answers]
-->

### [Automation / Impact] Automated Datadog Log Comparison Reports
**Source:** Report #006 — Talent500/Zurich — Observability Engineer
**S (Situation):** NielsenIQ team spent ~1 hour per test cycle manually comparing Datadog logs across runs — repetitive, error-prone, and blocked faster turnaround.
**T (Task):** Eliminate the manual reporting bottleneck while improving consistency and coverage of log comparison.
**A (Action):** Built a Python tool using the Datadog API to automatically compare log patterns between test cycles, then auto-populated a Word report template with findings, diffs, and anomaly highlights.
**R (Result):** Eliminated repetitive manual reporting overhead. The team adopted the tool immediately; test cycle turnaround improved.
**Reflection:** Should have added an executive summary section from day one — stakeholders want headlines, not raw log diffs. I later added a one-paragraph summary at the top that became the most-read section.
**Best for questions about:** Automation, initiative, improving team productivity, building internal tools, reducing toil

### [Monitoring / Alerting] Tuning Datadog Alerts to Reduce Noise
**Source:** Report #006 — Talent500/Zurich — Observability Engineer
**S (Situation):** Production bottlenecks were being caught late (post-release). Alert thresholds were either too sensitive (noise) or too loose (misses).
**T (Task):** Establish a monitoring baseline and tune alerts so the team catches regressions pre-release, not post-deploy.
**A (Action):** Configured Datadog monitoring across CPU, memory, DB, and network layers. Used 2 weeks of baseline production data to set threshold ranges. Defined alert severity tiers (warning vs critical) and routing rules.
**R (Result):** Pre-release regression catches increased. Dev team got actionable alerts instead of noise. Fewer incidents post-deploy.
**Reflection:** Alert fatigue is a real risk — I'd invest more time upfront in alert grouping and deduplication. One noisy alert train can cause teams to start ignoring dashboards.
**Best for questions about:** Observability, monitoring strategy, attention to detail, proactive vs reactive engineering

### [Problem Solving / ML] ML-Powered Error-Analysis Tool
**Source:** Report #006 — Talent500/Zurich — Observability Engineer
**S (Situation):** After every load test run (10,000+ VUs), log triage took ~1 hour per cycle — manually scanning error patterns across thousands of lines.
**T (Task):** Cut triage time without sacrificing detection coverage. The team needed faster signal, not just faster reading.
**A (Action):** Built a Python tool using unsupervised ML (Pandas, NumPy, Scikit-Learn) — anomaly detection on error patterns, automated comparison across test cycles, highlighted novel errors vs known patterns.
**R (Result):** Log triage cut from ~1 hour to ~15 minutes per cycle (~50% reduction). The team could run more test cycles per sprint.
**Reflection:** The unsupervised clustering worked well. In retrospect, I'd add confidence scoring per anomaly cluster so engineers could triage by confidence, not just by error count. Also would have written unit tests from day one.
**Best for questions about:** Technical problem solving, ML applied to real problems, ownership, initiative, quantified impact

### [Cross-team Collaboration] Bottleneck RCA Under Production Load
**Source:** Report #006 — Talent500/Zurich — Observability Engineer
**S (Situation):** DB layer degraded at 8,000 VU during load testing; root cause was unclear — could have been CPU saturation, DB connection pool exhaustion, or slow queries.
**T (Task):** Isolate the root cause layer and give the dev team a specific, actionable fix — not just "the DB is slow."
**A (Action):** Used Datadog APM + DB query traces to correlate test traffic with query execution plans. Identified an N+1 query pattern introduced by an ORM change in the recent sprint.
**R (Result):** Dev fixed the N+1 issue in the same sprint. Load test rerun passed at 10,000+ VU with DB response times back to baseline.
**Reflection:** Always correlate test traffic with production query plans early — the ORM-introduced N+1 would have shipped to production without this step. I now include DB query profiling as a standard step in test execution, not just bottleneck investigation.
**Best for questions about:** Debugging, technical depth, cross-team collaboration, attention to root cause vs symptoms
