# Tender

A mobile-first vertical video platform for civic engagement. Record, share, and respond to short-form video tied to local issues, candidates, ballot measures, and community discussions.

---

## Getting started

### Prerequisites
- Node 20+
- Docker and Docker Compose (for containerized development), or
- Expo CLI (`npx expo`) for native/local development

### Install

```bash
git clone https://git.myceli.al/deiim/tender.git
cd tender
npm install

# Configure environment
cp .env.example .env
# Fill in values — ask the project lead for Supabase secrets
```

### Run locally

```bash
# Native development (iOS/Android/Web)
npx expo start

# Or with Docker (web only)
docker-compose up -d --build
```

The web app is available at `http://localhost:8081`.

---

## Project structure

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

---

## Contributing

We use Linear for issue tracking and Cyrus (an AI agent) for development. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full team workflow, including how to write issues, work with Cyrus, and review PRs.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React Native / Expo 55 (expo-router, TypeScript) |
| Backend | Supabase (BaaS) |
| Database | PostgreSQL via Supabase |
| Video | expo-video, expo-camera |
| Auth | Supabase Auth |
| State | Zustand + TanStack React Query |
| UI | React Native Paper + Lucide icons |
| Hosting | Docker / Nginx for web |
