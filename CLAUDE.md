# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (see `pnpm-lock.yaml` and `Dockerfile`); the README's `npm` examples still work but pnpm is the source of truth.

| Command          | Action                                          |
| :--------------- | :---------------------------------------------- |
| `pnpm install`   | Install dependencies                            |
| `pnpm dev`       | Next.js dev server on `localhost:3000`          |
| `pnpm build`     | Production build (`output: "standalone"`)       |
| `pnpm start`     | Run the production build                        |
| `pnpm lint`      | ESLint (uses flat config in `eslint.config.mjs`) |

There is no test runner configured. There is a standalone `diagnose.js` script at the repo root used as a one-off env/DB connectivity check — it is not part of any build step.

Docker: `docker-compose up -d` builds and runs the standalone Next.js output on port 3000 (`Dockerfile` is multi-stage, Node 20 alpine + pnpm).

## Stack

- **Next.js 16.1.6** App Router + **React 19.2** + **TypeScript 5**
- **Tailwind v4** with the `@tailwindcss/postcss` plugin (no `tailwind.config.js`; CSS-first config lives in `src/app/globals.css` / `src/styles/`)
- **shadcn/ui** style "new-york", path aliases via `@/*` (see `components.json`)
- **Supabase** (`@supabase/supabase-js`) for the email queue. The server uses the `service_role` key and bypasses RLS.
- **n8n** webhook integration for actually sending email
- `html2canvas` + `file-saver` + `jszip` for client-side PNG / batch zip export
- `react-draggable` + `framer-motion` for the editor UX

## Architecture

The app is a Next.js App Router project with three primary user surfaces and one async pipeline:

### 1. Editor (`src/app/generator/`, `src/components/certificate/`)
Drag-and-drop certificate composer. State is the `Certificate` shape from `src/types/certificates.ts`:
- `TextElement[]` and `ImageElement[]` are positioned absolutely on a `CertificateTemplate` background.
- `canvas.tsx` is the editing workspace; `draggable-text.tsx` handles per-element manipulation; `text-controls.tsx` / `image-controls.tsx` are the side-panel inspectors.
- `download-button.tsx` rasterises the canvas via `html2canvas` at 2x and saves a PNG; `batch-generator.tsx` does the same in a loop driven by a CSV (parsed with `papaparse`) and bundles results with `jszip`.

### 2. Email queue dashboard (`src/app/email-queue/`, `src/components/email-queue/`)
A PostgreSQL-backed list of pending/sending/sent/failed emails with auto-refresh and filters. Talks to the `/api/email-queue` route.

### 3. Templates (`src/app/templates/`, `public/certificates/`)
Templates live as `public/certificates/templateN.png` (N = 1..20). The upload API picks the next free slot in that range and writes the PNG to disk — there is **no database row for templates**, the filesystem is the source of truth, and the 20-template cap is hard-coded.

### 4. API routes (`src/app/api/`)
- `email-queue/route.ts` — GET/POST/PATCH/DELETE for queue items. **POST refuses to enqueue when the table already has ≥50 rows** (HTTP 429).
- `batch-send/route.ts` — sends up to 50 queue items per call to the n8n webhook. Marks each item `sending` → `sent` (on 2xx webhook ack) or `failed`. **The 2xx ack is treated as delivery**; there is no callback from n8n to flip `sent` later, so n8n failures after the webhook returns will not be reflected here.
- `update-status/route.ts` — endpoint n8n can call back to override status if you do wire it up.
- `send-certificate/route.ts` — single-recipient send path.
- `templates/upload`, `templates/delete` — filesystem operations on `public/certificates/`.

### Data layer
- **`src/lib/db.ts`** is the active module. It wraps a Supabase JS client (created with the `service_role` key) and exports `insertEmailQueue` / `getEmailQueue` / `getEmailQueueByIds` / `updateEmailQueueStatus` / `deleteEmailQueue` / `getEmailQueueStats` / `testConnection`. All `src/app/api/**` routes import from here — none of them talk to Supabase directly. The `supabase` client itself is also exported, but importing it from a client component is unsafe (it carries the service-role key).
- **`supabase/migrations/0001_init_email_queue.sql`** is the source of truth for the schema. Paste it into the Supabase SQL editor on a fresh project, or run via `supabase db push`. Idempotent — safe to re-run. RLS is enabled with no policies, so only the `service_role` key can read/write.
- **`src/lib/db/` (client.ts + schema.ts)** — Drizzle + libsql/SQLite scaffolding that writes to `data/certificates.db`. Nothing in `src/app/` imports it. Dormant; leave it unless you're deliberately cleaning it up.

`email_queue.certificate_image` is a base64 data URL of the rendered PNG, so rows are large — keep the 50-row queue cap in mind. Status is constrained to `pending | sending | sent | failed` by a CHECK constraint in the migration; if you add a new state, update the migration too.

### Auth — important gotcha
`src/lib/auth.ts` is a **client-side fake auth** that stores `user` + `isAuthenticated` in `localStorage`. The hardcoded users are `admin/admin123`, `demo/demo123`, `user/user123` — these do **not** match the README's `admin / CertifiKit2024!` claim. There is no middleware-enforced protection on routes or APIs; `components/auth/protected-route.tsx` only gates client rendering. Anything reachable via direct `fetch` to `/api/*` is effectively public. Don't treat this as production auth.

## Environment variables

Required at runtime (see `.env` for the labeled template):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key. Bypasses RLS. Never expose to the browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — included for completeness; not used by current server code but required if a client-side Supabase client is added later.
- `N8N_WEBHOOK_URL` — destination for `batch-send` / `send-certificate`. Routes return 500 if unset.

Optional:
- `N8N_API_KEY` — JWT for the n8n REST API. Used only by external tooling (e.g. the n8n MCP server), not by the app itself.

## Conventions worth keeping

- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- shadcn components go in `src/components/ui/`, app-specific composites in sibling folders (`certificate/`, `email-queue/`, `auth/`, `layout/`, `onboarding/`).
- The hard limits — **50-item queue cap, 50-item batch send cap, 20-template cap** — are enforced in route handlers, not config. If you change one, update all the relevant error messages and the README claim too.
- `next.config.ts` sets `output: "standalone"` (needed for the Docker image) and registers a webpack rule for font files in `src/assets/fonts/`. Don't drop either without checking the Dockerfile and Merriweather loading still work.
