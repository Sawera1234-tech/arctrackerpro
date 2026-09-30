import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, blankChallenge, COLORS, ICONS, type ChallengeInput } from "@/lib/arc/store";
import { CATEGORIES, type Challenge, type Frequency } from "@/lib/arc/types";
import { cn } from "@/lib/utils";

const FREQS: { v: Frequency; l: string }[] = [
  { v: "daily", l: "Every day" }, { v: "weekdays", l: "Weekdays" }, { v: "weekends", l: "Weekends" },
  { v: "specific", l: "Specific days" }, { v: "custom", l: "Every N days" },
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const selectCls = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function ChallengeForm({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing?: Challenge | null }) {
  const [f, setF] = useState<ChallengeInput>(blankChallenge());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setF(editing ? { ...editing } : blankChallenge()); setErrors({}); }
  }, [open, editing]);

  const set = <K extends keyof ChallengeInput>(k: K, v: ChallengeInput[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: { [k: string]: string } & Partial<Record<"name"|"description"|"startDate"|"endDate"|"target"|"unit"|"days"|"interval", string>> = {};
    const name = f.name.trim();
    if (!name) er.name = "Give your challenge a name.";
    if (name.length > 60) er.name = "Keep it under 60 characters.";
    if (f.description.length > 200) er.description = "Max 200 characters.";
    if (!f.startDate) er.startDate = "Pick a start date.";
    if (f.endDate && f.endDate < f.startDate) er.endDate = "End date must be after the start.";
    if (f.type === "measurable" && !(f.target > 0)) er.target = "Target must be greater than 0.";
    if (f.type === "measurable" && !f.unit.trim()) er.unit = "Add a unit (min, pages, L…).";
    if (f.frequency === "specific" && f.days.length === 0) er.days = "Choose at least one day.";
    if (f.frequency === "custom" && !(f.interval >= 1)) er.interval = "Interval must be 1 or more.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const clean = { ...f, name, description: f.description.trim(), unit: f.unit.trim(), notes: f.notes.slice(0, 1000), endDate: f.endDate || undefined, reminderTime: f.reminderTime || undefined };
    if (editing) { actions.editChallenge(editing.id, clean); toast.success("Challenge updated"); }
    else { actions.addChallenge(clean); toast.success(`${clean.icon} ${clean.name} added`, { description: "Your arc just got stronger." }); }
    onOpenChange(false);
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Edit challenge" : "Create challenge"}</DialogTitle>
          <DialogDescription>Design a habit you'll actually keep.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in oklab, ${f.color} 25%, transparent)` }}>{f.icon}</div>
            <div className="flex-1">
              <Input placeholder="Challenge name" value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} className="h-11 rounded-xl" aria-label="Challenge name" />
              <Err k="name" />
            </div>
          </div>
          <div>
            <Textarea placeholder="Description (e.g. 20-minute workout)" value={f.description} maxLength={200} onChange={(e) => set("description", e.target.value)} rows={2} className="rounded-xl" />
            <Err k="description" />
          </div>

          <div>
            <Label className="mb-2 block">Icon</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((i) => (
                <button type="button" key={i} onClick={() => set("icon", i)} aria-label={`Icon ${i}`}
                  className={cn("grid h-10 w-10 place-items-center rounded-xl border text-lg transition hover:bg-accent", f.icon === i && "border-primary bg-accent")}>{i}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Category</Label>
              <select className={selectCls} value={f.category} onChange={(e) => set("category", e.target.value as ChallengeInput["category"])}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Accent</Label>
              <div className="flex h-11 items-center gap-2">
                {COLORS.map((c) => (
                  <button type="button" key={c.name} aria-label={c.name} onClick={() => set("color", c.value)}
                    className={cn("h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition", f.color === c.value && "ring-2 ring-foreground")}
                    style={{ background: c.value }} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block">Start date</Label>
              <Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} className="h-11 rounded-xl" />
              <Err k="startDate" />
            </div>
            <div>
              <Label className="mb-2 block">End date <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="date" value={f.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || undefined)} className="h-11 rounded-xl" />
              <Err k="endDate" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Frequency</Label>
            <div className="flex flex-wrap gap-2">
              {FREQS.map((q) => (
                <button type="button" key={q.v} onClick={() => set("frequency", q.v)}
                  className={cn("rounded-full border px-3.5 py-2 text-sm transition", f.frequency === q.v ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>{q.l}</button>
              ))}
            </div>
            {f.frequency === "specific" && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DOW.map((d, i) => (
                  <button type="button" key={d} onClick={() => set("days", f.days.includes(i) ? f.days.filter((x) => x !== i) : [...f.days, i])}
                    className={cn("h-10 w-12 rounded-xl border text-sm", f.days.includes(i) ? "border-primary bg-accent" : "text-muted-foreground")}>{d}</button>
                ))}
              </div>
            )}
            {f.frequency === "custom" && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                Every <Input type="number" min={1} value={f.interval} onChange={(e) => set("interval", Number(e.target.value))} className="h-10 w-20 rounded-xl" /> days
              </div>
            )}
            <Err k="days" /><Err k="interval" />
          </div>

          <div>
            <Label className="mb-2 block">Tracking</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["simple", "measurable"] as const).map((t) => (
                <button type="button" key={t} onClick={() => set("type", t)}
                  className={cn("rounded-xl border p-3 text-left transition", f.type === t ? "border-primary bg-accent" : "hover:bg-accent/50")}>
                  <div className="text-sm font-semibold capitalize">{t === "simple" ? "Simple completion" : "Measurable target"}</div>
                  <div className="text-xs text-muted-foreground">{t === "simple" ? "Done / not done" : "e.g. 20 minutes, 2.5 L"}</div>
                </button>
              ))}
            </div>
            {f.type === "measurable" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Input type="number" step="any" min={0} placeholder="Target" value={f.target} onChange={(e) => set("target", Number(e.target.value))} className="h-11 rounded-xl" aria-label="Target" />
                  <Err k="target" />
                </div>
                <div>
                  <Input placeholder="Unit (min, pages, L)" value={f.unit} maxLength={16} onChange={(e) => set("unit", e.target.value)} className="h-11 rounded-xl" aria-label="Unit" />
                  <Err k="unit" />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Reminder time <span className="text-muted-foreground">(optional)</span></Label>
            <Input type="time" value={f.reminderTime ?? ""} onChange={(e) => set("reminderTime", e.target.value || undefined)} className="h-11 rounded-xl" />
          </div>

          <div>
            <Label className="mb-2 block">Notes</Label>
            <Textarea value={f.notes} maxLength={1000} onChange={(e) => set("notes", e.target.value)} rows={2} className="rounded-xl" placeholder="Why this matters to you…" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-primary shadow-glow">{editing ? "Save changes" : "Create challenge"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
