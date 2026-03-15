# Tender — Agent Context

## Project summary
Tender is a mobile-first vertical video platform for civic engagement. Users record, share, and respond to short-form video content tied to local civic issues, candidates, ballot measures, and community discussions.

## Stack
- **Frontend:** React Native / Expo 55 (expo-router, TypeScript)
- **Backend:** Supabase (BaaS — no separate API server)
- **Database:** PostgreSQL via Supabase
- **Video:** expo-video, expo-camera
- **Auth:** Supabase Auth
- **State:** Zustand + TanStack React Query
- **UI:** React Native Paper + Lucide icons
- **Forms:** React Hook Form + Zod
- **Hosting:** Docker / Nginx for web deployment

## Repo layout
```
/
├── app/          # Expo Router pages and screens
├── src/          # Source code (components, hooks, lib, store, utils, types)
├── components/   # Shared UI components
├── constants/    # App constants (e.g. Colors)
├── assets/       # Images, fonts, splash screens
├── docs/         # Docker and quickstart guides
└── supabase-schema.sql  # Database schema
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
- [ ] `npx tsc --noEmit` passes (type checking)
- [ ] No hardcoded secrets or API keys
- [ ] Mobile viewport tested (if frontend)

## Current priorities
Focus on core proposal feed, video recording, and auth — defer social features and notifications.

## Do not touch without human review
- Docker and deployment config (`Dockerfile`, `docker-compose.yml`)
- Supabase auth configuration and RLS policies
- `supabase-schema.sql` — database schema
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
