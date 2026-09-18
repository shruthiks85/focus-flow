import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
      { title: "Quadrant — Simple Priority Task Tracker" },
      {
        name: "description",
        content:
          "Add, update, filter and paginate tasks by IU, UNI, INU and NINU priority.",
      },
      { property: "og:title", content: "Quadrant — Simple Priority Task Tracker" },
      {
        property: "og:description",
        content: "A simple priority-first task list for desktop and mobile.",
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

const PAGE_SIZE = 6;

const SEARCH_COLUMNS = [
  { value: "ALL", label: "All columns" },
  { value: "priority", label: "Priority" },
  { value: "subject", label: "Subject" },
  { value: "dueDate", label: "Due date" },
  { value: "actionPlan", label: "Action plan" },
  { value: "completionDate", label: "Completed" },
] as const;

type SearchColumn = (typeof SEARCH_COLUMNS)[number]["value"];

function columnText(task: Task, column: SearchColumn) {
  if (column === "ALL") {
    return [
      task.priority,
      PRIORITY_META[task.priority].short,
      task.subject,
      task.dueDate,
      formatDate(task.dueDate),
      task.actionPlan,
      task.completionDate,
      formatDate(task.completionDate),
    ].join(" ");
  }
  if (column === "priority") {
    return `${task.priority} ${PRIORITY_META[task.priority].short}`;
  }
  if (column === "dueDate") return `${task.dueDate} ${formatDate(task.dueDate)}`;
  if (column === "completionDate")
    return `${task.completionDate} ${formatDate(task.completionDate)}`;
  return task[column];
}

function priorityMark(priority: Priority) {
  return priority === "IU" || priority === "UNI" ? "**" : "*";
}

function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Priority | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState<SearchColumn>("ALL");
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
    for (const task of tasks) base[task.priority] += 1;
    return base;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const terms = search.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return tasks.filter((task) => {
      if (filter !== "ALL" && task.priority !== filter) return false;
      if (terms.length === 0) return true;
      const haystack = columnText(task, searchColumn).toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [tasks, filter, search, searchColumn]);
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const firstResult = filteredTasks.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredTasks.length);
  const activeCount = tasks.filter((task) => !task.completionDate).length;
  const doneTodayCount = tasks.filter((task) => isToday(task.completionDate)).length;
  const dueTodayCount = tasks.filter(
    (task) => isToday(task.dueDate) && !task.completionDate,
  ).length;

  function chooseFilter(nextFilter: Priority | "ALL") {
    setFilter(nextFilter);
    setPage(1);
  }

  function submit() {
    if (!draft.subject.trim()) return;
    if (editingId) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingId
            ? { ...task, ...draft, subject: draft.subject.trim() }
            : task,
        ),
      );
      setEditingId(null);
    } else {
      setTasks((previous) => [
        ...previous,
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
    setTasks((previous) => previous.filter((task) => task.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  }

  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold">Task Tracker</h1>
            <p className="text-xs text-muted">
              {activeCount} active · {doneTodayCount} completed today
            </p>
          </div>
          <Button
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
            size="sm"
          >
            <Plus aria-hidden="true" />
            Add task
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <section aria-labelledby="tasks-heading" className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="border-b border-line px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="tasks-heading" className="text-base font-semibold">Tasks</h2>
                <p className="mt-0.5 text-xs text-muted">View and manage your priority list</p>
              </div>
              {filter !== "ALL" || search ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    chooseFilter("ALL");
                    setSearch("");
                    setSearchColumn("ALL");
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="field pl-9"
                  placeholder="Search tasks — type 2 or more keywords"
                  aria-label="Search tasks"
                />
              </div>
              <label className="sm:w-52">
                <span className="sr-only">Search column</span>
                <select
                  value={searchColumn}
                  onChange={(event) => {
                    setSearchColumn(event.target.value as SearchColumn);
                    setPage(1);
                  }}
                  className="field"
                  aria-label="Search column"
                >
                  {SEARCH_COLUMNS.map((column) => (
                    <option key={column.value} value={column.value}>{column.label}</option>
                  ))}
                </select>
              </label>
            </div>


            <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1" aria-label="Filter tasks by priority">
              <Button
                size="sm"
                variant={filter === "ALL" ? "default" : "outline"}
                onClick={() => chooseFilter("ALL")}
                aria-pressed={filter === "ALL"}
                className="shrink-0"
              >
                All <span className="opacity-70">{tasks.length}</span>
              </Button>
              {PRIORITIES.map((priority) => (
                <Button
                  key={priority}
                  size="sm"
                  variant={filter === priority ? "default" : "outline"}
                  onClick={() => chooseFilter(priority)}
                  aria-pressed={filter === priority}
                  className="shrink-0"
                >
                  <span className="font-mono">{priorityMark(priority)} {priority}</span>
                  <span className="opacity-70">{counts[priority]}</span>
                </Button>
              ))}
            </div>
          </div>

          {pageTasks.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-medium">No tasks found</p>
              <p className="mt-1 text-xs text-muted">
                {filter === "ALL" ? "Add your first task below." : "Try another priority filter."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed text-left">
                  <thead className="bg-subtle text-[11px] uppercase text-muted">
                    <tr>
                      <th className="w-[9%] px-4 py-3 font-medium">Priority</th>
                      <th className="w-[22%] px-4 py-3 font-medium">Subject</th>
                      <th className="w-[12%] px-4 py-3 font-medium">Due date</th>
                      <th className="w-[29%] px-4 py-3 font-medium">Action plan</th>
                      <th className="w-[14%] px-4 py-3 font-medium">Completed</th>
                      <th className="w-[14%] px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageTasks.map((task) => (
                      <tr key={task.id} className="border-t border-line hover:bg-subtle">
                        <td className="px-4 py-3">
                          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                            {priorityMark(task.priority)} {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">{task.subject}</td>
                        <td className="px-4 py-3 text-sm text-muted">{formatDate(task.dueDate)}</td>
                        <td className="px-4 py-3 text-sm text-muted">
                          <p className="line-clamp-2">{task.actionPlan || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">{formatDate(task.completionDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(task)} aria-label={`Edit ${task.subject}`} title="Edit task">
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(task.id)} aria-label={`Delete ${task.subject}`} title="Delete task" className="text-danger hover:text-danger">
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-line md:hidden">
                {pageTasks.map((task) => (
                  <article key={task.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                          {priorityMark(task.priority)} {task.priority}
                        </span>
                        <h3 className="mt-2 text-sm font-semibold leading-snug">{task.subject}</h3>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(task)} aria-label={`Edit ${task.subject}`}>
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(task.id)} aria-label={`Delete ${task.subject}`} className="text-danger">
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    {task.actionPlan ? <p className="mt-2 text-sm leading-relaxed text-muted">{task.actionPlan}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span>Completed: {formatDate(task.completionDate)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-muted">
              Showing {firstResult}–{lastResult} of {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
            </p>
            <nav className="flex items-center gap-1" aria-label="Task list pagination">
              <Button variant="outline" size="icon" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page">
                <ChevronLeft aria-hidden="true" />
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button variant="outline" size="icon" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Next page">
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </section>

        <section ref={formRef} className="mt-5 rounded-lg border border-line bg-surface p-4 sm:p-5" aria-labelledby="task-form-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="task-form-heading" className="text-base font-semibold">{editingId ? "Edit task" : "Add a task"}</h2>
              <p className="mt-0.5 text-xs text-muted">{dueTodayCount} unfinished {dueTodayCount === 1 ? "task is" : "tasks are"} due today</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <label className="col-span-2 block md:col-span-1">
              <span className="field-label">Priority</span>
              <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })} className="field mt-1.5 font-medium">
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{PRIORITY_META[priority].label}</option>)}
              </select>
            </label>
            <label className="col-span-2 block md:col-span-1">
              <span className="field-label">Subject</span>
              <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} className="field mt-1.5" placeholder="What needs doing?" />
            </label>
            <label className="col-span-1 block">
              <span className="field-label">Due date</span>
              <input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} className="field mt-1.5" />
            </label>
            <label className="col-span-1 block">
              <span className="field-label">Completion date</span>
              <input type="date" value={draft.completionDate} onChange={(event) => setDraft({ ...draft, completionDate: event.target.value })} className="field mt-1.5" />
            </label>
            <label className="col-span-2 block md:col-span-4">
              <span className="field-label">Action plan</span>
              <input value={draft.actionPlan} onChange={(event) => setDraft({ ...draft, actionPlan: event.target.value })} className="field mt-1.5" placeholder="Steps to get it done" />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            {editingId ? (
              <Button variant="outline" onClick={() => { setEditingId(null); setDraft(emptyDraft); }}>Cancel</Button>
            ) : null}
            <Button onClick={submit}>{editingId ? "Save changes" : "Add task"}</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
