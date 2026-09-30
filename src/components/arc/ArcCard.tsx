import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { Flame, Pencil, Snowflake, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, defaultArc, useArcStore } from "@/lib/arc/store";
import { arcStats } from "@/lib/arc/stats";
import type { WinterArc } from "@/lib/arc/types";
import { cn } from "@/lib/utils";

export function ArcCard({ large = false }: { large?: boolean }) {
  const { state } = useArcStore();
  const [edit, setEdit] = useState(false);
  const arc = state.arc;

  if (!arc) {
    return (
      <div className="bg-arc relative overflow-hidden rounded-3xl border p-6 text-primary-foreground shadow-soft">
        <Snowflake className="absolute -right-6 -top-6 h-40 w-40 opacity-10" />
        <div className="text-xs font-semibold uppercase tracking-[0.25em] opacity-70">Arc mode</div>
        <h2 className="mt-2 text-2xl font-bold">Start a Winter Arc</h2>
        <p className="mt-1 max-w-md text-sm opacity-80">A focused season of discipline. Pick your dates, your goals and the challenges that define it.</p>
        <Button onClick={() => setEdit(true)} className="mt-5 rounded-xl bg-primary-foreground text-background hover:bg-primary-foreground/90">Create Winter Arc</Button>
        <ArcDialog open={edit} onOpenChange={setEdit} arc={null} />
      </div>
    );
  }

  const s = arcStats(state);
  return (
    <div className="bg-arc relative overflow-hidden rounded-3xl border border-primary/20 p-6 text-primary-foreground shadow-glow md:p-8">
      <Snowflake className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 opacity-[0.07]" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] opacity-70">
            {format(parseISO(arc.startDate), "MMM d")} → {format(parseISO(arc.endDate), "MMM d, yyyy")}
          </div>
          <h2 className="mt-1.5 font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">{arc.name}</h2>
        </div>
        <div className="flex gap-2">
          {!large && <Link to="/arc" className="rounded-xl bg-primary-foreground/10 px-3 py-2 text-xs font-semibold backdrop-blur transition hover:bg-primary-foreground/20">Open</Link>}
          <button onClick={() => setEdit(true)} aria-label="Edit Winter Arc" className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/10 transition hover:bg-primary-foreground/20"><Pencil className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-end gap-x-10 gap-y-5">
        <div>
          <div className="text-xs opacity-70">{s.started ? (s.finished ? "Arc complete" : "Day") : "Starts in"}</div>
          <div className="font-display text-5xl font-bold tabular-nums md:text-6xl">
            {s.started ? s.day : Math.abs(s.day - 1) || "—"}<span className="text-2xl opacity-50"> / {s.total}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs opacity-70"><Flame className="h-3.5 w-3.5" /> Current streak</div>
          <div key={s.current} className="animate-bump font-display text-3xl font-bold tabular-nums">{s.current} <span className="text-base font-medium opacity-60">days</span></div>
        </div>
        {large && (
          <div>
            <div className="flex items-center gap-1 text-xs opacity-70"><Trophy className="h-3.5 w-3.5" /> Best streak</div>
            <div className="font-display text-3xl font-bold tabular-nums">{s.best}</div>
          </div>
        )}
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex justify-between text-xs"><span className="opacity-70">Overall completion</span><span className="font-semibold tabular-nums">{Math.round(s.rate * 100)}%</span></div>
        <div className="h-2.5 overflow-hidden rounded-full bg-primary-foreground/15">
          <div className="h-full rounded-full bg-primary-foreground transition-[width] duration-700" style={{ width: `${Math.round(s.rate * 100)}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] opacity-60">
          <span>{s.daysCompleted} perfect days</span><span>{s.remaining} days remaining</span>
        </div>
      </div>
      <ArcDialog open={edit} onOpenChange={setEdit} arc={arc} />
    </div>
  );
}

export function ArcDialog({ open, onOpenChange, arc }: { open: boolean; onOpenChange: (o: boolean) => void; arc: WinterArc | null }) {
  const { state } = useArcStore();
  const [f, setF] = useState<WinterArc>(defaultArc());
  const [goals, setGoals] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) { const a = arc ?? defaultArc(); setF(a); setGoals(a.goals.join("\n")); setErr(""); }
  }, [open, arc]);
  const active = state.challenges.filter((c) => c.status !== "archived");

  function save() {
    if (!f.name.trim()) return setErr("Give your arc a name.");
    if (!f.startDate || !f.endDate || f.endDate < f.startDate) return setErr("End date must be after the start date.");
    actions.setArc({ ...f, name: f.name.trim().slice(0, 60), goals: goals.split("\n").map((g) => g.trim()).filter(Boolean).slice(0, 12) });
    toast.success(arc ? "Arc updated" : "Your Winter Arc begins ❄️");
    onOpenChange(false);
  }
  const toggle = (id: string) => setF((p) => ({ ...p, challengeIds: p.challengeIds.includes(id) ? p.challengeIds.filter((x) => x !== id) : [...p.challengeIds, id] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{arc ? "Edit Winter Arc" : "Create Winter Arc"}</DialogTitle>
          <DialogDescription>Set the season, the goal and the challenges.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-2 block">Name</Label><Input value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-11 rounded-xl" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-2 block">Start</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className="h-11 rounded-xl" /></div>
            <div><Label className="mb-2 block">End</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} className="h-11 rounded-xl" /></div>
          </div>
          <div><Label className="mb-2 block">Main goal</Label><Input value={f.mainGoal} maxLength={120} onChange={(e) => setF({ ...f, mainGoal: e.target.value })} className="h-11 rounded-xl" /></div>
          <div><Label className="mb-2 block">Goals <span className="text-muted-foreground">(one per line)</span></Label><Textarea rows={4} value={goals} onChange={(e) => setGoals(e.target.value)} className="rounded-xl" /></div>
          <div>
            <Label className="mb-2 block">Challenges <span className="text-muted-foreground">(none selected = all)</span></Label>
            <div className="flex flex-wrap gap-2">
              {active.length === 0 && <p className="text-sm text-muted-foreground">No challenges yet.</p>}
              {active.map((c) => (
                <button key={c.id} type="button" onClick={() => toggle(c.id)}
                  className={cn("rounded-full border px-3 py-1.5 text-sm transition", f.challengeIds.includes(c.id) ? "border-primary bg-accent" : "text-muted-foreground")}>{c.icon} {c.name}</button>
              ))}
            </div>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex justify-between gap-2 pt-2">
            {arc ? <Button variant="ghost" className="text-destructive" onClick={() => { actions.setArc(null); onOpenChange(false); toast("Arc removed"); }}>Remove arc</Button> : <span />}
            <Button onClick={save} className="bg-gradient-primary shadow-glow">Save arc</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
