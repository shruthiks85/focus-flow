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
      <header className="sticky top-0 z-10 border-b border-line bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
              IE
            </span>
            <div className="min-w-0 leading-none">
              <p className="truncate font-display text-sm tracking-tight">Quadrant</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted">task dispatcher</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-line sm:inline-flex">
              <span className="size-1.5 rounded-full bg-iu" /> {dueTodayCount} due today
            </span>
            <button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="h-10 rounded-xl bg-ink px-4 text-sm font-semibold text-background transition-colors hover:bg-primary"
            >
              New task
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-8 pb-6">
          <div>
            <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Eisenhower dispatch
            </p>
            <h1 className="mt-2 animate-rise text-balance font-display text-5xl leading-[0.92] tracking-tighter sm:text-6xl">
              Four boxes, one plan.
            </h1>
            <p className="mt-3 max-w-[42ch] animate-rise text-pretty text-muted">
              Sort the day by what's truly important. Triage, act, and clear the list.
            </p>
          </div>
          <div className="flex animate-rise gap-6">
            <div>
              <p className="font-display text-3xl tracking-tight">{activeCount}</p>
              <p className="mt-1 font-mono text-[11px] text-muted">active</p>
            </div>
            <div>
              <p className="font-display text-3xl tracking-tight">{doneTodayCount}</p>
              <p className="mt-1 font-mono text-[11px] text-muted">done today</p>
            </div>
          </div>
        </section>

        <section className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            onClick={() => setFilter("ALL")}
            className={`flex shrink-0 items-center gap-2 rounded-xl py-2 pl-3 pr-3 text-sm font-semibold transition ${
              filter === "ALL"
                ? "bg-ink text-background"
                : "bg-surface font-medium ring-1 ring-line hover:ring-primary/40"
            }`}
          >
            All <span className="font-mono text-xs opacity-70">{tasks.length}</span>
          </button>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`flex shrink-0 items-center gap-2 rounded-xl py-2 pl-2 pr-3 text-sm transition ${
                filter === p
                  ? "bg-ink font-semibold text-background"
                  : "bg-surface font-medium ring-1 ring-line hover:ring-primary/40"
              }`}
            >
              <span className={`size-2.5 rounded-sm ${PRIORITY_META[p].dot}`} /> {p}{" "}
              <span className={`font-mono text-xs ${filter === p ? "opacity-70" : "text-muted"}`}>
                {counts[p]}
              </span>
            </button>
          ))}
        </section>

        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
          {PRIORITIES.map((p) => (
            <span key={p}>
              {p} · {PRIORITY_META[p].short}
            </span>
          ))}
        </p>

        {visible.length === 0 ? (
          <section className="mt-5 rounded-2xl bg-surface p-10 text-center ring-1 ring-line">
            <p className="font-display text-lg tracking-tight">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted">
              Add your first task below — priority, subject, due date and action plan.
            </p>
          </section>
        ) : (
          <>
            <section className="mt-5 hidden overflow-hidden rounded-2xl bg-surface ring-1 ring-line md:block">
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
                    <span className={`size-2.5 rounded-sm ${PRIORITY_META[task.priority].dot}`} />
                    <span className="font-mono text-xs font-semibold">{task.priority}</span>
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
                    <button
                      onClick={() => startEdit(task)}
                      className="rounded-lg px-2 py-1.5 font-mono text-[11px] font-semibold text-muted ring-1 ring-line transition-colors hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(task.id)}
                      className="rounded-lg px-2 py-1.5 font-mono text-[11px] font-semibold text-muted ring-1 ring-line transition-colors hover:text-iu"
                    >
                      Del
                    </button>
                  </span>
                </div>
              ))}
            </section>

            <section className="mt-5 space-y-3 md:hidden">
              {visible.map((task) => (
                <div
                  key={task.id}
                  className="flex animate-rise gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line"
                >
                  <span
                    className={`w-1 shrink-0 self-stretch rounded-full ${PRIORITY_META[task.priority].dot}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-[11px] font-semibold ${PRIORITY_META[task.priority].text}`}
                      >
                        {task.priority}
                      </span>
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
                      <button
                        onClick={() => startEdit(task)}
                        className="h-10 rounded-xl bg-ink px-3.5 text-xs font-semibold text-background"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(task.id)}
                        className="h-10 rounded-xl bg-surface px-3.5 text-xs font-semibold text-muted ring-1 ring-line"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        <section ref={formRef} className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-line">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {editingId ? "Edit task" : "Add a task"}
          </p>
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
            <p className="hidden text-[11px] text-muted sm:block">
              Fields map 1:1 to your spreadsheet — nothing extra, nothing missing.
            </p>
            <div className="ml-auto flex gap-2">
              {editingId ? (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setDraft(emptyDraft);
                  }}
                  className="h-12 rounded-xl bg-surface px-4 text-sm font-semibold text-muted ring-1 ring-line"
                >
                  Cancel
                </button>
              ) : null}
              <button
                onClick={submit}
                className="h-12 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-ink hover:text-background"
              >
                {editingId ? "Save changes" : "Add task"}
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 font-mono text-[11px] text-muted">
          <span>Quadrant · task dispatcher</span>
          <span>
            {tasks.length} tasks · {doneTodayCount} done today
          </span>
        </footer>
      </main>
    </div>
  );
}
