import { useState } from "react";
import { ArrowRight, Snowflake, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actions, blankChallenge, COLORS } from "@/lib/arc/store";
import { cn } from "@/lib/utils";

const AREAS = [
  { l: "Fitness", i: "🏋️" }, { l: "Study", i: "📚" }, { l: "Health", i: "💧" },
  { l: "Coding", i: "💻" }, { l: "Productivity", i: "⚡" }, { l: "Personal", i: "🌱" },
];

const FIRST: Record<string, { name: string; icon: string; desc: string; target: number; unit: string; cat: string }> = {
  Fitness: { name: "20-Minute Workout", icon: "🏋️", desc: "Move for 20 minutes", target: 20, unit: "min", cat: "Fitness" },
  Study: { name: "Study Session", icon: "📚", desc: "Focused study for 45 minutes", target: 45, unit: "min", cat: "Study" },
  Health: { name: "Drink Water", icon: "💧", desc: "Drink 2.5L water", target: 2.5, unit: "L", cat: "Health" },
  Coding: { name: "Code Daily", icon: "💻", desc: "Code for 60 minutes", target: 60, unit: "min", cat: "Coding" },
  Productivity: { name: "Deep Work", icon: "⚡", desc: "90 minutes of deep work", target: 90, unit: "min", cat: "Productivity" },
  Personal: { name: "Read", icon: "📖", desc: "Read 20 pages", target: 20, unit: "pages", cat: "Reading" },
};

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [areas, setAreas] = useState<string[]>(["Fitness"]);
  const [sample, setSample] = useState(true);
  const pick = FIRST[areas[0] ?? "Fitness"] ?? FIRST["Fitness"]!;

  function finish(withFirst: boolean) {
    const first = withFirst && !sample
      ? { ...blankChallenge(), name: pick.name, icon: pick.icon, description: pick.desc, type: "measurable" as const, target: pick.target, unit: pick.unit, category: pick.cat as never, color: COLORS[0]!.value }
      : undefined;
    actions.finishOnboarding(name, withFirst ? sample : false, first);
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="bg-arc pointer-events-none absolute inset-0 opacity-60" />
      <div className="glass relative w-full max-w-md animate-fade-in rounded-3xl border p-7 shadow-soft" key={step}>
        <div className="mb-6 flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className={cn("h-1 flex-1 rounded-full transition", i <= step ? "bg-gradient-primary" : "bg-muted")} />)}</div>

        {step === 0 && (
          <div className="text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow"><Snowflake className="h-8 w-8 text-primary-foreground" /></div>
            <h1 className="font-display text-3xl font-bold tracking-[0.18em]">ARC TRACKER</h1>
            <p className="mt-3 text-muted-foreground">Build your streak. Complete your arc.</p>
            <Input className="mt-8 h-12 rounded-xl text-center" placeholder="What should we call you?" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold">What do you want to improve?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick as many as you like.</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {AREAS.map((a) => {
                const on = areas.includes(a.l);
                return (
                  <button key={a.l} onClick={() => setAreas(on ? areas.filter((x) => x !== a.l) : [...areas, a.l])}
                    className={cn("flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-medium transition", on ? "border-primary bg-accent" : "hover:bg-accent/50")}>
                    <span className="text-xl">{a.i}</span>{a.l}{on && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold">Create your first challenge</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can edit or delete anything later.</p>
            <div className="mt-6 space-y-2.5">
              <button onClick={() => setSample(true)} className={cn("w-full rounded-xl border p-4 text-left transition", sample ? "border-primary bg-accent" : "hover:bg-accent/50")}>
                <div className="font-semibold">❄️ Winter Arc starter pack</div>
                <div className="mt-1 text-sm text-muted-foreground">Exercise · Cold Shower · Coding · Reading · Water · Sleep</div>
              </button>
              <button onClick={() => setSample(false)} className={cn("w-full rounded-xl border p-4 text-left transition", !sample ? "border-primary bg-accent" : "hover:bg-accent/50")}>
                <div className="font-semibold">{pick.icon} {pick.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{pick.desc} · every day</div>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => finish(false)} className="text-sm text-muted-foreground hover:text-foreground">Skip</button>
          <Button onClick={() => (step < 2 ? setStep(step + 1) : finish(true))} className="h-11 rounded-xl bg-gradient-primary px-5 shadow-glow">
            {step < 2 ? "Continue" : "Start my arc"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
