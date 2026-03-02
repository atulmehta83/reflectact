# Reflect Agent

**Hackathon Project** — An agent-powered retrospective analysis tool that processes meeting transcripts to extract actionable insights at multiple levels of granularity.

## Goal

Take a raw retrospective transcript and produce:

- **Per-person action items** — What each individual contributor is responsible for, with context and deadlines
- **Team-level action items** — Cross-cutting items that require coordination
- **Sprint performance summary** — High-level product/leadership digest of what went well, what didn't, and overall team health
- **Theme extraction** — Recurring patterns across retros (e.g., "documentation debt has been raised 3 sprints in a row")
- **Risk signals** — Items that were near-misses, scope creep indicators, or team health concerns

## Project Structure

```
reflect-agent/
├── README.md                 # This file
├── samples/                  # Input corpus — sample transcripts
│   └── sprint-retro-transcript.md   # Sprint 24 retro (30 min, 7 participants)
├── prompts/                  # Agent prompt templates (TBD)
├── output/                   # Sample agent outputs (TBD)
└── scripts/                  # Processing scripts (TBD)
```

## Sample Transcript

The current sample (`samples/sprint-retro-transcript.md`) is a generic software engineering sprint retrospective covering:

- 7 participants (EM, backend lead, frontend, mobile, QA, DevOps, PM)
- 3 concurrent projects (payments migration, dashboard redesign, API versioning)
- ~22 minutes of natural conversation
- 11 action items with owners and priorities
- Team health scores

### Iteration Plan

1. **v1** — Generic retro transcript (current)
2. **v2** — Tune to match internal retro patterns (Teams-specific terminology, ADO references, ECS flags, etc.)
3. **v3** — Add multi-sprint context (reference prior retro action items, track carry-over)

## Next Steps

- [ ] Define agent prompt structure for transcript ingestion
- [ ] Build extraction pipeline (action items, themes, summaries)
- [ ] Test output fidelity against manually-tagged ground truth
- [ ] Add support for multiple transcript formats (Teams meeting transcript, Zoom, raw text)
