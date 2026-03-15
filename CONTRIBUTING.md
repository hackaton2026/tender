# Contributing to Tender

Tender uses a Linear + Cyrus workflow. Cyrus is an AI agent that picks up Linear issues and opens PRs automatically. Your job is to write good issues and review good PRs — not to run Claude Code locally (though you can if you want to).

---

## Setup

1. Clone the repo
   ```bash
   git clone git@github.com:hackaton2026/tender.git
   cd tender
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy environment config
   ```bash
   cp .env.example .env
   # Fill in values — ask the project lead for Supabase secrets
   ```

4. Run locally
   ```bash
   npx expo start
   ```

---

## How our workflow runs

We use **Linear** to track work and **Cyrus** as our AI developer teammate. When you assign a Linear issue to Cyrus, it spins up in an isolated environment, runs Claude Code, and opens a PR — usually within minutes for well-scoped issues.

**You don't need to run Claude Code locally.** Focus on writing clear issues and doing thorough reviews.

---

## Writing a Cyrus-ready issue

This is the most important skill on the team. Cyrus is only as good as the issue it's given.

**Use this template** (also available in Linear's template settings):

```
## Context
[1-2 sentences: why this exists, what it connects to]

## Task
[Specific, unambiguous description of what "done" looks like]

## Acceptance criteria
- [ ] ...
- [ ] ...

## Files likely involved
[Optional, but helps: list the files or directories Cyrus should look at]

## Branch
cyrus1/ten-{number}-{slug}  ← Cyrus fills this in automatically
```

**What makes a good issue:**
- The acceptance criteria are checkable — someone can look at the PR and verify each one
- The scope is 2–4 hours of work (for a human); Cyrus is faster, but small issues merge faster and conflict less
- Ambiguous decisions are resolved *before* assigning to Cyrus, not left for it to guess
- Related issues are linked using Linear's **blocks / blocked by** relationships

**What makes a bad issue:**
- "Build the video feed" (too broad)
- "Fix the bug" (no context)
- Acceptance criteria that require design judgment Cyrus can't make

---

## Picking up work

1. Go to Linear → Tender project → filter by **Ready**
2. Assign yourself as the **owner** (so the team knows you're shepherding it)
3. Assign **Cyrus** as the agent — this triggers it to start working
4. Move the issue to **In Progress**

If you're doing the work yourself (not via Cyrus):
1. Assign just yourself, move to In Progress
2. `git checkout -b feature/TEN-{number}-{slug}`
3. Work, commit, push, open PR

### Using the Ralph loop for larger tasks

For bigger issues where you want Claude Code to work autonomously through multiple steps, we have a **Ralph Wiggum loop** set up. Instead of babysitting Claude, the loop continuously re-invokes it — each iteration assesses the codebase, picks the single most important next step, executes it, and commits.

**One-time setup** — add the stop hook to your local settings (this file is gitignored):

```bash
# .claude/settings.local.json — add the hooks block
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/ralph-stop.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Running it:**

```bash
./ralph.sh                # Run until you touch .ralph-stop
./ralph.sh --max 10       # Cap at 10 iterations
./ralph.sh --max 10 --dangerously-skip-permissions  # Full autonomy
```

**Stopping it:**

```bash
touch .ralph-stop         # Stops after the current iteration finishes
```

Each iteration spawns three parallel agents (state, goals, blockers), then uses a priority stack to decide what to do next: fix broken builds first, then finish in-progress work, then tackle the next acceptance criterion. Progress lives in git — when the context window fills up, a fresh session picks up where the last left off.

See `docs/ralph-loop-prompt.md` for the full architecture and prompt details.

---

## Reviewing a Cyrus PR

Cyrus PRs are usually 90–95% complete. Your review should:

- **Verify acceptance criteria** — check each one in the PR diff
- **Test locally** — pull the branch and run it
- **Leave feedback in Linear** — Cyrus monitors the Linear issue for comments, not just GitHub. If you want Cyrus to fix something, comment on the issue
- **Merge when ready** — use squash merge, keep the `[TEN-XX]` prefix in the commit message

**When to iterate vs. rewrite:**
- Small corrections → comment on the Linear issue, Cyrus will address them
- The approach is fundamentally wrong → close the PR, rewrite the issue with clearer constraints, reassign to Cyrus
- The issue was underspecified → update the issue before asking Cyrus to try again

---

## Avoiding conflicts

| Do this | Avoid this |
|---|---|
| One issue per person / per Cyrus session | Multiple people on the same issue |
| Work on different files/modules | Editing the same files in parallel |
| Pull main before starting new work | Long-running branches without syncing |
| Sequence issues that touch the same file | Parallelizing changes to shared files |
| Flag blockers in Linear immediately | Sitting on a blocked issue in silence |

If two issues need to touch the same file, use Linear's **blocks** relationship to sequence them rather than parallelizing.

---

## Status flow

```
Backlog → Ready → In Progress → In Review → Done
```

- **Backlog:** Identified but not yet scoped
- **Ready:** Fully written, Cyrus-assignable, all decisions made
- **In Progress:** Cyrus (or a human) is actively working it
- **In Review:** PR is open, awaiting review
- **Done:** Merged to main

---

## Getting unblocked

- Add the `blocked` label in Linear and leave a comment explaining why
- Ping in the team channel — don't sit on it
- If you're blocked on a dependency issue, use Linear's **blocked by** relationship so the project lead can reprioritize

---

## A note on civic content

Tender is a civic engagement platform. Keep generated content, test data, and UI copy neutral and non-partisan. If you're writing placeholder content, use fictional but realistic civic scenarios rather than real political figures or positions.
