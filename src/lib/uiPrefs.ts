import type { FilterState } from "../components/Filters";

const KEY = "deadline-radar:ui:v1";
export interface UIPrefs {
  filters: FilterState;
  view: "board" | "calendar";
  dark: boolean;
  savedOnly: boolean;
}

export function loadUIPrefs(fallback: UIPrefs): UIPrefs {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<UIPrefs> | null;
    if (!value?.filters || !Array.isArray(value.filters.categories)) return fallback;
    return {
      filters: { ...fallback.filters, ...value.filters },
      view: value.view === "calendar" ? "calendar" : "board",
      dark: typeof value.dark === "boolean" ? value.dark : fallback.dark,
      savedOnly: Boolean(value.savedOnly),
    };
  } catch {
    return fallback;
  }
}

export function saveUIPrefs(value: UIPrefs): void {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* optional persistence */ }
}
