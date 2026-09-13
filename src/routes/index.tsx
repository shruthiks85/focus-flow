import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PRIORITIES,
  PRIORITY_META,
  formatDate,
  isToday,
  loadTasks,
  saveTasks,
  type Priority,
  type Task,
} from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quadrant — Eisenhower Task Tracker" },
      {
        name: "description",
        content:
          "Track tasks by priority (IU, UNI, INU, NINU) with subject, due date, action plan and completion date. Works on desktop and mobile.",
      },
      { property: "og:title", content: "Quadrant — Eisenhower Task Tracker" },
      {
        property: "og:description",
        content:
          "Sort your day into four priority boxes. Add, edit and clear tasks from any device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Draft = {
  priority: Priority;
  subject: string;
  dueDate: string;
  actionPlan: string;
  completionDate: string;
};

const emptyDraft: Draft = {
  priority: "IU",
  subject: "",
  dueDate: "",
  actionPlan: "",
  completionDate: "",
};

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Priority | "ALL">("ALL");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTasks(tasks);
  }, [tasks, hydrated]);

  const counts = useMemo(() => {
    const base: Record<Priority, number> = { IU: 0, UNI: 0, INU: 0, NINU: 0 };
    for (const t of tasks) base[t.priority] += 1;
    return base;
  }, [tasks]);

  const visible = useMemo(
    () => (filter === "ALL" ? tasks : tasks.filter((t) => t.priority === filter)),
    [tasks, filter],
  );

  const activeCount = tasks.filter((t) => !t.completionDate).length;
  const doneTodayCount = tasks.filter((t) => isToday(t.completionDate)).length;
  const dueTodayCount = tasks.filter((t) => isToday(t.dueDate) && !t.completionDate).length;

  function submit() {
    if (!draft.subject.trim()) return;
    if (editingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...draft, subject: draft.subject.trim() } : t)),
      );
      setEditingId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...draft, subject: draft.subject.trim() },
      ]);
    }
    setDraft(emptyDraft);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft({
      priority: task.priority,
      subject: task.subject,
      dueDate: task.dueDate,
      actionPlan: task.actionPlan,
      completionDate: task.completionDate,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold">Task Tracker</h1>
            <p className="text-xs text-muted">{activeCount} active · {doneTodayCount} completed today</p>
          </div>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Add task
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <section className="mt-6" aria-labelledby="tasks-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="tasks-heading" className="text-base font-semibold">{filter === "ALL" ? "All tasks" : `${filter} tasks`}</h2>
            <span className="text-xs text-muted">{visible.length} {visible.length === 1 ? "task" : "tasks"}</span>
          </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-line bg-surface px-5 py-10 text-center">
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted">Add a task using the form below.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-line bg-surface md:block">
              <div className="grid grid-cols-[2.5rem_6.5rem_1.5fr_7rem_2fr_6rem_6.5rem] items-center gap-3 border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                <span>SL</span>
                <span>Priority</span>
                <span>Subject</span>
                <span>Due</span>
                <span>Action plan</span>
                <span>Finished</span>
                <span className="text-right">Actions</span>
              </div>
              {visible.map((task, i) => (
                <div
                  key={task.id}
                  className="grid animate-rise grid-cols-[2.5rem_6.5rem_1.5fr_7rem_2fr_6rem_6.5rem] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
                >
                  <span className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-primary">{task.priority === "IU" || task.priority === "UNI" ? "**" : "*"} {task.priority}</span>
                  </span>
                  <span className="truncate text-sm font-semibold">{task.subject}</span>
                  <span className="text-sm text-muted">{formatDate(task.dueDate)}</span>
                  <span className="truncate text-sm text-muted">{task.actionPlan || "—"}</span>
                  <span
                    className={`text-sm ${task.completionDate ? "font-medium" : "text-muted"}`}
                  >
                    {formatDate(task.completionDate)}
                  </span>
                  <span className="flex justify-end gap-1.5">
                    <button onClick={() => startEdit(task)} className="rounded-md border border-line px-2 py-1.5 text-xs font-medium text-muted hover:text-ink">
                      Edit
                    </button>
                    <button onClick={() => remove(task.id)} className="rounded-md border border-line px-2 py-1.5 text-xs font-medium text-muted hover:text-iu">
                      Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 md:hidden">
              {visible.map((task) => (
                <article key={task.id} className="rounded-lg border border-line bg-surface p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-mono text-xs text-primary">{task.priority === "IU" || task.priority === "UNI" ? "**" : "*"} {task.priority}</strong>
                      <span className="font-mono text-[11px] text-muted">
                        Due {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <p className="mt-1 text-[15px] font-semibold leading-snug">{task.subject}</p>
                    {task.actionPlan ? (
                      <p className="mt-1 text-sm leading-snug text-muted">{task.actionPlan}</p>
                    ) : null}
                    {task.completionDate ? (
                      <p className="mt-1 font-mono text-[11px] text-muted">
                        Finished {formatDate(task.completionDate)}
                      </p>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => startEdit(task)} className="h-10 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground">
                        Edit
                      </button>
                      <button onClick={() => remove(task.id)} className="h-10 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-muted">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
        </section>

        <section aria-labelledby="priority-heading" className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="priority-heading" className="text-base font-semibold">Priority legend</h2>
            {filter !== "ALL" && <button onClick={() => setFilter("ALL")} className="text-xs font-medium text-primary">Show all tasks</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <button key={p} onClick={() => setFilter(filter === p ? "ALL" : p)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${filter === p ? "border-primary bg-priority-selected" : "border-line bg-surface hover:bg-background"}`}>
                <span className="font-mono text-primary">{p === "IU" || p === "UNI" ? "**" : "*"} {p}</span>
                <span className="hidden sm:inline text-muted">{PRIORITY_META[p].short}</span>
                <span className="min-w-6 rounded-full bg-background px-2 py-0.5 text-center text-xs font-medium text-muted">{counts[p]}</span>
              </button>
            ))}
          </div>
        </section>

        <section ref={formRef} className="mt-6 rounded-lg border border-line bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold">{editingId ? "Edit task" : "Add a task"}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="col-span-2 block md:col-span-1">
              <span className="text-[11px] font-medium text-muted">Priority</span>
              <select
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
                className="field mt-1.5 font-medium"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 block md:col-span-1">
              <span className="text-[11px] font-medium text-muted">Subject</span>
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="field mt-1.5"
                placeholder="What needs doing?"
              />
            </label>
            <label className="col-span-1 block">
              <span className="text-[11px] font-medium text-muted">Due</span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                className="field mt-1.5"
              />
            </label>
            <label className="col-span-1 block">
              <span className="text-[11px] font-medium text-muted">Finished</span>
              <input
                type="date"
                value={draft.completionDate}
                onChange={(e) => setDraft({ ...draft, completionDate: e.target.value })}
                className="field mt-1.5"
              />
            </label>
            <label className="col-span-2 block md:col-span-4">
              <span className="text-[11px] font-medium text-muted">Action plan</span>
              <input
                value={draft.actionPlan}
                onChange={(e) => setDraft({ ...draft, actionPlan: e.target.value })}
                className="field mt-1.5"
                placeholder="Steps to get it done"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="hidden text-xs text-muted sm:block">{dueTodayCount} unfinished {dueTodayCount === 1 ? "task is" : "tasks are"} due today.</p>
            <div className="ml-auto flex gap-2">
              {editingId ? (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setDraft(emptyDraft);
                  }}
                  className="h-11 rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-muted"
                >
                  Cancel
                </button>
              ) : null}
              <button
                onClick={submit}
                className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {editingId ? "Save changes" : "Add task"}
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-line pt-4 text-center text-xs text-muted">
          {tasks.length} total {tasks.length === 1 ? "task" : "tasks"}
        </footer>
      </main>
    </div>
  );
}
