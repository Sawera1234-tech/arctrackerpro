import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArcStore } from "@/lib/arc/store";
import { dayStats, shiftKey, todayKey } from "@/lib/arc/stats";
import { ArcCard } from "@/components/arc/ArcCard";
import { DayTasks } from "@/components/arc/DayTasks";
import { Bar, Card } from "@/components/arc/ui";
import { useArcUI } from "@/components/arc/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ARC TRACKER" },
      { name: "description", content: "Today's challenges, streaks and Winter Arc progress at a glance." },
      { property: "og:title", content: "ARC TRACKER — Build your streak. Complete your arc." },
      { property: "og:description", content: "A personal discipline system for habits, challenges and your Winter Arc." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Dashboard() {
  const { state } = useArcStore();
  const { openForm } = useArcUI();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const d = useMemo(() => dayStats(state.challenges, state.entries, date), [state, date]);
  const isToday = date === today;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="mt-1 text-3xl font-semibold md:text-4xl">
            {greeting()}{state.profile.name ? <>, <span className="text-gradient">{state.profile.name}</span></> : ""}
          </h1>
        </div>
        <Button onClick={() => openForm()} className="h-11 rounded-xl bg-gradient-primary shadow-glow"><Plus className="mr-1 h-4 w-4" /> Create Challenge</Button>
      </header>

      <ArcCard />

      <section className="space-y-4">
        <div className="sticky top-0 z-30 -mx-4 bg-background/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button aria-label="Previous day" onClick={() => setDate(shiftKey(date, -1))} className="grid h-10 w-10 place-items-center rounded-xl border hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
              <div key={date} className="min-w-36 animate-fade-in px-2 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isToday ? "Today's progress" : format(parseISO(date), "EEEE")}</div>
                <div className="text-sm font-medium">{format(parseISO(date), "MMM d, yyyy")}</div>
              </div>
              <button aria-label="Next day" onClick={() => setDate(shiftKey(date, 1))} className="grid h-10 w-10 place-items-center rounded-xl border hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
              {!isToday && <button onClick={() => setDate(today)} className="ml-1 rounded-lg px-2 py-1 text-xs text-primary hover:underline">Today</button>}
            </div>
            <div className="font-display text-xl font-semibold tabular-nums">{d.done}<span className="text-muted-foreground"> / {d.total}</span></div>
          </div>
          <Bar value={d.ratio} className="mt-3 h-2.5" />
        </div>
        <DayTasks date={date} />
        {d.total > 0 && d.done === 0 && isToday && (
          <Card className="border-dashed bg-transparent text-center shadow-none">
            <div className="text-sm font-medium">Nothing completed yet.</div>
            <div className="text-xs text-muted-foreground">Your first checkmark starts the streak.</div>
          </Card>
        )}
        {d.total > 0 && d.done === d.total && (
          <div className="animate-scale-in rounded-2xl border border-success/30 bg-success/10 p-4 text-center text-sm font-medium text-success">
            All done{isToday ? " for today" : ""}. Streak secured 🔥
          </div>
        )}
      </section>
    </div>
  );
}
