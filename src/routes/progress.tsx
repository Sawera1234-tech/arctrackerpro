import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { useArcStore } from "@/lib/arc/store";
import { ACHIEVEMENTS, challengeStats, dayStats, earliestStart, levelInfo, rangeStats, shiftKey, todayKey, totalCompleted, totalXP } from "@/lib/arc/stats";
import { Bar, Card, PageHeader, Stat } from "@/components/arc/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — ARC TRACKER" },
      { name: "description", content: "Weekly and monthly completion, streaks, XP and achievements." },
      { property: "og:title", content: "Progress — ARC TRACKER" },
      { property: "og:description", content: "Analytics for your personal discipline system." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { state } = useArcStore();
  const today = todayKey();
  const data = useMemo(() => {
    const overall = rangeStats(state.challenges, state.entries, earliestStart(state.challenges), today);
    const week = Array.from({ length: 7 }, (_, i) => { const k = shiftKey(today, i - 6); return { k, ...dayStats(state.challenges, state.entries, k) }; });
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const from = format(d, "yyyy-MM-01");
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { label: format(d, "MMM"), rate: rangeStats(state.challenges, state.entries, from, format(end, "yyyy-MM-dd")).rate };
    });
    return { overall, week, months, xp: totalXP(state), done: totalCompleted(state) };
  }, [state, today]);
  const lvl = levelInfo(data.xp);

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" sub="Calculated from your real check-ins." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Challenges" value={state.challenges.filter((c) => c.status !== "archived").length} />
        <Stat label="Tasks done" value={data.done} />
        <Stat label="Streak 🔥" value={`${data.overall.current}d`} hint="Perfect days in a row" />
        <Stat label="Best 🏆" value={`${data.overall.best}d`} />
        <Stat label="Avg rate" value={`${Math.round(data.overall.rate * 100)}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Last 7 days</h3>
          <div className="space-y-2.5">
            {data.week.map((w) => (
              <div key={w.k} className="flex items-center gap-3 text-sm">
                <span className="w-9 text-muted-foreground">{format(parseISO(w.k), "EEE")}</span>
                <Bar value={w.ratio} className="h-3 flex-1" />
                <span className="w-10 text-right tabular-nums text-muted-foreground">{w.total ? `${w.done}/${w.total}` : "—"}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Monthly completion</h3>
          <div className="flex h-44 items-end gap-3">
            {data.months.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs tabular-nums text-muted-foreground">{Math.round(m.rate * 100)}%</span>
                <div className="w-full rounded-lg bg-muted" style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div className="w-full rounded-lg bg-gradient-primary transition-all duration-700" style={{ height: `${Math.max(2, m.rate * 100)}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="mb-4 font-semibold">Challenge performance</h3>
        {state.challenges.length === 0 ? <p className="text-sm text-muted-foreground">Nothing completed yet. Your first checkmark starts the streak.</p> : (
          <div className="space-y-3">
            {state.challenges.filter((c) => c.status !== "archived").map((c) => {
              const s = challengeStats(c, state.entries, today);
              return (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-lg">{c.icon}</span>
                  <span className="w-28 truncate font-medium">{c.name}</span>
                  <Bar value={s.rate} color={c.color} className="flex-1" />
                  <span className="w-10 text-right tabular-nums">{Math.round(s.rate * 100)}%</span>
                  <span className="hidden w-24 text-right text-muted-foreground sm:block">🔥{s.current} · 🏆{s.best}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {state.settings.xpEnabled && (
        <Card>
          <div className="flex items-center justify-between"><h3 className="font-semibold">Level {lvl.level}</h3><span className="text-sm text-muted-foreground">🔥 {data.xp.toLocaleString()} XP</span></div>
          <Bar value={lvl.ratio} className="mt-3" />
          <p className="mt-2 text-xs text-muted-foreground">{lvl.next - data.xp} XP to level {lvl.level + 1}</p>
        </Card>
      )}
      <Card>
        <h3 className="mb-4 font-semibold">Achievements</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const on = !!state.unlocked[a.id];
            return (
              <div key={a.id} className={cn("flex items-center gap-3 rounded-xl border p-3", !on && "opacity-40 grayscale")}>
                <span className="text-2xl">{a.icon}</span>
                <div><div className="text-sm font-semibold">{a.name}</div><div className="text-xs text-muted-foreground">{a.desc}</div></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
