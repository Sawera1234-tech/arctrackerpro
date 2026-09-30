import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { actions, getState, useArcStore } from "@/lib/arc/store";
import { Card, PageHeader } from "@/components/arc/ui";
import { selectCls } from "@/components/arc/ChallengeForm";
import type { Settings } from "@/lib/arc/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ARC TRACKER" },
      { name: "description", content: "Profile, theme, reminders and data export for ARC TRACKER." },
      { property: "og:title", content: "Settings — ARC TRACKER" },
      { property: "og:description", content: "Make ARC TRACKER yours." },
    ],
  }),
  component: SettingsPage,
});

const AVATARS = ["❄️", "🔥", "🐺", "🦅", "⚡", "🏔️", "🧊", "🌙"];

function SettingsPage() {
  const { state } = useArcStore();
  const st = state.settings;
  const [reset, setReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const set = (p: Partial<Settings>) => actions.setSettings(p);

  async function toggleReminders(on: boolean) {
    if (on && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      const p = await Notification.requestPermission();
      if (p !== "granted") toast("Notifications blocked", { description: "Reminders will stay off until you allow them in your browser." });
    }
    set({ remindersEnabled: on });
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arc-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importData(f: File) {
    try { actions.importData(await f.text()); toast.success("Data imported"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Import failed"); }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Settings" />
      <Card className="space-y-4">
        <h3 className="font-semibold">Profile</h3>
        <div><Label className="mb-2 block">Name</Label><Input value={state.profile.name} maxLength={40} onChange={(e) => actions.setProfile({ name: e.target.value })} className="h-11 rounded-xl" /></div>
        <div className="flex flex-wrap gap-2">{AVATARS.map((a) => <button key={a} onClick={() => actions.setProfile({ avatar: a })} className={`grid h-11 w-11 place-items-center rounded-xl border text-xl ${state.profile.avatar === a ? "border-primary bg-accent" : ""}`}>{a}</button>)}</div>
      </Card>
      <Card className="space-y-4">
        <h3 className="font-semibold">Appearance & general</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label className="mb-2 block">Theme</Label><select className={selectCls} value={st.theme} onChange={(e) => set({ theme: e.target.value as Settings["theme"] })}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></div>
          <div><Label className="mb-2 block">First day of week</Label><select className={selectCls} value={st.weekStart} onChange={(e) => set({ weekStart: Number(e.target.value) as 0 | 1 })}><option value={1}>Monday</option><option value={0}>Sunday</option></select></div>
          <div><Label className="mb-2 block">Units</Label><select className={selectCls} value={st.units} onChange={(e) => set({ units: e.target.value as Settings["units"] })}><option value="metric">Metric</option><option value="imperial">Imperial</option></select></div>
          <div><Label className="mb-2 block">Date format</Label><select className={selectCls} value={st.dateFormat} onChange={(e) => set({ dateFormat: e.target.value as Settings["dateFormat"] })}><option>MMM d, yyyy</option><option>dd/MM/yyyy</option><option>MM/dd/yyyy</option></select></div>
        </div>
        <div className="flex items-center justify-between"><Label>Show XP & levels</Label><Switch checked={st.xpEnabled} onCheckedChange={(v) => set({ xpEnabled: v })} /></div>
      </Card>
      <Card className="space-y-4">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center justify-between"><Label>Enable reminders</Label><Switch checked={st.remindersEnabled} onCheckedChange={toggleReminders} /></div>
        <p className="text-xs text-muted-foreground">Set a reminder time on each challenge. Reminders show while the app is open in your browser.</p>
      </Card>
      <Card className="space-y-3">
        <h3 className="font-semibold">Data</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>Export data</Button>
          <Button variant="secondary" onClick={() => file.current?.click()}>Import data</Button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ""; }} />
          <Button variant="destructive" onClick={() => setReset(true)}>Reset all data</Button>
        </div>
      </Card>
      <AlertDialog open={reset} onOpenChange={setReset}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Reset everything?</AlertDialogTitle><AlertDialogDescription>All challenges, check-ins, XP and achievements will be erased. Export first if you want a backup.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { actions.reset(); toast("All data reset"); }}>Reset</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
