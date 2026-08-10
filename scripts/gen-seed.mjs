// ============================================================================
// Generate supabase/migrations/0002_seed_deadlines.sql from the current
// src/data/deadlines.ts. Run: `npm run seed:gen`
//
// This bundles the TS data module with esbuild (already a Vite dependency),
// imports it, and emits a single idempotent INSERT ... ON CONFLICT statement so
// a fresh Supabase project is populated with the exact current dataset.
// ============================================================================

import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataFile = join(root, "src", "data", "deadlines.ts");
const outFile = join(root, "supabase", "migrations", "0002_seed_deadlines.sql");

/** SQL-quote a scalar (string) or null. */
function q(v) {
  if (v === undefined || v === null) return "null";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

/** SQL text[] literal, e.g. ARRAY['ML','NeuroAI']::text[]  (or '{}' when empty). */
function arr(list) {
  if (!Array.isArray(list) || list.length === 0) return "'{}'::text[]";
  return "array[" + list.map((x) => q(x)).join(", ") + "]::text[]";
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), "seed-"));
  const bundled = join(dir, "deadlines.mjs");
  try {
    await build({
      entryPoints: [dataFile],
      outfile: bundled,
      bundle: true,
      format: "esm",
      platform: "node",
      logLevel: "silent",
    });
    const mod = await import(pathToFileURL(bundled).href);
    const deadlines = mod.deadlines;
    if (!Array.isArray(deadlines) || deadlines.length === 0) {
      throw new Error("No deadlines found in src/data/deadlines.ts");
    }

    const cols = [
      "id",
      "name",
      "full_name",
      "categories",
      "abstract_deadline",
      "paper_deadline",
      "notification_date",
      "event_start",
      "event_end",
      "location",
      "website",
      "timezone",
      "confidence",
      "notes",
    ];

    const rows = deadlines.map((d) => {
      const vals = [
        q(d.id),
        q(d.name),
        q(d.fullName),
        arr(d.categories),
        q(d.abstractDeadline),
        q(d.paperDeadline),
        q(d.notificationDate),
        q(d.eventStart),
        q(d.eventEnd),
        q(d.location),
        q(d.website),
        q(d.timezone),
        q(d.confidence),
        q(d.notes),
      ];
      return "  (" + vals.join(", ") + ")";
    });

    const header = `-- ============================================================================
-- Deadline Radar — seed data (AUTO-GENERATED)
-- ============================================================================
-- Generated from src/data/deadlines.ts by scripts/gen-seed.mjs
-- (npm run seed:gen). Do not edit by hand — regenerate instead.
--
-- Idempotent: ON CONFLICT (id) DO UPDATE re-syncs every field, so re-running
-- this file after editing the seed data updates existing rows in place.
--
-- !!! These are SEED values for the 2026-2027 cycle. Verify every date against
-- the official Call for Papers before relying on it. Keeping the live table
-- fresh (updating rows in the \`deadlines\` table) is the real maintenance job.
-- ============================================================================

`;

    const insert =
      "insert into public.deadlines (" +
      cols.join(", ") +
      ") values\n" +
      rows.join(",\n") +
      "\non conflict (id) do update set\n" +
      cols
        .filter((c) => c !== "id")
        .map((c) => `  ${c} = excluded.${c}`)
        .join(",\n") +
      ";\n";

    await writeFile(outFile, header + insert, "utf8");
    console.log(`Wrote ${outFile} (${deadlines.length} venues).`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
