# Reflect Agent — Technical Specification

> **Status:** Draft  
> **Last Updated:** 2026-03-02  
> **Authors:** Hugo Gonzalez, Team Phoenix Hackathon Group

---

## 1. Problem Statement

Sprint retrospectives generate valuable insights — action items, risk signals, team sentiment, recurring themes — but that information is trapped inside meeting transcripts and facilitator notes. Extracting, organizing, and routing this information to the right people at the right granularity is manual, inconsistent, and often incomplete.

**Reflect Agent** automates the analysis of retrospective transcripts to produce structured, actionable output tailored to different audiences.

---

## 2. Core Capabilities

### 2.1 Action Item Extraction

Parse the transcript to identify concrete action items, including:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier | `AI-001` |
| `description` | What needs to be done | "Set up automatic API dependency mapping" |
| `owner` | Assigned individual(s) | `["Marcus Johnson", "James Rodriguez"]` |
| `priority` | High / Medium / Low | `High` |
| `target_date` | When it should be completed | `"End of Sprint 25"` |
| `source_timestamp` | Where in the transcript it was raised | `[00:13:40]` |
| `context` | Surrounding discussion that motivated the item | Summary of the API consumer discovery gap |
| `category` | Tooling / Process / Infrastructure / Documentation | `Tooling` |

### 2.2 Per-Person Summary

For each participant, generate a personalized digest:

- **Their action items** — items they own or co-own
- **Items that affect them** — decisions or changes relevant to their role
- **Feedback received** — shoutouts, constructive observations directed at them
- **Commitments made** — things they verbally agreed to during the meeting

### 2.3 Team-Level Summary

A leadership/product-facing digest:

- **Sprint performance highlights** — key wins and deliverables
- **Risk signals** — near-misses, alert fatigue, scope creep patterns
- **Team health** — aggregated sentiment score with individual variance
- **Recurring themes** — items that appear across multiple retros (requires multi-transcript context)
- **Recommendations** — suggested focus areas for the upcoming sprint

### 2.4 Theme & Pattern Detection

When multiple transcripts are available:

- Track action item completion rates across sprints
- Identify topics that recur without resolution (e.g., "documentation debt raised 3 sprints in a row")
- Detect sentiment trends per person over time

---

## 3. Input Format

### 3.1 Transcript Structure

The agent accepts transcripts in the following format:

```
**[HH:MM:SS] Speaker Name:** Spoken content goes here.
```

Transcripts should include:
- **Header metadata** — date, duration, facilitator, participant list with roles
- **Timestamped dialogue** — every speaker turn with a timestamp
- **Section markers** (optional) — `## What Went Well`, `## What Didn't Go Well`, `## Action Items`

### 3.2 Supported Sources (Target)

| Source | Format | Status |
|--------|--------|--------|
| Manual markdown | `.md` with timestamps | Supported (current) |
| Microsoft Teams meeting transcript | `.vtt` / `.docx` | Planned |
| Zoom transcript | `.vtt` | Planned |
| Raw text (no timestamps) | `.txt` | Planned |
| Audio (speech-to-text) | `.m4a` / `.wav` | Stretch goal |

---

## 4. Output Schema

All outputs are structured JSON to allow downstream consumption by dashboards, notification systems, or other agents.

### 4.1 Action Items Output

```json
{
  "retro_id": "sprint-24-retro",
  "date": "2026-02-27",
  "action_items": [
    {
      "id": "AI-001",
      "description": "Set up automatic API dependency mapping",
      "owners": ["Marcus Johnson", "James Rodriguez"],
      "priority": "high",
      "target": "End of Sprint 25",
      "category": "tooling",
      "source_timestamp": "00:13:40",
      "context": "API versioning work revealed 9 downstream consumers instead of expected 4. No automated discovery exists.",
      "related_discussion": ["00:04:35", "00:05:08", "00:05:37"]
    }
  ]
}
```

### 4.2 Per-Person Summary Output

```json
{
  "participant": "James Rodriguez",
  "role": "DevOps Engineer",
  "action_items_owned": ["AI-001", "AI-003", "AI-004", "AI-007"],
  "items_affecting_me": ["AI-005"],
  "shoutouts_received": [
    {
      "from": "Marcus Johnson",
      "context": "Blue-green deployment setup — zero-downtime cutover on a payment system",
      "timestamp": "00:16:26"
    }
  ],
  "commitments": [
    "Fix build caching on CI (early sprint)",
    "Prototype Docker Compose test DB (mid-sprint)",
    "Alert threshold audit with PagerDuty data (end of next week)"
  ],
  "health_score": 3.0,
  "health_note": "Stretched thin across action items"
}
```

### 4.3 Team Summary Output

```json
{
  "retro_id": "sprint-24-retro",
  "sprint": "Sprint 24",
  "team": "Team Phoenix",
  "health_score_avg": 3.75,
  "highlights": [
    "Payments service migration completed 2 days ahead of schedule",
    "Zero-downtime blue-green deployment on payment system",
    "Design system token rollout — smooth cross-platform adoption",
    "Stakeholder demo received overwhelmingly positive VP feedback"
  ],
  "risks": [
    "Mobile build times degraded 83% (12 min → 22 min) — affects entire mobile team",
    "E2E test suite 23% flaky (12/53 tests) — blocking PR merges",
    "API consumer discovery gap — 5 unknown downstream consumers found mid-sprint",
    "Alert fatigue — 3 false-positive pages including a 3 AM wake-up"
  ],
  "scope_creep_incidents": 3,
  "recurring_themes": ["documentation debt", "build time regression"],
  "action_item_count": 11,
  "action_items_by_priority": { "high": 4, "medium": 5, "low": 2 }
}
```

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Input Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Markdown │  │ VTT/DOCX │  │ Raw Text / Audio  │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       └──────────────┼─────────────────┘             │
│                      ▼                               │
│             Transcript Normalizer                    │
│        (→ unified timestamped format)                │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Analysis Layer                       │
│                                                      │
│  ┌────────────────┐  ┌──────────────────────────┐    │
│  │ Action Item    │  │ Sentiment / Health        │    │
│  │ Extractor      │  │ Analyzer                  │    │
│  └───────┬────────┘  └────────────┬─────────────┘    │
│          │                        │                  │
│  ┌───────┴────────┐  ┌───────────┴──────────────┐    │
│  │ Owner / Role   │  │ Theme & Pattern           │    │
│  │ Resolver       │  │ Detector                  │    │
│  └───────┬────────┘  └────────────┬─────────────┘    │
│          └────────────┬───────────┘                  │
│                       ▼                              │
│              Structured Output Builder               │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Output Layer                         │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ Per-     │  │ Team-Level   │  │ Cross-Sprint  │   │
│  │ Person   │  │ Summary      │  │ Trends        │   │
│  │ Digest   │  │ (Leadership) │  │ (Multi-Retro) │   │
│  └──────────┘  └──────────────┘  └───────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 6. Project Structure

```
reflect-agent/
├── SPEC.md                          # This file — technical specification
├── README.md                        # Project overview and quick start
├── samples/                         # Input corpus
│   └── sprint-retro-transcript.md   # Sample transcript (v1 — generic)
├── prompts/                         # Agent prompt templates
│   ├── extract-action-items.md      # Prompt for action item extraction
│   ├── per-person-summary.md        # Prompt for individual contributor digest
│   ├── team-summary.md              # Prompt for leadership-level summary
│   └── theme-detection.md           # Prompt for cross-retro pattern detection
├── schemas/                         # JSON schemas for output validation
│   ├── action-items.schema.json
│   ├── person-summary.schema.json
│   └── team-summary.schema.json
├── output/                          # Sample / reference outputs
│   └── sprint-24/                   # Outputs generated from sample transcript
├── scripts/                         # Processing and utility scripts
│   └── run-analysis.py              # CLI entry point for processing a transcript
└── docs/                            # Additional documentation
    └── transcript-format-guide.md   # How to prepare transcripts for ingestion
```

---

## 7. Agent Guidelines

### For AI Agents Working in This Repo

- **Input corpus lives in `samples/`** — add new transcripts here, one file per retro session
- **Prompt templates live in `prompts/`** — these are the instruction sets the agent uses to process transcripts. Iterate on these to improve extraction quality.
- **Output goes to `output/<retro-id>/`** — one directory per analyzed retro containing all generated JSON files
- **Schemas in `schemas/`** define the contract — any change to output structure must update the schema first
- **Do not hardcode participant names or project names** — the agent must generalize across any retrospective
- **Preserve timestamps** — every extracted item must reference the source timestamp(s) in the transcript for traceability
- **Test against ground truth** — the action items table at the bottom of each sample transcript serves as the manually-tagged ground truth for validation

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Transcript files | `<team>-sprint-<N>-retro.md` | `phoenix-sprint-24-retro.md` |
| Output directories | `<team>-sprint-<N>/` | `phoenix-sprint-24/` |
| Prompt files | `<capability>.md` | `extract-action-items.md` |
| Schema files | `<output-type>.schema.json` | `action-items.schema.json` |

### Contribution Workflow

1. **Pick a capability** from the Architecture section (e.g., "Action Item Extractor")
2. **Write or refine the prompt** in `prompts/`
3. **Run it against a sample transcript** and save output to `output/`
4. **Compare output against ground truth** (action items table in the transcript)
5. **Iterate on the prompt** until extraction accuracy meets expectations
6. **Commit with a descriptive message** following conventional commits (`feat:`, `fix:`, `docs:`, `refine:`)

---

## 8. Evaluation Criteria

How we measure whether the agent is performing well:

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Action item recall | ≥ 95% | All manually-identified action items are captured |
| Action item precision | ≥ 90% | No hallucinated or duplicate action items |
| Owner attribution accuracy | 100% | Correct person assigned to each item |
| Priority assignment accuracy | ≥ 85% | Matches human judgment on High/Medium/Low |
| Timestamp traceability | 100% | Every item links back to source transcript location |
| Summary completeness | Qualitative | Leadership summary covers all key wins and risks |
| Latency | < 30s | Full analysis of a 30-min transcript completes in under 30 seconds |

---

## 9. Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| **P0** | Sample transcript + spec + repo setup | **Done** |
| **P1** | Action item extraction prompt + schema + baseline output | Not started |
| **P2** | Per-person summary prompt | Not started |
| **P3** | Team-level summary prompt | Not started |
| **P4** | Multi-format transcript ingestion (VTT, DOCX) | Not started |
| **P5** | Cross-sprint theme detection (multi-transcript) | Not started |
| **P6** | Integration with Teams / Slack notification delivery | Stretch |

---

## 10. Open Questions

- [ ] What LLM backend are we targeting? (GPT-4o, Claude, local model, configurable?)
- [ ] Do we want real-time processing (streaming transcript) or batch-only?
- [ ] Should the per-person digest be delivered as a Teams message, email, or both?
- [ ] How do we handle transcripts where speakers aren't clearly identified?
- [ ] Should we integrate with ADO to auto-create work items from extracted action items?
- [ ] Privacy considerations — are transcripts stored, or processed ephemerally?
