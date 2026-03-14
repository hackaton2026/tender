# Tender — Agent Context

## Project summary
Tender is a mobile-first vertical video platform for civic engagement. Users record, share, and respond to short-form video content tied to local civic issues, candidates, ballot measures, and community discussions.

## Stack
<!-- PROJECT LEAD: Fill in the actual stack before committing -->
- **Frontend:** [e.g. React Native / Expo, or Next.js mobile-optimized]
- **Backend:** [e.g. Node/Express, Python/FastAPI]
- **Database:** [e.g. PostgreSQL, Supabase]
- **Video:** [e.g. Mux, Cloudflare Stream]
- **Auth:** [e.g. Clerk, Auth.js]
- **Hosting:** [e.g. Fly.io, Vercel, Railway]

## Repo layout
<!-- PROJECT LEAD: Update this to match actual structure once scaffolded -->
```
/
├── app/          # Mobile/frontend application
├── api/          # Backend API server
├── shared/       # Types and utilities shared between app and api
├── infra/        # Infrastructure config (do not touch without human review)
└── docs/         # Additional documentation
```

## Branch conventions
Cyrus creates branches automatically in the format:
`cyrus1/ten-{number}-{issue-slug}`

Humans working manually should use:
`feature/TEN-{number}-{slug}`

One branch per Linear issue. No exceptions.

## PR title format
`[TEN-XX] Short description of what this does`

Always link the Linear issue in the PR description.

## Before opening a PR
<!-- PROJECT LEAD: Replace with actual commands -->
- [ ] `[test command]` passes
- [ ] `[lint command]` passes
- [ ] No hardcoded secrets or API keys
- [ ] Mobile viewport tested (if frontend)

## Current priorities
<!-- PROJECT LEAD: Keep this section updated — Cyrus reads it on every task -->
[Update this with current sprint focus, e.g. "Focus on core video feed and auth — defer social features"]

## Do not touch without human review
- `infra/` — all infrastructure config
- Auth configuration and middleware
- Video ingestion pipeline
- Any file touching payments or PII

## Civic content considerations
Tender handles politically sensitive content. When generating UI copy, placeholder data, or test fixtures:
- Use neutral, non-partisan example content
- Do not generate example content favoring any candidate, party, or position
- Flag any feature that could surface or suppress content in a politically biased way

## Cyrus-specific notes
- Cyrus runs Claude Code in an isolated worktree per issue
- Each issue gets its own branch — do not reach across issues
- Leave questions and blockers as Linear comments on the issue
- If a task requires a decision outside the issue scope, open a new issue rather than making the call unilaterally
