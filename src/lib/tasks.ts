export const PRIORITIES = ["IU", "UNI", "INU", "NINU"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<
  Priority,
  { label: string; short: string; dot: string; text: string }
> = {
  IU: {
    label: "** IU — Important",
    short: "Important",
    dot: "bg-iu",
    text: "text-iu",
  },
  UNI: {
    label: "** UNI — Urgent not Important",
    short: "Urgent not Important",
    dot: "bg-uni",
    text: "text-uni",
  },
  INU: {
    label: "* INU — Important not Urgent",
    short: "Important not Urgent",
    dot: "bg-inu",
    text: "text-inu",
  },
  NINU: {
    label: "* NINU — Not Important, not Urgent",
    short: "Not Important, not Urgent",
    dot: "bg-ninu",
    text: "text-ninu",
  },
};

export type Task = {
  id: string;
  priority: Priority;
  subject: string;
  dueDate: string;
  actionPlan: string;
  completionDate: string;
};

const STORAGE_KEY = "quadrant.tasks.v1";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function isToday(value: string) {
  if (!value) return false;
  return value === new Date().toISOString().slice(0, 10);
}
