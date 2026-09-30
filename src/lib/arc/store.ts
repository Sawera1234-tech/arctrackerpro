import { useSyncExternalStore } from "react";
import { addDays, format } from "date-fns";
import type { AppState, Challenge, Entry, WinterArc } from "./types";
import { todayKey } from "./stats";

/**
 * Local-first store. All mutations go through `update`, which persists to
 * localStorage. To add cloud sync later, hook a sync adapter into `persist`.
 */
const STORAGE_KEY = "arc-tracker:v1";

export function defaultState(): AppState {
  return {
    version: 1,
    onboarded: false,
    profile: { name: "", avatar: "❄️" },
    challenges: [],
    entries: {},
    arc: null,
    settings: {
      theme: "dark", remindersEnabled: false, reminderTime: "08:00",
      weekStart: 1, units: "metric", dateFormat: "MMM d, yyyy", xpEnabled: true,
    },
    unlocked: {},
  };
}

type Snapshot = { state: AppState; ready: boolean };
let snap: Snapshot = { state: defaultState(), ready: false };
const serverSnap = snap;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist(s: AppState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

export function hydrateStore() {
  if (snap.ready) return;
  let state = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      state = { ...state, ...p, settings: { ...state.settings, ...p.settings }, profile: { ...state.profile, ...p.profile } };
    }
  } catch { /* corrupt data → defaults */ }
  snap = { state, ready: true };
  emit();
}

export function update(fn: (s: AppState) => AppState) {
  const state = fn(snap.state);
  snap = { state, ready: snap.ready };
  persist(state);
  emit();
}

export function getState() { return snap.state; }

export function useArcStore() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => snap,
    () => serverSnap,
  );
}

const uid = () => crypto.randomUUID();

// ---------- actions ----------
export type ChallengeInput = Omit<Challenge, "id" | "createdAt" | "status">;

export const actions = {
  addChallenge(input: ChallengeInput) {
    const c: Challenge = { ...input, id: uid(), createdAt: new Date().toISOString(), status: "active" };
    update((s) => ({ ...s, challenges: [...s.challenges, c] }));
    return c;
  },
  editChallenge(id: string, patch: Partial<Challenge>) {
    update((s) => ({ ...s, challenges: s.challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },
  deleteChallenge(id: string) {
    update((s) => {
      const entries: AppState["entries"] = {};
      for (const [k, day] of Object.entries(s.entries)) {
        const { [id]: _, ...rest } = day;
        entries[k] = rest;
      }
      return {
        ...s, entries,
        challenges: s.challenges.filter((c) => c.id !== id),
        arc: s.arc ? { ...s.arc, challengeIds: s.arc.challengeIds.filter((x) => x !== id) } : s.arc,
      };
    });
  },
  setEntry(date: string, id: string, entry: Entry | null) {
    update((s) => {
      const day = { ...(s.entries[date] ?? {}) };
      if (entry) day[id] = entry; else delete day[id];
      return { ...s, entries: { ...s.entries, [date]: day } };
    });
  },
  setArc(arc: WinterArc | null) { update((s) => ({ ...s, arc })); },
  setProfile(p: Partial<AppState["profile"]>) { update((s) => ({ ...s, profile: { ...s.profile, ...p } })); },
  setSettings(p: Partial<AppState["settings"]>) { update((s) => ({ ...s, settings: { ...s.settings, ...p } })); },
  unlock(ids: string[]) {
    update((s) => {
      const u = { ...s.unlocked };
      ids.forEach((i) => (u[i] = todayKey()));
      return { ...s, unlocked: u };
    });
  },
  finishOnboarding(name: string, withSample: boolean, first?: ChallengeInput) {
    update((s) => {
      let challenges = s.challenges;
      let arc = s.arc;
      if (withSample) {
        const sample = sampleChallenges();
        challenges = [...challenges, ...sample];
        arc = defaultArc(sample.map((c) => c.id));
      }
      if (first) challenges = [...challenges, { ...first, id: uid(), createdAt: new Date().toISOString(), status: "active" }];
      return { ...s, onboarded: true, profile: { ...s.profile, name: name.trim() || s.profile.name }, challenges, arc };
    });
  },
  importData(json: string) {
    const p = JSON.parse(json);
    if (!p || typeof p !== "object" || !Array.isArray(p.challenges) || typeof p.entries !== "object")
      throw new Error("This file doesn't look like an ARC TRACKER export.");
    const d = defaultState();
    update(() => ({ ...d, ...p, onboarded: true, settings: { ...d.settings, ...p.settings }, profile: { ...d.profile, ...p.profile } }));
  },
  reset() { update(() => defaultState()); },
};

export function defaultArc(ids: string[] = []): WinterArc {
  const now = new Date();
  const start = todayKey();
  let end = `${now.getFullYear()}-12-31`;
  if (end <= start) end = format(addDays(now, 89), "yyyy-MM-dd");
  return {
    name: `Winter Arc ${now.getFullYear()}`,
    startDate: start, endDate: end,
    mainGoal: "Become disciplined, stronger and sharper.",
    goals: ["🏋️ Get stronger", "📚 Study daily", "💻 Improve coding", "🚿 Build discipline", "😴 Fix sleep schedule", "📖 Read consistently"],
    challengeIds: ids,
  };
}

export function blankChallenge(): ChallengeInput {
  return {
    name: "", description: "", icon: "🎯", category: "Personal", color: COLORS[0].value,
    startDate: todayKey(), endDate: undefined, frequency: "daily", days: [1, 2, 3, 4, 5], interval: 2,
    type: "simple", target: 1, unit: "", reminderTime: undefined, notes: "",
  };
}

export const COLORS = [
  { name: "Violet", value: "oklch(0.66 0.19 290)" },
  { name: "Indigo", value: "oklch(0.64 0.18 265)" },
  { name: "Sky", value: "oklch(0.72 0.14 235)" },
  { name: "Teal", value: "oklch(0.74 0.12 185)" },
  { name: "Green", value: "oklch(0.74 0.16 150)" },
  { name: "Amber", value: "oklch(0.8 0.15 75)" },
  { name: "Rose", value: "oklch(0.7 0.18 10)" },
];

export const ICONS = ["🏋️", "🏃", "🚿", "💻", "📚", "📖", "💧", "😴", "🧘", "🙏", "🥗", "✍️", "🎯", "🧠", "🎸", "🚴", "🚭", "☀️", "💰", "🧹"];

function sampleChallenges(): Challenge[] {
  const base = blankChallenge();
  const mk = (p: Partial<Challenge>): Challenge => ({ ...base, ...p, id: uid(), createdAt: new Date().toISOString(), status: "active" } as Challenge);
  return [
    mk({ name: "Exercise", icon: "🏋️", category: "Fitness", description: "20-minute workout", type: "measurable", target: 20, unit: "min", color: COLORS[0].value }),
    mk({ name: "Cold Shower", icon: "🚿", category: "Health", description: "Complete today's cold shower", color: COLORS[2].value }),
    mk({ name: "Coding", icon: "💻", category: "Coding", description: "Code for 60 minutes", type: "measurable", target: 60, unit: "min", color: COLORS[1].value }),
    mk({ name: "Reading", icon: "📚", category: "Reading", description: "Read 20 pages", type: "measurable", target: 20, unit: "pages", color: COLORS[5].value }),
    mk({ name: "Water", icon: "💧", category: "Health", description: "Drink 2.5L water", type: "measurable", target: 2.5, unit: "L", color: COLORS[3].value }),
    mk({ name: "Sleep", icon: "😴", category: "Sleep", description: "Sleep before 12:00 AM", color: COLORS[6].value }),
  ];
}
