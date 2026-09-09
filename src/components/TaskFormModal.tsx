"use client";

import { useState, useTransition } from "react";
import { createTask, updateTask, type TaskInput } from "@/app/actions/tasks";
import type { Priority, Profile, TaskWithAssignee } from "@/lib/types";
import { departmentOptions } from "@/lib/departments";

type Props = {
  profiles: Pick<Profile, "id" | "full_name" | "role" | "department">[];
  task?: TaskWithAssignee | null; // si viene, es edición
  onClose: () => void;
};

export default function TaskFormModal({ profiles, task, onClose }: Props) {
  const isEdit = !!task;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<TaskInput>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: (task?.priority ?? "media") as Priority,
    due_date: task?.due_date ?? "",
    assignee_id: task?.assignee_id ?? "",
    department: task?.department ?? "",
    next_action: task?.next_action ?? "",
  });

  function set<K extends keyof TaskInput>(key: K, value: TaskInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Al elegir responsable, se auto-asigna su departamento
  function onAssignee(id: string) {
    setForm((f) => {
      const p = profiles.find((x) => x.id === id);
      return { ...f, assignee_id: id, department: p?.department ?? f.department };
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateTask(task!.id, form)
        : await createTask(form);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15";
  const label = "block text-sm font-semibold text-ink mb-1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-ink mb-4">
          {isEdit ? "Editar tarea" : "Nueva tarea"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className={label}>Título *</label>
            <input
              className={field}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej. Planificación estrategia"
            />
          </div>

          <div>
            <label className={label}>Descripción</label>
            <textarea
              className={field}
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Prioridad</label>
              <select
                className={field}
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as Priority)}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className={label}>Fecha límite</label>
              <input
                type="date"
                className={field}
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={label}>Responsable</label>
            <select
              className={field}
              value={form.assignee_id}
              onChange={(e) => onAssignee(e.target.value)}
            >
              <option value="">— Sin asignar —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} · {p.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Departamento</label>
            <select
              className={field}
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              <option value="">— Sin departamento —</option>
              {departmentOptions(form.department).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Sugerencia de próxima acción</label>
            <input
              className={field}
              value={form.next_action}
              onChange={(e) => set("next_action", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-paprika font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-black/10 text-ink/70 hover:bg-black/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 rounded-full bg-paprika hover:bg-paprika-dark text-white font-semibold disabled:opacity-60"
            >
              {pending ? "Guardando…" : isEdit ? "Guardar" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
