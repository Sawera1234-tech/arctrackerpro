import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useArcStore } from "@/lib/arc/store";
import { dayStats, toKey, todayKey } from "@/lib/arc/stats";
import { DayTasks } from "@/components/arc/DayTasks";
import { PageHeader } from "@/components/arc/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — ARC TRACKER" },
      { name: "description", content: "Month view of every completed and missed day. Open any date to edit it." },
      { property: "og:title", content: "Calendar — ARC TRACKER" },
      { property: "og:description", content: "See your consistency month by month." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { state } = useArcStore();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [open, setOpen] = useState<string | null>(null);
  const today = todayKey();
  const ws = state.settings.weekStart;
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: ws }), end: endOfWeek(endOfMonth(month), { weekStartsOn: ws }) }), [month, ws]);
  const labels = ws === 1 ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const openStats = open ? dayStats(state.challenges, state.entries, open) : null;

  return (
    <div>
      <PageHeader title="Calendar" sub="Every day tells the story." />
      <div className="rounded-3xl border bg-card p-4 shadow-soft md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="grid h-10 w-10 place-items-center rounded-xl border hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
          <h2 key={month.toISOString()} className="animate-fade-in text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
          <button aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="grid h-10 w-10 place-items-center rounded-xl border hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{labels.map((l) => <div key={l} className="pb-1">{l}</div>)}</div>
        <div key={month.toISOString()} className="grid animate-fade-in grid-cols-7 gap-1.5">
          {days.map((d) => {
            const k = toKey(d);
            const s = dayStats(state.challenges, state.entries, k);
            const past = k < today;
            const full = s.total > 0 && s.done === s.total;
            const missed = past && s.total > 0 && !full;
            return (
              <button key={k} onClick={() => setOpen(k)}
                className={cn("relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition hover:border-primary md:aspect-[4/3]",
                  !isSameMonth(d, month) && "opacity-30",
                  full && "border-success/40 bg-success/15",
                  missed && s.done === 0 && "bg-destructive/10 border-destructive/20",
                  missed && s.done > 0 && "bg-muted",
                  k === today && "ring-2 ring-primary")}>
                <span className="font-semibold tabular-nums">{format(d, "d")}</span>
                {s.total > 0 && (
                  <span className={cn("mt-0.5 hidden text-[10px] tabular-nums sm:block", full ? "text-success" : "text-muted-foreground")}>
                    {full ? "✓ " : "● "}{s.done}/{s.total}
                  </span>
                )}
                {s.total > 0 && <span className={cn("mt-1 h-1.5 w-1.5 rounded-full sm:hidden", full ? "bg-success" : missed ? "bg-destructive" : "bg-muted-foreground/50")} />}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success/40" />Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-muted" />Partial</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-destructive/30" />Missed</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border" />Nothing scheduled</span>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{open && format(parseISO(open), "EEEE, MMMM d")}</DialogTitle>
            <DialogDescription>{openStats && openStats.total ? `${openStats.done} / ${openStats.total} completed` : "No challenges scheduled"}</DialogDescription>
          </DialogHeader>
          {open && <DayTasks date={open} cols={false} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
