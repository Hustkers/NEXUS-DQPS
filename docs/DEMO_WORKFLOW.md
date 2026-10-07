# Live Demo Workflow Plan — DataQuest 3.0

> 🚀 **Live Production Console:** [https://nexus-dqps.vercel.app/dashboard/overview](https://nexus-dqps.vercel.app/dashboard/overview)  
> 🔗 **Vercel Deployment:** [https://nexus-dqps.vercel.app](https://nexus-dqps.vercel.app)

Judges see a **live, interactive demo**, not slides. Every click must tell part of the story.

## Demo Narrative Arc (3 minutes)
1. **Hook (20s):** "D2C brand Atlas runs 4 ad platforms, 12 SKUs, fragmented data. Today they manage by gut."
2. **Problem surfaced (30s):** Dashboard shows margins healthy *overall*, but one anomaly card glows red.
3. **Diagnose (40s):** Click anomaly → RCA card in plain English → factor bars → ground-truth event confirmed.
4. **Decide (30s):** Optimizer recommends reallocation table (current → recommended, expected margin lift).
5. **Approve & Execute (20s):** Human clicks Approve → mock ad API applies → toast "budget shifted".
6. **Learn (20s):** Decision Ledger shows expected vs realized margin bar; confidence updates.
7. **Close (20s):** "Every decision measured. Every outcome learned. No more dashboards that describe — a system that decides."

## UI Requirements (Streamlit `app/streamlit_app.py`)
| Panel | Content | Demo action |
|---|---|---|
| Header | KPI row: total spend, revenue, margin, ROAS (last 30d) | none |
| Platform mix | bar/area chart of spend & margin by platform | hover |
| Anomaly feed | red/amber cards: campaign, metric, z-score, date | click to inspect |
| RCA card | LLM/template explanation + top-3 factor bars | click from feed |
| Recommendations | table: campaign, current ₹, recommended ₹, expected Δmargin, stockout-kill flag | select + Approve button |
| Decision Ledger | decision, expected vs realized margin (bar), confidence, status | none |
| Event timeline | injected scenario events (from `data/events.json`) | scrubber optional |

## Functionality Checklist (must work live)
- [ ] `scripts/run_demo.py` regenerates data deterministically (seed=7) so the demo always tells the same story
- [ ] Anomaly feed populated with ≥5 flagged rows on the known anomaly dates
- [ ] RCA card renders within 2s (template fallback if no API key — no network dependency at demo)
- [ ] Optimizer recommends ≥1 stockout-kill and ≥3 up/down shifts
- [ ] Approve button writes to `data/ledger.jsonl` and the ledger panel refreshes
- [ ] Mock ad API `uvicorn execute.mock_ads_api:app --port 8000` reachable; Streamlit calls it for the Approve action
- [ ] Fallback: if API is down, Streamlit calls the ledger write directly (try/except)

## Team Prep Before Judges
- Seed data committed? `data/` is gitignored — each team runs `run_demo.py` once on the demo machine, or commit a frozen `data/demo_snapshot/` copy so the demo needs zero generation time.
- Pre-warm: start uvicorn + streamlit 10 min before judging.
- Laptop on hotspot, no reliance on any external API (LLM key optional; template prose is the default).
- Kill-switch rehearsal: demo the stockout-kill on amazon-SKU-100 as the "wow" moment.

## Risk Mitigations
| Risk | Mitigation |
|---|---|
| API key flake / no internet | templated RCA prose (same layout) |
| Optimizer returns no-change recs on some seeds | fix seed=7; verify recs differ from current on every campaign before demo |
| Streamlit rerun wipes state | ledger on disk (`data/ledger.jsonl`), re-read on every rerun |
| Judge asks "where's real Meta API?" | answer: mock executor simulates API mutation; swap in real client at `execute/mock_ads_api.py` boundary |
| Question on causal rigor | cite `docs/REPOS.md` references (Robyn/Meridian/causalml) as the roadmap past the hackathon |
