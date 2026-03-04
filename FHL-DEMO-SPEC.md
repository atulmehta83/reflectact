# Reflect Agent — FHL Demo Spec

> **Status:** Draft
> **Last Updated:** 2026-03-04
> **Target:** FHL Demo — Interactive Retro Moderator Bot in Microsoft Teams

---

## 1. Overview

A Teams bot powered by OpenClaw that **moderates sprint retrospectives in real-time**. The bot guides the conversation through three phases, collects structured input from participants, and commits the results to GitHub as a markdown summary.

**Goal:** Demonstrate an AI-powered retro moderator that runs entirely inside a Teams chat — no external tools, no manual note-taking.

---

## 2. Demo Flow (5-minute walkthrough)

```
1. User starts retro       →  "@OpenClaw start retro for Sprint 25"
2. Bot asks Phase 1        →  "🟢 What went well? Everyone share your wins."
3. Participants respond     →  Free-form text in the chat
4. Bot summarizes Phase 1   →  Grouped themes + highlights
5. Bot asks Phase 2        →  "🔴 What didn't go well?"
6. Participants respond     →  Free-form text
7. Bot summarizes Phase 2   →  Grouped pain points + patterns
8. Bot asks Phase 3        →  "💡 What did we learn? Any action items?"
9. Participants respond     →  Free-form text
10. Bot generates report   →  Full retro summary + action items
11. Bot commits to GitHub  →  Markdown file pushed to the repo
12. Bot shares link        →  "✅ Retro saved: [link to GitHub file]"
```

---

## 3. Requirements

### 3.1 Retro Session Management

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| R1 | Start a retro with `start retro for <sprint-name>` | Must | Low |
| R2 | Bot moderates 3 phases sequentially: Well → Not Well → Lessons | Must | Low |
| R3 | Collect free-form responses from all participants in the chat | Must | Low |
| R4 | Allow 2-3 minutes per phase (configurable timer or manual advance) | Should | Low |
| R5 | Advance to next phase with `next` or automatically after timeout | Should | Low |
| R6 | End retro with `end retro` or automatically after Phase 3 | Must | Low |

### 3.2 AI Analysis & Summarization

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| R7 | After each phase, summarize responses into grouped themes | Must | Medium |
| R8 | At the end, generate a full retro report with all 3 phases | Must | Medium |
| R9 | Extract action items from Phase 3 (Lessons/Actions) with owners | Should | Medium |
| R10 | Assign priority (High/Medium/Low) to each action item | Nice | Medium |
| R11 | Keep summaries concise — max 5 bullet points per phase | Must | Low |

### 3.3 GitHub Storage

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| R12 | Commit retro summary as markdown to the repo | Must | Low |
| R13 | File path: `retros/<sprint-name>/retro-summary.md` | Must | Low |
| R14 | Include date, participants, and all 3 phase summaries | Must | Low |
| R15 | Include extracted action items table in the markdown | Should | Low |
| R16 | Share the GitHub commit link back in the Teams chat | Must | Low |

### 3.4 Output Format (GitHub Markdown)

The committed file should follow this structure:

```markdown
# Sprint 25 Retrospective

**Date:** 2026-03-04
**Participants:** Alice, Bob, Charlie
**Moderator:** OpenClaw Bot

---

## 🟢 What Went Well

- **Deployment pipeline improvements** — CI/CD changes cut deploy time by 40%
- **Cross-team collaboration** — Design and engineering synced early on the new feature
- **Bug bash results** — Cleared 15 P2 bugs in one session

## 🔴 What Didn't Go Well

- **Flaky tests** — E2E suite blocked 3 PRs this sprint
- **Scope creep** — Two unplanned features added mid-sprint
- **On-call fatigue** — False positives in alerting woke up the team twice

## 💡 Lessons Learned & Action Items

- **Lesson:** Need better test isolation → **Action:** Set up per-PR test environments (Owner: Bob, Priority: High)
- **Lesson:** Scope changes need a gate → **Action:** Add mid-sprint scope review checkpoint (Owner: Alice, Priority: Medium)
- **Lesson:** Alert thresholds are stale → **Action:** Audit PagerDuty rules this sprint (Owner: Charlie, Priority: High)

## Action Items Summary

| # | Action Item | Owner | Priority | Target |
|---|-------------|-------|----------|--------|
| 1 | Set up per-PR test environments | Bob | High | Sprint 26 |
| 2 | Add mid-sprint scope review checkpoint | Alice | Medium | Sprint 26 |
| 3 | Audit PagerDuty alert rules | Charlie | High | Next week |
```

---

## 4. Technical Approach

### 4.1 Architecture

```
Teams Chat  →  OpenClaw Bot  →  GPT-4o  →  Structured Summary  →  GitHub API
                    │                                                    │
                    └── Collects messages ──────────────────────────────┘
                        per phase, sends                          Commits .md
                        to LLM for summary                        to repo
```

### 4.2 Implementation Notes

- **Bot platform:** OpenClaw with msteams plugin (already deployed on ADC sandbox)
- **LLM:** OpenAI GPT-4o via OpenClaw's built-in model routing
- **GitHub integration:** Use GitHub PAT + `git` CLI in the sandbox shell
- **Session state:** OpenClaw's persistent workspace — store phase responses in a JSON file during the retro, clear on completion
- **No new code needed:** OpenClaw's agent can be instructed via system prompt to follow the retro moderator flow. The "implementation" is a well-crafted prompt + the existing shell/GitHub tools.

### 4.3 System Prompt (Agent Instructions)

The bot should be given instructions like:

> You are a retrospective moderator. When asked to start a retro:
> 1. Ask "🟢 What went well?" and collect responses for 2 minutes
> 2. Summarize into themes, then ask "🔴 What didn't go well?"
> 3. Summarize, then ask "💡 Lessons learned & action items?"
> 4. Generate a full retro report in markdown
> 5. Commit it to the GitHub repo and share the link

---

## 5. Demo Checklist

- [ ] Bot responds to "start retro for Sprint 25"
- [ ] Bot walks through 3 phases with emoji headers
- [ ] Bot summarizes each phase before moving to the next
- [ ] Bot generates final markdown report
- [ ] Bot commits to `retros/sprint-25/retro-summary.md` in GitHub
- [ ] Bot shares the GitHub link in the chat
- [ ] Works in both 1:1 and group chat

---

## 6. What's Out of Scope (for FHL Demo)

- Multi-transcript historical analysis (future, see main SPEC.md)
- Per-person digest delivery (future)
- ADO/Jira work item creation from action items (stretch)
- Anonymous mode / survey-style input
- Audio/transcript ingestion (bot works from chat messages only)

---

## 7. Success Criteria

| Criteria | Target |
|----------|--------|
| End-to-end demo works in Teams | Yes |
| Retro summary committed to GitHub | Yes |
| Summary is accurate and well-structured | Qualitative review |
| Total demo time | < 5 minutes |
| Setup complexity | Zero — bot is already deployed |
