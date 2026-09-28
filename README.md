# Mesta

Next.js (App Router) + TypeScript + Tailwind implementation of the [Mesta product plan](valencia-map-project.md):
a map guide to places in Valencia run by Russian-speaking owners. Currently: coffee shops only, real seed data
from [`mesta_coffee_valencia.xlsx`](mesta_coffee_valencia.xlsx), backed by a real Postgres/PostGIS database.

## Setup

```bash
cp .env.example .env      # first time only — set a real ADMIN_PASSWORD before deploying
npm run db:setup          # starts Docker, enables postgis, applies schema, seeds real data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The map, sidebar, and SEO place pages all read live from
Postgres via [`db/queries.ts`](db/queries.ts) (Server Components + `GET /api/places`).

Individual DB steps (`db:setup` runs all of these): `db:up` (docker compose), `db:ext` (`CREATE EXTENSION
postgis`), `db:migrate` (apply [`db/migrations`](db/migrations)), `db:seed` (upsert cities/categories/tags/places
from `lib/places-data.ts`, idempotent). `db:down` stops the container; data persists in a Docker volume across
restarts. `npm run db:nearby` is a sanity check — prints the 5 nearest places to Valencia center using the
same `<->`/`ST_Distance` query the app relies on.

Schema lives in [`db/schema.ts`](db/schema.ts) (Drizzle ORM) — matches valencia-map-project.md §7, with a
generated `location geography` column + GiST index for real "nearest N" queries. After editing the schema,
run `npm run db:generate` to produce a new SQL migration, then `npm run db:migrate`.

To point at Railway instead of local Docker later: just change `DATABASE_URL` in `.env`, no code changes.

## Submissions & moderation

- `/add` — "Add a place" wizard → `POST /api/submissions` (`kind: "add_place"`) → `submissions` table.
- `/report/[slug]` — "Report a problem" form → `POST /api/submissions` (`kind: "report_problem"`).
- `/admin` — pending-submissions queue. **Одобрить** on an `add_place` submission geocodes the address via
  Nominatim (biased to a Valencia bounding box) and creates a published `place`; **Решено**/**Отклонить**
  just update the submission's status. Protected by HTTP Basic Auth (`ADMIN_PASSWORD` in `.env`, username
  `admin`) via [`proxy.ts`](proxy.ts) — the server refuses to start serving `/admin` at all if
  `ADMIN_PASSWORD` isn't set.
- Both public forms carry a honeypot field + a minimum-fill-time check ([`lib/honeypot.ts`](lib/honeypot.ts))
  — no captcha/external service, a flagged submission gets a fake success response and is never written to the DB.
- `http://localhost:8080` — Adminer (added to `docker-compose.yml`), a point-and-click DB browser as an
  alternative to `psql`/`db:nearby` for poking at the data; log in with the same credentials as `DATABASE_URL`
  (server `db`, user/pass/db all `mesta`).

## Structure

- `app/page.tsx` — Server Component, fetches places from the DB, renders `components/home-client.tsx`
  (map + sidebar/bottom-sheet, search, tag/favorites filters — all client-side interactivity)
- `app/valencia/coffee/[slug]/page.tsx` — SSG-ish place detail page (SEO), reads DB directly
- `app/report/[slug]/page.tsx`, `app/add/page.tsx` — the two submission forms
- `app/admin/page.tsx` — moderation queue (Server Actions, no client JS needed for approve/reject)
- `app/api/places/route.ts`, `app/api/submissions/route.ts` — the two HTTP endpoints (bot will reuse `/api/places`)
- `components/map/map-view.tsx` — real MapLibre GL map (OpenFreeMap "liberty" tiles), clustering, custom pins
- `components/places/` — place card, place detail, loading/empty states
- `components/layout/` — header, mobile top bar, sidebar, bottom sheet, filter chips
- `lib/places-data.ts` — real seed place data + tag list (used only by `db/seed.ts` now, not the frontend)
- `lib/use-favorites.ts` — localStorage-backed favorites, no auth
- `db/` — Drizzle schema, queries, moderation logic, migrations, and local-dev scripts (see above)
- `app/globals.css` — light/dark theme tokens (`--color-*`), toggled via `data-theme` on `<html>`
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/icon.tsx` — Next's special-file conventions,
  auto-linked into the document head; no manual `<link>` tags needed

## Not implemented yet

Telegram bot, RU/ES/EN i18n, photo upload (needs Cloudflare R2), Telegram notification on new submissions
(needs a bot token), self-hosted PMTiles (currently OpenFreeMap's free hosted tiles), Railway/Cloudflare
deployment.
