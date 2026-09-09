"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { STATUS_COLUMNS, statusForTask, daysUntilDue } from "@/lib/status";
import {
  deleteTask,
  setDone,
  moveTask,
  duplicateTask,
  setDepartment,
} from "@/app/actions/tasks";
import { DEPARTMENTS } from "@/lib/departments";
import type { Priority, Profile, TaskWithAssignee } from "@/lib/types";

type GroupBy = "estado" | "departamento";

// Colores para las columnas de departamento
const DEPT_COLORS = [
  "#B53324",
  "#E5A657",
  "#8a9a5b",
  "#5f8a5f",
  "#8a94a6",
  "#c9a36a",
  "#a97bd1",
  "#d16b86",
];
const NO_DEPT = "__none__";
import TaskFormModal from "./TaskFormModal";
import TaskDrawer from "./TaskDrawer";

type Props = {
  tasks: TaskWithAssignee[];
  profiles: Pick<Profile, "id" | "full_name" | "role" | "department">[];
  currentUserId: string;
  isAdmin: boolean;
  openTaskId?: string;
};

const PRIORITY_STYLE: Record<Priority, string> = {
  alta: "bg-paprika/10 text-paprika",
  media: "bg-honeycomb/20 text-honeycomb-dark",
  baja: "bg-black/[0.05] text-ink/50",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default function Board({
  tasks,
  profiles,
  currentUserId,
  isAdmin,
  openTaskId,
}: Props) {
  const [onlyMine, setOnlyMine] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("estado");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<TaskWithAssignee | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function drop(colKey: string) {
    const id = dragId;
    setDragId(null);
    setDragOver(null);
    if (!id) return;
    if (groupBy === "estado") {
      startTransition(() => moveTask(id, colKey).then(() => {}));
    } else {
      startTransition(() =>
        setDepartment(id, colKey === NO_DEPT ? "" : colKey).then(() => {}),
      );
    }
  }

  // Abrir automáticamente la tarea que venga en la URL (?task=...) desde una notificación
  useEffect(() => {
    if (openTaskId) {
      const t = tasks.find((x) => x.id === openTaskId);
      if (t) setDetail(t);
    }
  }, [openTaskId, tasks]);

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (showDone || !t.done) &&
          (!onlyMine || t.assignee_id === currentUserId),
      ),
    [tasks, onlyMine, currentUserId, showDone],
  );

  // Columnas según el modo de agrupación
  const columns = useMemo(() => {
    if (groupBy === "estado") {
      return STATUS_COLUMNS.filter(
        (c) => showDone || c.key !== "finalizadas",
      ).map((c) => ({
        key: c.key as string,
        label: c.label,
        color: c.color,
      }));
    }
    const set = new Set<string>(DEPARTMENTS);
    for (const t of tasks) if (t.department) set.add(t.department);
    const cols = [...set].map((d, i) => ({
      key: d,
      label: d,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
    }));
    cols.push({ key: NO_DEPT, label: "Sin departamento", color: "#c9c4bb" });
    return cols;
  }, [groupBy, tasks, showDone]);

  const byColumn = useMemo(() => {
    const map = new Map<string, TaskWithAssignee[]>();
    for (const col of columns) map.set(col.key, []);
    for (const t of visible) {
      const key =
        groupBy === "estado" ? statusForTask(t) : t.department || NO_DEPT;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [visible, columns, groupBy]);

  function openNew() {
    setCreateOpen(true);
  }

  return (
    <div>
      {/* Barra de controles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex rounded-full border border-black/[0.07] bg-white p-1 shadow-soft">
            <button
              onClick={() => setOnlyMine(false)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                !onlyMine
                  ? "bg-paprika text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setOnlyMine(true)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                onlyMine
                  ? "bg-paprika text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Solo las mías
            </button>
          </div>

          <div className="inline-flex rounded-full border border-black/[0.07] bg-white p-1 shadow-soft">
            <button
              onClick={() => setGroupBy("estado")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                groupBy === "estado"
                  ? "bg-ink text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Por estado
            </button>
            <button
              onClick={() => setGroupBy("departamento")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                groupBy === "departamento"
                  ? "bg-ink text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Por departamento
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-ink/70"
          >
            <span
              className={`w-9 h-5 rounded-full relative transition-colors ${
                showDone ? "bg-paprika" : "bg-black/15"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  showDone ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
            Ver tareas finalizadas
          </button>

          {isAdmin && (
            <button
              onClick={openNew}
              className="bg-paprika hover:bg-paprika-dark text-white font-semibold px-5 py-2 rounded-full text-sm shadow-soft transition-colors"
            >
              + Nueva tarea
            </button>
          )}
        </div>
      </div>

      {/* Tablero */}
      <div className="grid items-start gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {columns.map((col) => {
          const items = byColumn.get(col.key) ?? [];
          return (
            <div
              key={col.key}
              className="min-w-0"
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setDragOver(col.key);
                }
              }}
              onDragLeave={() =>
                setDragOver((k) => (k === col.key ? null : k))
              }
              onDrop={() => drop(col.key)}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-sm font-semibold text-ink tracking-tight">
                  {col.label}
                </span>
                <span className="text-xs text-ink/40 font-medium bg-black/[0.04] px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              <div
                className={`space-y-3 rounded-2xl min-h-[60px] transition-colors ${
                  dragOver === col.key
                    ? "bg-paprika/5 ring-2 ring-paprika/30 ring-dashed p-2"
                    : ""
                }`}
              >
                {items.length === 0 && (
                  <p className="text-sm text-ink/40 px-1 py-2">Sin tareas</p>
                )}

                {items.map((t) => {
                  const days = daysUntilDue(t);
                  const overdue = !t.done && days !== null && days < 0;
                  const canEdit =
                    isAdmin || t.assignee_id === currentUserId;
                  return (
                    <div
                      key={t.id}
                      draggable={canEdit}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOver(null);
                      }}
                      onClick={() => setDetail(t)}
                      className={`bg-white rounded-2xl border border-black/[0.06] p-4 shadow-soft hover:shadow-card transition-shadow cursor-pointer ${
                        canEdit ? "active:cursor-grabbing" : ""
                      } ${dragId === t.id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-ink leading-snug min-w-0 break-words">
                          {t.title}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLE[t.priority]}`}
                        >
                          {t.priority.toUpperCase()}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-sm text-ink/70 mt-1.5 line-clamp-3 break-words">
                          {t.description}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-xs text-ink/70">
                        <p>
                          📅 <b>{formatDate(t.due_date)}</b>
                          {days !== null && !t.done && (
                            <span
                              className={
                                overdue
                                  ? "text-paprika font-semibold"
                                  : "text-ink/50"
                              }
                            >
                              {" "}
                              ({days < 0
                                ? `vencida hace ${-days}d`
                                : days === 0
                                  ? "hoy"
                                  : `en ${days}d`}
                              )
                            </span>
                          )}
                        </p>
                        <p className="flex items-center gap-1.5 pt-0.5">
                          <span>👤</span>
                          <span className="text-base font-bold text-ink">
                            {t.assignee ? t.assignee.full_name : "Sin asignar"}
                          </span>
                        </p>
                        {t.next_action && (
                          <p className="text-ink/60 break-words">
                            ➡️ {t.next_action}
                          </p>
                        )}
                      </div>

                      {/* Acciones */}
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setDetail(t)}
                          className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
                        >
                          💬 Abrir
                        </button>
                        {canEdit && (
                          <button
                            onClick={() =>
                              startTransition(() =>
                                setDone(t.id, !t.done).then(() => {}),
                              )
                            }
                            disabled={pending}
                            className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
                          >
                            {t.done ? "↩︎ Reabrir" : "✓ Hecha"}
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setDetail(t)}
                              className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
                            >
                              ✎ Editar
                            </button>
                            <button
                              onClick={() =>
                                startTransition(() =>
                                  duplicateTask(t.id).then(() => {}),
                                )
                              }
                              disabled={pending}
                              className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
                            >
                              ⧉ Duplicar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Borrar "${t.title}"?`))
                                  startTransition(() =>
                                    deleteTask(t.id).then(() => {}),
                                  );
                              }}
                              disabled={pending}
                              className="text-xs px-3 py-1 rounded-full border border-paprika/30 text-paprika hover:bg-paprika/10"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {createOpen && (
        <TaskFormModal
          profiles={profiles}
          task={null}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {detail && (
        <TaskDrawer
          task={detail}
          profiles={profiles}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
