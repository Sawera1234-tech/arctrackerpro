import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { AppState, Challenge, Entries, Entry } from "./types";

export const toKey = (d: Date) => format(d, "yyyy-MM-dd");
export const todayKey = () => toKey(new Date());
export const shiftKey = (key: string, n: number) => toKey(addDays(parseISO(key), n));

export function isScheduled(c: Challenge, key: string, requireActive = true): boolean {
  if (requireActive && c.status !== "active") return false;
  if (c.status === "archived") return false;
  if (key < c.startDate) return false;
  if (c.endDate && key > c.endDate) return false;
  const d = parseISO(key);
  const wd = d.getDay();
  switch (c.frequency) {
    case "daily": return true;
    case "weekdays": return wd >= 1 && wd <= 5;
    case "weekends": return wd === 0 || wd === 6;
    case "specific": return c.days.includes(wd);
    case "custom":
      return differenceInCalendarDays(d, parseISO(c.startDate)) % Math.max(1, c.interval) === 0;
  }
}

export function entryProgress(c: Challenge, e?: Entry): number {
  if (!e) return 0;
  if (e.done) return 1;
  if (c.type === "simple") return 0;
  return Math.max(0, Math.min(1, (e.value ?? 0) / Math.max(c.target, 0.0001)));
}

export const isDone = (c: Challenge, e?: Entry) => entryProgress(c, e) >= 1;

function* days(from: string, to: string) {
  let k = from;
  let guard = 0;
  while (k <= to && guard++ < 5000) {
    yield k;
    k = shiftKey(k, 1);
  }
}

export interface ChallengeStats {
  current: number;
  best: number;
  completed: number;
  scheduled: number;
  rate: number; // 0..1
}

export function challengeStats(c: Challenge, entries: Entries, today = todayKey()): ChallengeStats {
  const end = c.endDate && c.endDate < today ? c.endDate : today;
  let current = 0, best = 0, completed = 0, scheduled = 0;
  for (const k of days(c.startDate, end)) {
    if (!isScheduled(c, k, false)) continue;
    const done = isDone(c, entries[k]?.[c.id]);
    if (done) {
      completed++; scheduled++; current++;
      best = Math.max(best, current);
    } else if (k === today) {
      // today still pending — don't break the streak
    } else {
      scheduled++; current = 0;
    }
  }
  return { current, best, completed, scheduled, rate: scheduled ? completed / scheduled : 0 };
}

export function dayStats(challenges: Challenge[], entries: Entries, key: string) {
  const list = challenges.filter((c) => isScheduled(c, key));
  const done = list.filter((c) => isDone(c, entries[key]?.[c.id])).length;
  const progress = list.reduce((s, c) => s + entryProgress(c, entries[key]?.[c.id]), 0);
  return { list, total: list.length, done, ratio: list.length ? progress / list.length : 0 };
}

/** Streak of "perfect" days (all scheduled done) across a set of challenges. */
export function rangeStats(challenges: Challenge[], entries: Entries, from: string, to: string, today = todayKey()) {
  const end = to < today ? to : today;
  let current = 0, best = 0, perfect = 0, done = 0, scheduled = 0, bestPerfectRun = 0;
  for (const k of days(from, end)) {
    const s = dayStats(challenges, entries, k);
    if (!s.total) continue;
    const isToday = k === today;
    if (!isToday || s.done === s.total) { done += s.done; scheduled += s.total; }
    if (s.done === s.total) {
      perfect++; current++;
      best = Math.max(best, current);
      bestPerfectRun = Math.max(bestPerfectRun, current);
    } else if (!isToday) current = 0;
  }
  return { current, best, perfect, rate: scheduled ? done / scheduled : 0, bestPerfectRun };
}

export function earliestStart(challenges: Challenge[]) {
  return challenges.reduce((m, c) => (c.startDate < m ? c.startDate : m), todayKey());
}

export function totalXP(s: AppState) {
  let xp = 0;
  const byId = new Map(s.challenges.map((c) => [c.id, c]));
  for (const day of Object.values(s.entries))
    for (const [id, e] of Object.entries(day)) {
      const c = byId.get(id);
      if (c) xp += entryProgress(c, e) * 10;
    }
  return Math.round(xp);
}

export const levelThreshold = (level: number) => 25 * (level - 1) * (level + 2);

export function levelInfo(xp: number) {
  let level = 1;
  while (xp >= levelThreshold(level + 1)) level++;
  const base = levelThreshold(level);
  const next = levelThreshold(level + 1);
  return { level, xp, base, next, ratio: (xp - base) / (next - base) };
}

export function totalCompleted(s: AppState) {
  const byId = new Map(s.challenges.map((c) => [c.id, c]));
  let n = 0;
  for (const day of Object.values(s.entries))
    for (const [id, e] of Object.entries(day)) {
      const c = byId.get(id);
      if (c && isDone(c, e)) n++;
    }
  return n;
}

export function arcChallenges(s: AppState) {
  if (!s.arc) return [];
  const ids = s.arc.challengeIds;
  return s.challenges.filter((c) => c.status !== "archived" && (ids.length === 0 || ids.includes(c.id)));
}

export function arcStats(s: AppState, today = todayKey()) {
  const arc = s.arc!;
  const total = differenceInCalendarDays(parseISO(arc.endDate), parseISO(arc.startDate)) + 1;
  const raw = differenceInCalendarDays(parseISO(today), parseISO(arc.startDate)) + 1;
  const day = Math.max(0, Math.min(total, raw));
  const r = rangeStats(arcChallenges(s), s.entries, arc.startDate, arc.endDate, today);
  return {
    total, day, started: raw >= 1, finished: raw > total,
    remaining: Math.max(0, total - Math.max(day, 0)),
    daysCompleted: r.perfect, rate: r.rate, current: r.current, best: r.best,
    timeRatio: total ? day / total : 0,
  };
}

export interface Achievement {
  id: string; icon: string; name: string; desc: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-streak", icon: "🔥", name: "First Streak", desc: "Complete a challenge 3 days in a row." },
  { id: "week-warrior", icon: "⚔️", name: "7 Day Warrior", desc: "Maintain a 7-day streak." },
  { id: "30-discipline", icon: "🛡️", name: "30 Day Discipline", desc: "Maintain a 30-day streak." },
  { id: "perfect-week", icon: "💯", name: "Perfect Week", desc: "Complete all scheduled challenges for 7 days." },
  { id: "100-tasks", icon: "🏆", name: "100 Tasks", desc: "Complete 100 tasks." },
  { id: "arc-starter", icon: "❄️", name: "Winter Arc Starter", desc: "Complete the first day of a Winter Arc." },
];

export function earnedAchievements(s: AppState): string[] {
  const today = todayKey();
  const best = Math.max(0, ...s.challenges.map((c) => challengeStats(c, s.entries, today).best));
  const overall = rangeStats(s.challenges, s.entries, earliestStart(s.challenges), today, today);
  const out: string[] = [];
  if (best >= 3) out.push("first-streak");
  if (best >= 7) out.push("week-warrior");
  if (best >= 30) out.push("30-discipline");
  if (overall.bestPerfectRun >= 7) out.push("perfect-week");
  if (totalCompleted(s) >= 100) out.push("100-tasks");
  if (s.arc) {
    const d = dayStats(arcChallenges(s), s.entries, s.arc.startDate);
    if (d.total > 0 && d.done === d.total) out.push("arc-starter");
  }
  return out;
}
