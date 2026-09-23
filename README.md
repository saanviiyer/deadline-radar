# deadline-radar

Deadline Radar tracks deadlines for ML, neuroscience and computational biology conferences and workshops. It shows the next abstract and paper deadlines, colors them by urgency and exports them to your calendar.

![Deadline Radar](public/radar.svg)

## Features

- **Deadline board.** A grid of about 34 venues that you can filter and sort. Each card shows names, category tags, abstract and paper deadlines, notification date, event dates, location and website.
- **Calendar view.** A month grid with each milestone (abstract, paper, notification, event) in the same urgency colors.
- **Filters and search.** Free-text search, category chips (ML, NeuroAI, CompBio, CV, NLP, Neuroscience, MedImaging and more), a "deadline within N days" window, a hide-passed toggle and several sort orders.
- **Urgency colors.** Red for 7 days or less, amber for 30 or less, sky for 90 or less, green for more than 90, grey for passed.
- **Countdowns.** A live countdown to the next three deadlines, and a small countdown on each card.
- **Calendar export.** An RFC 5545 `.ics` file for one venue (all milestones, with a reminder you can set or turn off), a bulk `.ics` for the filtered list, and an "Add to Google Calendar" link.
- **Confidence flags.** Each venue has the tag `confirmed`, `approx.` or `TBD`, so you know which dates to check.
- **Deadline instants.** A date-only deadline closes at the end of that day. `AoE` means 23:59 UTC-12, which is 11:59 UTC the next day. The countdown, filters, Google Calendar link and `.ics` export all use the same conversion.
- **Offline use.** The installable app caches its shell and assets. In cloud mode it keeps the last validated Supabase dataset, labels cached data as cached and shows the refresh time.
- **Saved state.** Filters, search, view, theme, saved venues, saved-only mode and reminder lead time stay after a reload.

## About the dates

The dates in `src/data/deadlines.ts` are seed values for the 2026 to 2027 cycle. Conference schedules change each year. Many 2027 calls for papers were not published when this dataset was put together (August 2026). Always check the official call for papers before you rely on a date.

- `confirmed`: matches an official call for papers or announced schedule.
- `approximate`: based on the usual month for the venue. Check the day.
- `tbd`: dates not yet announced. Values are placeholders from a prior edition.

## Run it

You need Node 20.19 or later (built and tested on Node 24).

```bash
git clone https://github.com/saanviiyer/deadline-radar
cd deadline-radar
npm install
npm run dev        # Vite dev server, default http://localhost:5173
npm test           # timezone, calendar export and seed validation tests
npm run build      # strict type check (tsc -b), then build to dist/
npm run preview    # serve the production build
npm run seed:gen   # regenerate supabase/migrations/0002_seed_deadlines.sql
```

### Deploy

The build output in `dist/` is a static site. The repo includes `vercel.json`, `netlify.toml` and a `Dockerfile` (nginx). Each one has an SPA fallback to `index.html`, a strict Content Security Policy and anti-framing headers. The container has an HTTP health check.

```bash
vercel --prod                          # Vercel
netlify deploy --prod                  # Netlify
docker build -t deadline-radar .       # Docker
docker run -p 8080:80 deadline-radar
```

For GitHub Pages, publish `dist/` and set `base` in `vite.config.ts` if you serve from a sub-path.

## Environment variables

The app runs with no environment variables. In that mode, deadlines come from the static seed in `src/data/deadlines.ts`, and saved venues stay in `localStorage`. No account is needed.

| Name | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Optional | Supabase project URL. Turns on cloud mode. |
| `VITE_SUPABASE_ANON_KEY` | Optional | Supabase anon public key. Turns on cloud mode. |

Copy `.env.example` to `.env.local` for local use. Vite puts `VITE_*` values into the bundle at build time, so rebuild after you change them. Both values are safe in a client bundle because row-level security (RLS) controls access.

## Cloud mode (Supabase)

With both variables set, the app adds email magic-link sign-in. It loads deadlines from a public `deadlines` table and syncs each user's saved venues and reminder setting to Postgres. If a fetch fails, the app uses the last cached, validated cloud dataset, then the seed.

1. Create a Supabase project and copy the project URL and anon key from Project Settings, API.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It creates the `deadlines`, `saved_deadlines`, `reminder_prefs` and `admins` tables with RLS policies. Anyone can read `deadlines`. Users can access only their own rows in the other tables.
3. Run `supabase/migrations/0002_seed_deadlines.sql` to load the dataset. You can also run `supabase db push` with the Supabase CLI.
4. Turn on the Email provider under Authentication, Providers. Add your production URL to the redirect URLs.

In cloud mode, the `deadlines` table holds the live data. Edits to rows show up for all users on the next load with no redeploy. For a bulk update, edit `src/data/deadlines.ts`, run `npm run seed:gen` and run the seed file again. The seed uses `INSERT ... ON CONFLICT (id) DO UPDATE`, so it updates rows in place.

RLS allows writes to `deadlines` only from the service role or from users in the `admins` table. To make yourself an admin after your first sign-in:

```sql
insert into public.admins (user_id) values ('<your-auth-user-uuid>');
```

## Add or edit venues

Each venue is a `Deadline` object in `src/data/deadlines.ts`. To add one, copy a block and give it a unique `id`. All views read from this array.

| Field | Meaning |
|---|---|
| `id` | Unique slug, for example `"neurips-2026"` |
| `name`, `fullName` | Short and full names |
| `categories` | One or more tags, for example `"ML"` |
| `abstractDeadline` | ISO date, for example `"2026-09-19"` or `"2026-09-19T23:59:00Z"` |
| `paperDeadline`, `notificationDate` | ISO dates (optional) |
| `eventStart`, `eventEnd` | Event dates (optional) |
| `location`, `website` | Free text and official call for papers URL |
| `timezone` | For example `"AoE"` |
| `confidence` | `"confirmed"`, `"approximate"` or `"tbd"` |
| `notes` | Free-text caveats |

A date-only deadline resolves to 23:59 in its `timezone`. Use a datetime with a `Z` suffix when the call for papers gives a UTC instant. Event dates stay all-day ranges.

## Layout

```
src/data/deadlines.ts        dataset and schema
src/lib/dates.ts             ISO parsing, day math, formatting
src/lib/ics.ts               .ics generation and Google Calendar links (no calendar library)
src/lib/urgency.ts           urgency buckets and colors
src/lib/supabase.ts          Supabase client (cloud mode only)
src/lib/deadlinesRepo.ts     loads deadlines from Supabase, cache or seed
src/lib/auth.ts              magic-link sign-in
src/components/              cards, filters, calendar, countdown, auth bar
src/App.tsx                  dashboard, filtering and sorting
supabase/migrations/         schema and seed SQL
scripts/gen-seed.mjs         builds the seed SQL from the dataset
public/                      manifest, icon, service worker
```

Built with Vite, React, TypeScript (strict) and Tailwind CSS.
