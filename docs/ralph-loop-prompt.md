# Ralph Wiggum Loop — Team Agents

A continuous autonomous loop for Claude Code. Each iteration spawns parallel agents to assess the codebase, picks the single most important next step, executes it, and commits — then the loop resets with a fresh context window.

## Setup

Everything is already wired up:

| File | Purpose |
|------|---------|
| `ralph.sh` | Outer loop runner — re-invokes Claude on each iteration |
| `.claude/ralph-prompt.md` | The prompt fed to Claude each iteration |
| `.claude/hooks/ralph-stop.sh` | Stop hook — blocks premature exit and re-feeds the prompt |
| `.claude/settings.local.json` | Registers the stop hook |

## Usage

```bash
# Run indefinitely (touch .ralph-stop to break)
./ralph.sh

# Run at most 10 iterations
./ralph.sh --max 10

# Full autonomy — no permission prompts (use with caution)
./ralph.sh --max 10 --dangerously-skip-permissions
```

## Stopping

```bash
# Graceful stop after the current iteration finishes
touch .ralph-stop
```

## How it works

```
┌─────────────────────────────────────────────────┐
│  ralph.sh (outer loop)                          │
│                                                 │
│  while true:                                    │
│    ┌─────────────────────────────────────────┐  │
│    │  claude -p ralph-prompt.md              │  │
│    │                                         │  │
│    │  Phase 1: Recon (3 parallel agents)     │  │
│    │    ├── State Agent   (git, TODOs)       │  │
│    │    ├── Goal Agent    (CLAUDE.md, tasks)  │  │
│    │    └── Blocker Agent (tsc, lint, test)   │  │
│    │                                         │  │
│    │  Phase 2: Decide (priority stack)       │  │
│    │    1. Fix broken build                  │  │
│    │    2. Finish in-progress work           │  │
│    │    3. Next acceptance criterion         │  │
│    │    4. Cleanup                           │  │
│    │                                         │  │
│    │  Phase 3: Execute (one change, commit)  │  │
│    │                                         │  │
│    │  Phase 4: Handoff (breadcrumb comment)  │  │
│    └─────────────────────────────────────────┘  │
│    │                                            │
│    │  stop hook fires → re-feeds prompt         │
│    │  (intra-session continuation)              │
│    │                                            │
│    └── context full? outer loop resets ──────┘  │
└─────────────────────────────────────────────────┘
```

## Two layers of looping

1. **Stop hook (inner)** — When Claude thinks it's done within a session, the stop hook blocks the exit and re-feeds the prompt. This keeps the same context window alive for multiple iterations.

2. **ralph.sh (outer)** — When the context window fills up or Claude exits cleanly, the outer script launches a brand new Claude session. Fresh context, but all progress is in the codebase.

## The prompt

See `.claude/ralph-prompt.md` for the full prompt. The core loop:

1. **Assess** — 3 parallel agents gather state, goals, and blockers
2. **Decide** — Strict priority stack picks the single most important next step
3. **Execute** — One logical change, minimum files touched, committed
4. **Handoff** — Breadcrumb `// TODO(next-loop):` comments for the next iteration
