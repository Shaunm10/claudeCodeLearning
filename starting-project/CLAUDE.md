# CLAUDE.md

We're building the app described in @projectSpec.md . Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information. Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start Next.js dev server (http://localhost:3000)
bun run build    # Production build
bun run lint     # ESLint
bun run db:migrate  # Run SQL migrations (script not yet created — see scripts/migrate.ts)
```

No test runner is configured yet.

## Architecture

This is a **Next.js 16 App Router** application using **Bun** as both the runtime and package manager. It is a note-taking app where authenticated users can create/manage rich-text notes and optionally share them publicly.

### Data flow

Client components call Next.js API Routes (`app/api/...`) via `fetch()`. API routes access SQLite directly using Bun's native `bun:sqlite` — there is no ORM. The DB client is initialized in `lib/db.ts`; the DB file path comes from the `DB_PATH` env var (default: `data/app.db`).

### Authentication

**better-auth** manages sessions. The catch-all route at `app/api/auth/[...all]/route.ts` handles all auth endpoints. Every protected API route must verify the session via better-auth and return `401` if invalid. Auth is configured in `lib/auth.ts`. Required env var: `BETTER_AUTH_SECRET` (32+ chars).

### Database migrations

Raw `.sql` files live in `scripts/migrations/` (named `0001_*.sql`, `0002_*.sql`, …). A custom Bun script at `scripts/migrate.ts` runs them sequentially. The four better-auth tables (`user`, `session`, `account`, `verification`) plus the custom `notes` table make up the full schema. All timestamps are Unix integers; boolean flags are `INTEGER` (0/1).

### Rich-text editor

**TipTap v3** is used with a fixed extension set — do not add extensions beyond what the spec defines:

- Core: `Document`, `Paragraph`, `Text`
- Marks: `Bold`, `Italic`
- Nodes: `Heading` (levels 1–3 only), `BulletList`, `ListItem`, `HorizontalRule`

Note content is saved/loaded as `editor.getJSON()` (stringified JSON stored in the `notes.content` column).

### UI components

All UI is built from scratch with **TailwindCSS v4** — no component library. Custom components go in `components/ui/`; TipTap wrapper and toolbar go in `components/editor/`.

### Target project structure

```
app/
  api/
    auth/[...all]/route.ts   # better-auth handler
    notes/route.ts           # GET (list), POST (create)
    notes/[id]/route.ts      # GET, PUT, DELETE
    public/notes/[id]/route.ts  # unauthenticated shared-note read
  (auth)/login/ and register/ # Auth pages
  dashboard/                 # Protected note list
  editor/[id]/               # TipTap editor
  shared/[id]/               # Public read-only view
components/ui/
components/editor/
lib/
  auth.ts                    # better-auth config
  db.ts                      # bun:sqlite client
scripts/
  migrate.ts
  migrations/
```

### Deployment

Single Docker container with a mounted volume for the SQLite file. Start command: `bun run start`.

The full technical specification (data model, API contract, UI requirements) is in `../projectSpec.md`.
