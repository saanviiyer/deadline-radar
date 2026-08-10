import { useState } from "react";
import type { AuthState } from "../lib/auth";
import type { ReminderPrefsState } from "../lib/reminderPrefs";

const REMINDER_OPTIONS = [1, 3, 7, 14, 30];

interface Props {
  auth: AuthState;
  prefs: ReminderPrefsState;
  savedCount: number;
}

/**
 * Auth + personalization header. Renders nothing when Supabase is not
 * configured (zero-config mode), so the existing UI is unchanged in that case.
 */
export function AuthBar({ auth, prefs, savedCount }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState(false);

  if (!auth.configured || auth.loading) return null;

  // ---- Signed in --------------------------------------------------------
  if (auth.user) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
            {(auth.user.email ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate">
            Signed in as{" "}
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {auth.user.email}
            </span>
          </span>
          <span className="hidden text-slate-400 sm:inline">·</span>
          <span className="hidden text-slate-500 dark:text-slate-400 sm:inline">
            ★ {savedCount} saved
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            Remind
            <select
              value={prefs.reminderDays}
              onChange={(e) => prefs.setReminderDays(parseInt(e.target.value, 10))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {REMINDER_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} day{d === 1 ? "" : "s"} before
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void auth.signOut()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ---- Signed out -------------------------------------------------------
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    const err = await auth.signIn(email.trim());
    if (err) {
      setStatus("error");
      setMessage(err);
    } else {
      setStatus("sent");
      setMessage("Check your inbox for a magic sign-in link.");
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Sign in
          </span>{" "}
          to save venues and sync them across devices.
        </p>
        {!open && status !== "sent" && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500"
          >
            Sign in with email
          </button>
        )}
      </div>

      {(open || status === "sent") && (
        <form onSubmit={submit} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            disabled={status === "sending"}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`mt-2 text-xs ${
            status === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
