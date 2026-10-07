# NEXUS-DQPS — 6-Person Team Workflow Plan (DataQuest 3.0)

## Mission
Ship a live-demoable, closed-loop D2C advertising intelligence & decision engine
(detect → diagnose → decide → execute → learn) in ~36–48 hours, with a Streamlit
"Mission Control" UI that judges can click through.

Repo: https://github.com/Hustkers/NEXUS-DQPS
Local: ~/NEXUS-DQPS
Demo doc: ~/Desktop/DEMO_WORKFLOW.md

---

## Team Roles

| # | Role | Owns (files) | Deliverable |
|---|---|---|---|
| P1 | Data & Simulation | `simulator/generator.py`, `ingest/load.py` | Realistic 90-day dataset, 5 injected events, DuckDB loader |
| P2 | Diagnosis | `diagnose/anomaly.py` | z-score anomaly feed, factor decomposition, scoring vs ground truth |
| P3 | Decision Engine | `decide/optimizer.py` | Response curves, SLSQP optimizer, recommendation table, calibration |
| P4 | AI Agent Layer | `agents/rca.py` | LLM RCA explainer (Claude/OpenAI + template fallback), prompt tuning |
| P5 | Execution & Learning | `execute/mock_ads_api.py`, `learn/ledger.py` | Mock executor API, decision ledger, expected-vs-realized tracking |
| P6 | UI / Demo / Pitch | `app/streamlit_app.py`, `scripts/run_demo.py`, docs, slides | Mission Control UI, E2E demo script, 3-min pitch, demo rehearsals |

Everyone contributes to integration and PR review; P6 owns the "one script, one command" demo.

---

## Ground Rules
- Git: small PRs into `main`, one feature per PR; P6 (or rotating reviewer) merges. Pull before you push.
- Contract first: `data/metrics.csv` schema + `LedgerEntry` + `Recommendation` dataclass are frozen in hour 3. Change them only via a 2-line PR everyone sees.
- No new heavy deps without a 5-min team sync. Offline-first: no API call may break the demo.
- Seed `7` everywhere so every machine produces the identical story.

---

## Phase 0 — Kickoff (Hour 0–2)
- P6 reads `PLAN.md` + `DEMO_WORKFLOW.md` aloud (5 min), confirms roles.
- P1–P5 each pull repo, `pip install -r requirements.txt`, run `python scripts/run_demo.py` once.
- Freeze contracts: schema DDL in `ingest/load.py`, `LedgerEntry`, recommendation columns.
- P6 sets up issue tracker (GitHub Projects or paper) with tasks per phase.

## Phase 1 — Parallel Build (Hour 2–12)
Each person works on their module in isolation against fixtures:
- P1: improve simulator realism (restock cycles, budget caps, event interplay), emit `data/events.json` ground truth.
- P2: tune z-thresholds, add IsolationForest option, verify ≥5 anomalies on seed 7.
- P3: calibrate optimizer (expected margin within 0.5–2× of realized), ensure ≥1 stockout-kill + ≥3 shifts.
- P4: RCA prompt tuning; template fallback output must read naturally.
- P5: FastAPI executor applies actions, mutates scenario state, ledger records realized ≈ 90–95% of expected.
- P6: wire Streamlit panels against P1's fixture; plan anomaly→RCA click flow.

**Hour 12 checkpoint (hard stop):** E2E runs offline: `run_demo.py` → anomalies → recs → ledger. If a module is behind, pairs help.

## Phase 2 — Integration (Hour 12–20)
- P1+P2: anomaly feed shows correct z-scores on real simulated rows.
- P2+P4: RCA card renders for every feed row in <2s.
- P3+P5: Approve button in UI → POST `/apply` → ledger entry appears.
- P5+P6: ledger chart (expected vs realized) live in UI.
- P6: rehearse the 3-min narrative once, note every awkward transition.

**Hour 20 checkpoint:** Full UI click-through works; recorded 2-min screen capture sent to team chat.

## Phase 3 — Polish & Harden (Hour 20–30)
- P1: freeze demo snapshot (`data/demo_snapshot/`) so demo needs no regeneration.
- P2: ground-truth scorecard — how many true event days the anomaly feed catches.
- P3: optimizer edge cases (all-stockout scenario → all spend killed; zero-budget campaign).
- P4: RCA quality — each explanation must name the true driver in the top factor.
- P5: ledger export (CSV) for the "measurable impact" slide.
- P6: UI polish — KPI row, colors for anomalies, loading spinners, "Approve" confirmation toast; slides deck.

**Hour 30 checkpoint:** Dress rehearsal #1 with judges' script; timer on.

## Phase 4 — Rehearse & Buffer (Hour 30–40)
- Dress rehearsal #2 and #3; fix every hiccup >10s.
- Assign demo day stations: P6 drives the UI, P3/P5 answer "how does it work?" questions, P4 explains the AI layer, P1 explains data, P2 explains diagnosis.
- Prepare Q&A answers: real API swap points, causal rigor roadmap (Robyn/Meridian/causalml), scaling story.
- Snapshot backup: zip of repo + `data/` on a USB stick.

**Hour 40–48:** sleep, buffer, final polish only. No new features.

---

## Demo Day Runbook (owned by P6)
1. Machine on hotspot; uvicorn + streamlit started 10 min early.
2. `python scripts/run_demo.py` re-seeded once to confirm state (or restore `data/demo_snapshot/`).
3. Demo script: Hook → anomaly card → RCA → approve stockout-kill → ledger proves lift.
4. Fallback if demo breaks: recorded screen capture + live Q&A walkthrough.

## Success Criteria
- [ ] E2E offline demo works on a fresh clone in <60s
- [ ] ≥5 anomalies, ≥1 stockout kill, ≥3 reallocations
- [ ] RCA names the true driver for ≥3 of 4 event types
- [ ] Ledger shows realized ≈ 90–95% of expected
- [ ] 3-min narrative rehearsed 3×, no dead air
- [ ] Every team member has 1 story/claim they own in Q&A

## Communication
- Standup at hour 12, 20, 30, 40 (15 min each, standing).
- Async: WhatsApp/Discord for blockers; PRs reviewed within 30 min during build phases.
