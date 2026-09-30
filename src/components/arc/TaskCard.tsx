import { useState } from "react";
import { Check, Minus, Plus, Flame } from "lucide-react";
import { actions } from "@/lib/arc/store";
import { entryProgress, type ChallengeStats } from "@/lib/arc/stats";
import type { Challenge, Entry } from "@/lib/arc/types";
import { cn } from "@/lib/utils";
import { Bar } from "./ui";

export function TaskCard({ c, date, entry, stats }: { c: Challenge; date: string; entry?: Entry; stats?: ChallengeStats }) {
  const p = entryProgress(c, entry);
  const done = p >= 1;
  const [burst, setBurst] = useState(0);
  const value = entry?.value ?? 0;
  const step = c.target >= 10 ? Math.round(c.target / 4) || 1 : c.target >= 1 ? 0.5 : 0.1;

  function toggle() {
    if (done) actions.setEntry(date, c.id, c.type === "measurable" && value < c.target ? { done: false, value } : null);
    else {
      actions.setEntry(date, c.id, { done: true, value: c.type === "measurable" ? Math.max(value, c.target) : undefined });
      setBurst((b) => b + 1);
    }
  }
  function setValue(v: number) {
    const nv = Math.max(0, Math.round(v * 100) / 100);
    const wasDone = done;
    actions.setEntry(date, c.id, nv === 0 ? null : { done: nv >= c.target, value: nv });
    if (!wasDone && nv >= c.target) setBurst((b) => b + 1);
  }

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-soft transition-all duration-300", done && "border-transparent")}
      style={done ? { background: `linear-gradient(135deg, color-mix(in oklab, ${c.color} 16%, var(--card)), var(--card))` } : undefined}>
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in oklab, ${c.color} 20%, transparent)` }}>{c.icon}</div>
        <div className="min-w-0 flex-1">
          <div className={cn("truncate font-semibold transition", done && "text-muted-foreground line-through decoration-2")}>{c.name}</div>
          <div className="truncate text-sm text-muted-foreground">
            {c.type === "measurable" ? `${value} / ${c.target} ${c.unit}` : c.description || "Complete today"}
          </div>
        </div>
        {stats && stats.current > 0 && (
          <div key={stats.current} className="flex animate-bump items-center gap-0.5 text-sm font-semibold text-fire" title="Current streak">
            <Flame className="h-4 w-4" />{stats.current}
          </div>
        )}
        <button onClick={toggle} aria-pressed={done} aria-label={done ? `Mark ${c.name} not done` : `Complete ${c.name}`}
          className={cn("relative grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 active:scale-90",
            done ? "border-transparent text-primary-foreground" : "border-muted-foreground/40 hover:border-primary")}
          style={done ? { background: c.color } : undefined}>
          {burst > 0 && <span key={burst} className="pointer-events-none absolute inset-0 animate-ring-burst rounded-full" style={{ boxShadow: `0 0 0 3px ${c.color}` }} />}
          {done && <Check key={`c${burst}`} className="h-6 w-6 animate-check-pop" strokeWidth={3} />}
        </button>
      </div>
      {c.type === "measurable" && (
        <div className="mt-3 flex items-center gap-2">
          <button aria-label="Decrease" onClick={() => setValue(value - step)} className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-accent"><Minus className="h-4 w-4" /></button>
          <input type="number" step="any" min={0} value={value || ""} placeholder="0" aria-label={`Actual ${c.unit}`}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-9 w-20 rounded-lg border border-input bg-background px-2 text-center text-sm tabular-nums" />
          <button aria-label="Increase" onClick={() => setValue(value + step)} className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-accent"><Plus className="h-4 w-4" /></button>
          <div className="flex-1"><Bar value={p} color={c.color} /></div>
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{Math.round(p * 100)}%</span>
        </div>
      )}
    </div>
  );
}
