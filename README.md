# Deadline Radar

> Tracks ML/neuro/comp-bio conference deadlines and exports them to your calendar.


A focused, always-current deadline dashboard for **ML / neuroscience /
computational-biology** conferences and workshops. It tells you when the next
abstract and paper deadlines are, color-codes them by urgency, counts down to
the next ones, and lets you drop any deadline straight into your calendar.

![Deadline Radar](public/radar.svg)

## What it does

- **Deadline board** — a filterable, sortable grid of ~34 venues with short
  name, full name, category tags, abstract/paper deadlines, notification date,
  event dates, location, and website link.
- **Calendar view** — a month grid that plots every milestone (abstract, paper,
  notification, event) with the same urgency colors; page forward/back by month.
- **Filters & search** — free-text search, category chips (ML, NeuroAI,
  CompBio, CV, NLP, Neuroscience, MedImaging, …), a "deadline within N days"
  window, hide-passed toggle, and three sort orders.
- **Urgency colors** — deadlines are bucketed ≤7 days (red), ≤30 (amber),
  ≤90 (sky), 90+ (green), passed (grey).
- **Countdowns** — a live day/hour/minute/second countdown to the next three
  deadlines, plus a compact countdown on each card.
- **Add to calendar** — download a well-formed `.ics` (RFC 5545) for any single
  venue (all its milestones, each with a 7-day reminder), a **bulk `.ics`** for
  the whole filtered list, and a one-click **Add to Google Calendar** link.
- **Confidence flags** — every venue is tagged `confirmed` / `approx.` / `TBD`
  so you know which dates to double-check.

## Run it

Requires Node 18+ (built and tested on Node 20/24).

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
```

Then open the printed URL (default http://localhost:5173).

## Build & preview

```bash
npm run build    # type-checks (tsc -b) then builds to dist/
npm run preview  # serve the production build locally
```

`npm run build` runs the TypeScript compiler in strict mode first, so a
successful build means there are no type errors.

## Deploy

The build is a fully static site in `dist/` — host it anywhere. Deploy configs
are checked in: `vercel.json`, `netlify.toml`, and a `Dockerfile`, each with an
SPA fallback so unknown routes serve `index.html`.

**Vercel** (`vercel.json` included)

```bash
npm i -g vercel          # once
vercel --prod            # from the app directory
```

Or import the repo — the framework preset auto-detects as **Vite**
(build `npm run build`, output `dist`).

**Netlify** (`netlify.toml` included)

```bash
npm i -g netlify-cli     # once
netlify deploy --prod    # build command + publish dir come from netlify.toml
```

Or drag the `dist/` folder into the Netlify dashboard.

**Docker** (`Dockerfile` + `nginx.conf` included — multi-stage build served by
`nginx:alpine` with an SPA fallback)

```bash
docker build -t deadline-radar .
docker run -p 8080:80 deadline-radar   # then open http://localhost:8080
```

**Other static hosts**

- **GitHub Pages** — run `npm run build`, then publish the `dist/` folder (add a
  `base` option to `vite.config.ts` if serving from a sub-path).
- **Any static host / S3 / nginx** — copy the contents of `dist/` to the web
  root.

By default (no environment variables) there is no backend and no database — all
data ships in the bundle. To turn it into a real multi-user product with
accounts and a centrally-updatable dataset, see **Make it real** below.

## Make it real / Production setup (Supabase)

The app runs in two modes, decided at runtime by whether two env vars are set:

- **Zero-config (default):** no env vars → deadlines come from the static seed
  (`src/data/deadlines.ts`) and saved venues live in `localStorage`. No account
  needed. This is what you get out of the box.
- **Cloud mode:** set the two `VITE_SUPABASE_*` vars → the app adds email
  magic-link sign-in, loads the deadline list from a **public Supabase
  `deadlines` table**, and syncs each user's saved venues and reminder
  preference to Postgres. If the table is empty or a fetch fails, it
  automatically falls back to the seed, so the board is never blank.

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com), create a project, and grab
**Project Settings → API**:

- `Project URL`  → `VITE_SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

Both are safe to ship in a client bundle; access is controlled by row-level
security (RLS), not by hiding the anon key.

### 2. Run the migrations (schema + seed)

In the Supabase dashboard **SQL editor**, run the two files in order:

1. `supabase/migrations/0001_init.sql` — creates the `deadlines`,
   `saved_deadlines`, `reminder_prefs`, and `admins` tables, enables RLS, and
   installs the policies (public read on `deadlines`; per-user access on the
   others).
2. `supabase/migrations/0002_seed_deadlines.sql` — inserts the current dataset
   so a fresh project is populated. This file is **auto-generated** from
   `src/data/deadlines.ts`; regenerate it any time with `npm run seed:gen`.

Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db
push` (both files live under `supabase/migrations/`).

### 3. Set env vars — locally and in Vercel

Copy `.env.example` to `.env.local` and fill in the two values for local dev.
For production, add the **same two variables** in your host's settings — in
Vercel: **Project → Settings → Environment Variables** — then redeploy so the
build picks them up. (Vite inlines `VITE_*` vars at build time, so a rebuild is
required after changing them.)

### 4. Enable email sign-in

In Supabase **Authentication → Providers**, make sure **Email** is enabled
(magic link / OTP). Add your production URL under **Authentication → URL
Configuration → Redirect URLs** so the magic link returns users to your site.

### Keeping deadlines fresh — the actual maintenance job

Once in cloud mode, **the live product data is the `deadlines` table, not the
code.** Keeping it current is the real ongoing work:

- **Edit dates/venues** by updating rows in the `deadlines` table — via the
  Supabase **Table editor**, SQL, or the service-role key from a script. Changes
  appear for all users on their next load; no redeploy needed.
- **Bulk refresh from the repo:** edit `src/data/deadlines.ts`, run
  `npm run seed:gen`, and re-run `0002_seed_deadlines.sql`. It's an idempotent
  `INSERT … ON CONFLICT (id) DO UPDATE`, so it upserts every row in place.
- **Who may write:** table writes are locked by RLS to the **service role**
  (which bypasses RLS — use it for scripts/automation) or to users listed in the
  `admins` table. Make yourself an admin after signing in once:

  ```sql
  insert into public.admins (user_id) values ('<your-auth-user-uuid>');
  ```

  Find your UUID under **Authentication → Users**.

> As always: the seed dates are **starting values for the 2026–2027 cycle** and
> must be verified against each venue's official Call for Papers. The
> `confidence` flag (`confirmed` / `approximate` / `tbd`) tells you which to
> double-check. Verifying and updating these is exactly the maintenance job
> above.

## Add or edit venues

All venue data lives in one editable module:

```
src/data/deadlines.ts
```

Each entry is a `Deadline` object. To **add** a venue, copy an existing block,
give it a unique `id`, and fill in the fields. To **edit** one, just change its
fields — the board, calendar, filters, countdowns, and `.ics` export all read
from this array automatically.

Key fields:

| Field              | Meaning                                                        |
| ------------------ | ------------------------------------------------------------- |
| `id`               | Unique slug, e.g. `"neurips-2026"`.                            |
| `name` / `fullName`| Short and full display names.                                 |
| `categories`       | One or more tags (`"ML"`, `"NeuroAI"`, `"CompBio"`, …).        |
| `abstractDeadline` | ISO date, e.g. `"2026-09-19"` or `"2026-09-19T23:59:00Z"`.     |
| `paperDeadline`    | ISO date (optional).                                          |
| `notificationDate` | ISO date (optional).                                          |
| `eventStart` / `eventEnd` | Event dates (optional).                                |
| `location`         | Free text, e.g. `"San Diego, USA"`.                           |
| `website`          | Official site / CFP URL.                                      |
| `timezone`         | Informational, e.g. `"AoE"`.                                  |
| `confidence`       | `"confirmed"` \| `"approximate"` \| `"tbd"` — see below.       |
| `notes`            | Free-text caveats.                                            |

**Dates format:** ISO 8601. Use a date-only string (`"2026-09-19"`) for all-day
deadlines, or add a time with a `Z` suffix for UTC (`"2026-09-19T23:59:00Z"`).
Note that "Anywhere on Earth" (AoE) 23:59 is UTC-12 — i.e. the next day at
11:59 UTC.

## About the dates — please verify

> The dates in `src/data/deadlines.ts` are **seed values** for the 2026–2027
> cycle. Conference schedules shift every year and many 2027 CFPs had not been
> published when this dataset was assembled (August 2026).
>
> **Always confirm against the official Call for Papers before relying on any
> date.** The `confidence` field flags each venue:
>
> - `confirmed` — matches an official CFP / announced schedule.
> - `approximate` — based on the venue's typical month; verify the exact day.
> - `tbd` — cycle dates not yet announced; values are placeholders from a prior
>   edition.

## Tech

Vite · React · TypeScript (strict) · Tailwind CSS. The `.ics` generation is
hand-rolled (`src/lib/ics.ts`) — no calendar library dependency.

## Project layout

```
src/
  data/deadlines.ts     # the editable dataset + schema (start here)
  lib/
    dates.ts            # ISO parsing, day math, formatting
    ics.ts              # RFC 5545 .ics generation + Google Calendar links
    urgency.ts          # urgency buckets + color styles
  components/
    Badges.tsx          # category + confidence badges
    Countdown.tsx       # live countdown timer
    DeadlineCard.tsx    # one venue card
    Filters.tsx         # search / category / window / sort controls
    CalendarView.tsx    # month-grid calendar
  App.tsx               # dashboard shell, filtering + sorting logic
  main.tsx              # React entry point
```
