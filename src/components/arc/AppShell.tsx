import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, CalendarDays, BarChart3, Settings, Snowflake, Plus } from "lucide-react";
import { toast } from "sonner";
import { actions, hydrateStore, useArcStore } from "@/lib/arc/store";
import { ACHIEVEMENTS, earnedAchievements, isDone, levelInfo, todayKey, totalXP } from "@/lib/arc/stats";
import type { Challenge } from "@/lib/arc/types";
import { ChallengeForm } from "./ChallengeForm";
import { Onboarding } from "./Onboarding";
import { Bar } from "./ui";

const Ctx = createContext<{ openForm: (c?: Challenge | null) => void }>({ openForm: () => {} });
export const useArcUI = () => useContext(Ctx);

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/challenges", label: "Challenges", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, ready } = useArcStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);

  useEffect(() => { hydrateStore(); }, []);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const t = state.settings.theme;
      const light = t === "light" || (t === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
      root.classList.toggle("light", light);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.settings.theme]);

  // Achievements auto-unlock
  useEffect(() => {
    if (!ready || !state.onboarded) return;
    const fresh = earnedAchievements(state).filter((id) => !state.unlocked[id]);
    if (!fresh.length) return;
    actions.unlock(fresh);
    fresh.forEach((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id)!;
      toast(`${a.icon} Achievement unlocked`, { description: `${a.name} — ${a.desc}` });
    });
  }, [state, ready]);

  // Level-up toast
  const xp = useMemo(() => totalXP(state), [state]);
  const lvl = levelInfo(xp);
  const prevLevel = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (prevLevel.current !== null && lvl.level > prevLevel.current && state.settings.xpEnabled)
      toast.success(`Level ${lvl.level} reached`, { description: "Discipline compounds." });
    prevLevel.current = lvl.level;
  }, [lvl.level, ready, state.settings.xpEnabled]);

  // Reminders (browser notifications, optional)
  const fired = useRef(new Set<string>());
  useEffect(() => {
    if (!ready || !state.settings.remindersEnabled) return;
    const tick = () => {
      if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
      const now = new Date();
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const tk = todayKey();
      for (const c of state.challenges) {
        const time = c.reminderTime;
        if (c.status !== "active" || time !== hm) continue;
        const key = `${tk}-${c.id}`;
        if (fired.current.has(key) || isDone(c, state.entries[tk]?.[c.id])) continue;
        fired.current.add(key);
        new Notification(`Time for your ${c.name.toLowerCase()} ${c.icon}`, { body: c.description || "Keep the streak alive." });
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [ready, state]);

  const ui = useMemo(() => ({ openForm: (c?: Challenge | null) => { setEditing(c ?? null); setFormOpen(true); } }), []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground"><Snowflake className="h-5 w-5 animate-spin" /> Loading your arc…</div>
      </div>
    );
  }
  if (!state.onboarded) return <Onboarding />;

  return (
    <Ctx.Provider value={ui}>
      <div className="min-h-screen md:flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-5 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow"><Snowflake className="h-5 w-5 text-primary-foreground" /></div>
            <div>
              <div className="font-display text-sm font-bold tracking-[0.2em]">ARC TRACKER</div>
              <div className="text-[11px] text-muted-foreground">Complete your arc.</div>
            </div>
          </Link>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-semibold data-[status=active]:text-foreground">
                <n.icon className="h-4.5 w-4.5" /> {n.label}
              </Link>
            ))}
            <Link to="/arc" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-semibold data-[status=active]:text-foreground">
              <Snowflake className="h-4.5 w-4.5" /> Winter Arc
            </Link>
          </nav>
          <button onClick={() => ui.openForm()} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Create Challenge
          </button>
          {state.settings.xpEnabled && (
            <div className="mt-auto rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Level {lvl.level}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{xp.toLocaleString()} XP</span>
              </div>
              <Bar value={lvl.ratio} className="mt-2 h-1.5" />
              <div className="mt-1.5 text-[11px] text-muted-foreground">{lvl.next - xp} XP to level {lvl.level + 1}</div>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 md:px-10 md:pb-12 md:pt-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        <nav className="glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground data-[status=active]:text-primary">
              <n.icon className="h-5 w-5" /> {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <ChallengeForm open={formOpen} onOpenChange={setFormOpen} editing={editing} />
    </Ctx.Provider>
  );
}
