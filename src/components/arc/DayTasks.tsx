import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArcStore } from "@/lib/arc/store";
import { challengeStats, dayStats, todayKey } from "@/lib/arc/stats";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "./ui";
import { useArcUI } from "./AppShell";

export function DayTasks({ date, cols = true }: { date: string; cols?: boolean }) {
  const { state } = useArcStore();
  const { openForm } = useArcUI();
  const today = todayKey();
  const d = useMemo(() => dayStats(state.challenges, state.entries, date), [state, date]);

  if (state.challenges.filter((c) => c.status === "active").length === 0)
    return (
      <EmptyState icon="🏔️" title="Your arc starts here." text="Create your first challenge and start building your streak."
        action={<Button onClick={() => openForm()} className="bg-gradient-primary shadow-glow"><Plus className="mr-1 h-4 w-4" />Create Challenge</Button>} />
    );
  if (d.total === 0)
    return <EmptyState icon="🌙" title="Rest day" text={date > today ? "Nothing scheduled for this day yet." : "No challenges were scheduled on this day."} />;

  return (
    <div className={cols ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
      {d.list.map((c) => (
        <TaskCard key={c.id} c={c} date={date} entry={state.entries[date]?.[c.id]} stats={challengeStats(c, state.entries, today)} />
      ))}
    </div>
  );
}
