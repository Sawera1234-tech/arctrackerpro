import { createFileRoute } from "@tanstack/react-router";
import { useArcStore } from "@/lib/arc/store";
import { arcChallenges, arcStats, challengeStats, todayKey } from "@/lib/arc/stats";
import { ArcCard } from "@/components/arc/ArcCard";
import { Bar, Card, Stat } from "@/components/arc/ui";

export const Route = createFileRoute("/arc")({
  head: () => ({
    meta: [
      { title: "Winter Arc — ARC TRACKER" },
      { name: "description", content: "Your Winter Arc: days completed, remaining, streaks and goals." },
      { property: "og:title", content: "Winter Arc — ARC TRACKER" },
      { property: "og:description", content: "A focused season of discipline." },
    ],
  }),
  component: ArcPage,
});

function ArcPage() {
  const { state } = useArcStore();
  const arc = state.arc;
  const s = arc ? arcStats(state) : null;
  return (
    <div className="space-y-6">
      <ArcCard large />
      {arc && s && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Days completed" value={s.daysCompleted} />
            <Stat label="Days remaining" value={s.remaining} />
            <Stat label="Completion" value={`${Math.round(s.rate * 100)}%`} />
            <Stat label="Best streak" value={`${s.best}d`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-semibold">Main goal</h3>
              <p className="mt-1 text-sm text-muted-foreground">{arc.mainGoal || "—"}</p>
              <ul className="mt-4 space-y-2">{arc.goals.map((g) => <li key={g} className="rounded-xl border px-3 py-2 text-sm">{g}</li>)}</ul>
            </Card>
            <Card>
              <h3 className="mb-4 font-semibold">Arc challenges</h3>
              <div className="space-y-3">
                {arcChallenges(state).map((c) => {
                  const cs = challengeStats(c, state.entries, todayKey());
                  return <div key={c.id} className="flex items-center gap-3 text-sm"><span>{c.icon}</span><span className="w-24 truncate">{c.name}</span><Bar value={cs.rate} color={c.color} className="flex-1" /><span className="w-12 text-right text-muted-foreground">🔥{cs.current}</span></div>;
                })}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
