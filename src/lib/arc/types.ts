export type Category =
  | "Fitness" | "Health" | "Study" | "Work" | "Coding"
  | "Reading" | "Sleep" | "Productivity" | "Personal" | "Other";

export const CATEGORIES: Category[] = [
  "Fitness", "Health", "Study", "Work", "Coding", "Reading", "Sleep", "Productivity", "Personal", "Other",
];

export type Frequency = "daily" | "weekdays" | "weekends" | "specific" | "custom";

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: Category;
  color: string;
  startDate: string; // yyyy-MM-dd
  endDate?: string | undefined;
  frequency: Frequency;
  days: number[]; // 0=Sun for "specific"
  interval: number; // every N days for "custom"
  type: "simple" | "measurable";
  target: number;
  unit: string;
  reminderTime?: string | undefined;
  notes: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
}

export interface Entry {
  done: boolean;
  value?: number | undefined;
}

/** entries[dateKey][challengeId] */
export type Entries = Record<string, Record<string, Entry>>;

export interface WinterArc {
  name: string;
  startDate: string;
  endDate: string;
  mainGoal: string;
  goals: string[];
  challengeIds: string[]; // empty = all active
}

export interface Settings {
  theme: "dark" | "light" | "system";
  remindersEnabled: boolean;
  reminderTime: string;
  weekStart: 0 | 1;
  units: "metric" | "imperial";
  dateFormat: "MMM d, yyyy" | "dd/MM/yyyy" | "MM/dd/yyyy";
  xpEnabled: boolean;
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  profile: { name: string; avatar: string };
  challenges: Challenge[];
  entries: Entries;
  arc: WinterArc | null;
  settings: Settings;
  unlocked: Record<string, string>; // achievementId -> date unlocked
}
