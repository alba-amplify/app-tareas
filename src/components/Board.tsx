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
  alta: "bg-bad-soft text-bad",
  media: "bg-warn-soft text-warn",
  baja: "bg-sand text-muted",
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
          <div className="inline-flex rounded-2xl border border-biscuit bg-crumpet p-1">
            <button
              onClick={() => setOnlyMine(false)}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[10px] transition-colors ${
                !onlyMine
                  ? "bg-cacao text-[#F9F6F0] shadow-soft"
                  : "text-muted hover:text-ink"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setOnlyMine(true)}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[10px] transition-colors ${
                onlyMine
                  ? "bg-cacao text-[#F9F6F0] shadow-soft"
                  : "text-muted hover:text-ink"
              }`}
            >
              Solo las mías
            </button>
          </div>

          <div className="inline-flex rounded-2xl border border-biscuit bg-crumpet p-1">
            <button
              onClick={() => setGroupBy("estado")}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[10px] transition-colors ${
                groupBy === "estado"
                  ? "bg-cacao text-[#F9F6F0] shadow-soft"
                  : "text-muted hover:text-ink"
              }`}
            >
              Por estado
            </button>
            <button
              onClick={() => setGroupBy("departamento")}
              className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[10px] transition-colors ${
                groupBy === "departamento"
                  ? "bg-cacao text-[#F9F6F0] shadow-soft"
                  : "text-muted hover:text-ink"
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
              className={`w-[38px] h-[22px] rounded-full relative transition-colors border ${
                showDone ? "bg-good border-transparent" : "bg-sand border-biscuit"
              }`}
            >
              <span
                className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow transition-all ${
                  showDone ? "left-[18px]" : "left-[2px]"
                }`}
              />
            </span>
            Ver tareas finalizadas
          </button>

          {isAdmin && (
            <button
              onClick={openNew}
              className="bg-paprika hover:bg-paprika-dark text-white font-medium px-5 py-2 rounded-xl text-sm shadow-soft transition-colors"
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
              className="min-w-0 rounded-3xl bg-crumpet border border-biscuit p-2.5 flex flex-col"
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
              <div className="flex items-center gap-2 px-1.5 pt-1 pb-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-sm font-medium text-ink">
                  {col.label}
                </span>
                <span className="ml-auto text-xs text-muted tabular-nums">
                  {items.length}
                </span>
              </div>
              <div
                className="h-1 rounded-full mx-1.5 mb-2.5 opacity-80"
                style={{ backgroundColor: col.color }}
              />

              <div
                className={`space-y-2 rounded-2xl min-h-[60px] transition-colors ${
                  dragOver === col.key
                    ? "bg-paprika-soft ring-2 ring-paprika/30 p-1.5"
                    : ""
                }`}
              >
                {items.length === 0 && (
                  <p className="text-[13px] text-faint px-1.5 py-2">Sin tareas</p>
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
                      className={`bg-white rounded-xl border border-transparent p-3 shadow-soft hover:border-biscuit transition-colors cursor-pointer ${
                        canEdit ? "active:cursor-grabbing" : ""
                      } ${dragId === t.id ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-sans font-medium text-ink leading-snug min-w-0 break-words">
                          {t.title}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${PRIORITY_STYLE[t.priority]}`}
                        >
                          {t.priority.toUpperCase()}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-[13px] text-muted mt-1 line-clamp-3 break-words">
                          {t.description}
                        </p>
                      )}

                      <div className="mt-2.5 space-y-1 text-xs text-muted">
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
                          <span className="text-[13px] font-medium text-ink">
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
                        className="mt-3 pt-2.5 border-t border-biscuit flex flex-wrap gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setDetail(t)}
                          className="text-xs px-3 py-1 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/70"
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
                            className="text-xs px-3 py-1 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/70"
                          >
                            {t.done ? "↩︎ Reabrir" : "✓ Hecha"}
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => setDetail(t)}
                              className="text-xs px-3 py-1 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/70"
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
                              className="text-xs px-3 py-1 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/70"
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
                              className="text-xs px-2.5 py-1 rounded-lg border border-bad/30 bg-bad-soft text-bad hover:border-bad"
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
