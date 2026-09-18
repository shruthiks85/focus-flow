import { MOCK_TASKS } from "./mock-tasks";

export const PRIORITIES = ["IU", "UNI", "INU", "NINU"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<Priority, { label: string; short: string; dot: string; text: string }> = {
  IU: { label: "*** IU — Important", short: "Important", dot: "bg-iu", text: "text-iu" },
  UNI: { label: "** UNI — Urgent not Important", short: "Urgent not Important", dot: "bg-uni", text: "text-uni" },
  INU: { label: "* INU — Important not Urgent", short: "Important not Urgent", dot: "bg-inu", text: "text-inu" },
  NINU: { label: "* NINU — Not Important, not Urgent", short: "Not Important, not Urgent", dot: "bg-ninu", text: "text-ninu" },
};

export type Task = {
  id: string;
  priority: Priority;
  subject: string;
  dueDate: string;
  actionPlan: string;
  completionDate: string;
};

// v2 intentionally gives existing browsers a fresh demo dataset after the mock-data change.
const STORAGE_KEY = "quadrant.tasks.v2";
const defaultTasks = () => MOCK_TASKS.map((task) => ({ ...task }));

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return defaultTasks();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTasks();
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTasks();
  } catch {
    return defaultTasks();
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function isToday(value: string) {
  return Boolean(value) && value === new Date().toISOString().slice(0, 10);
}
