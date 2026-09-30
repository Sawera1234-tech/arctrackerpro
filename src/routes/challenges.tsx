import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Archive, MoreHorizontal, Pause, Pencil, Play, Plus, Trash2, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { actions, useArcStore } from "@/lib/arc/store";
import { challengeStats, isDone, isScheduled, todayKey } from "@/lib/arc/stats";
import type { Challenge } from "@/lib/arc/types";
import { Bar, EmptyState, PageHeader, Ring } from "@/components/arc/ui";
import { useArcUI } from "@/components/arc/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — ARC TRACKER" },
      { name: "description", content: "All your custom challenges with streaks, best streaks and completion rates." },
      { property: "og:title", content: "Challenges — ARC TRACKER" },
      { property: "og:description", content: "Create, edit, pause and archive your personal challenges." },
    ],
  }),
  component: ChallengesPage,
});

const freqLabel = (c: Challenge) =>
  ({ daily: "Every day", weekdays: "Weekdays", weekends: "Weekends", specific: `${c.days.length} days/week`, custom: `Every ${c.interval} days` })[c.frequency];

function ChallengesPage() {
  const { state } = useArcStore();
  const { openForm } = useArcUI();
  const [tab, setTab] = useState<"active" | "paused" | "archived">("active");
  const [del, setDel] = useState<Challenge | null>(null);
  const today = todayKey();
  const list = useMemo(() => state.challenges.filter((c) => c.status === tab), [state, tab]);

  return (
    <div>
      <PageHeader title="Challenges" sub="Everything you're building." action={<Button onClick={() => openForm()} className="h-11 rounded-xl bg-gradient-primary shadow-glow"><Plus className="mr-1 h-4 w-4" />Create Challenge</Button>} />
      <div className="mb-5 inline-flex rounded-xl border bg-card p-1">
        {(["active", "paused", "archived"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg px-4 py-2 text-sm capitalize transition", tab === t ? "bg-accent font-semibold" : "text-muted-foreground")}>
            {t} <span className="text-xs opacity-60">{state.challenges.filter((c) => c.status === t).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        tab === "active" ? (
          <EmptyState icon="🏔️" title="Your arc starts here." text="Create your first challenge and start building your streak."
            action={<Button onClick={() => openForm()} className="bg-gradient-primary">Create Challenge</Button>} />
        ) : <EmptyState icon={tab === "paused" ? "⏸️" : "🗄️"} title={`No ${tab} challenges`} text="Challenges you move here keep all their history." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const s = challengeStats(c, state.entries, today);
            const sched = isScheduled(c, today);
            const done = isDone(c, state.entries[today]?.[c.id]);
            return (
              <div key={c.id} className="animate-fade-in rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in oklab, ${c.color} 20%, transparent)` }}>{c.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.category} · {freqLabel(c)}{c.type === "measurable" ? ` · ${c.target} ${c.unit}` : ""}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><button aria-label="Challenge actions" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openForm(c)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      {c.status === "active" && <DropdownMenuItem onClick={() => { actions.editChallenge(c.id, { status: "paused" }); toast("Paused"); }}><Pause className="mr-2 h-4 w-4" />Pause</DropdownMenuItem>}
                      {c.status !== "active" && <DropdownMenuItem onClick={() => { actions.editChallenge(c.id, { status: "active" }); toast("Resumed"); }}><Play className="mr-2 h-4 w-4" />Resume</DropdownMenuItem>}
                      {c.status !== "archived" && <DropdownMenuItem onClick={() => { actions.editChallenge(c.id, { status: "archived" }); toast("Archived"); }}><Archive className="mr-2 h-4 w-4" />Archive</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDel(c)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <Ring value={s.rate} size={64} color={c.color}>{Math.round(s.rate * 100)}%</Ring>
                  <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
                    <div><div className="flex items-center gap-1 text-xs text-muted-foreground"><Flame className="h-3 w-3 text-fire" />Streak</div><div className="font-semibold tabular-nums">{s.current} days</div></div>
                    <div><div className="flex items-center gap-1 text-xs text-muted-foreground"><Trophy className="h-3 w-3" />Best</div><div className="font-semibold tabular-nums">{s.best} days</div></div>
                    <div><div className="text-xs text-muted-foreground">Completed</div><div className="font-semibold tabular-nums">{s.completed}</div></div>
                    <div><div className="text-xs text-muted-foreground">Today</div>
                      <div className={cn("font-semibold", done ? "text-success" : "text-muted-foreground")}>{!sched ? "Rest" : done ? "✓ Done" : "○ Pending"}</div></div>
                  </div>
                </div>
                {c.endDate && (() => {
                  const total = Math.max(1, (Date.parse(c.endDate) - Date.parse(c.startDate)) / 864e5 + 1);
                  const el = Math.max(0, Math.min(total, (Date.parse(today) - Date.parse(c.startDate)) / 864e5 + 1));
                  return <div className="mt-4"><div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Overall progress</span><span>{Math.round(el)} / {Math.round(total)} days</span></div><Bar value={el / total} color={c.color} className="h-1.5" /></div>;
                })()}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{del?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the challenge and all of its history. Archive it instead if you might want it back.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (del) { actions.deleteChallenge(del.id); toast("Challenge deleted"); } setDel(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
