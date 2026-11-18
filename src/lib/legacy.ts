import type { SupabaseClient } from "@supabase/supabase-js";

// Vuelca las tareas (y sus comentarios) del tablero anterior (tabla public.tasks)
// al panel nuevo. Se hace una sola vez: queda marcado en state.legacyImport.
// Las tareas que ya existen en el panel con el mismo título no se duplican.

/* eslint-disable @typescript-eslint/no-explicit-any */
type State = Record<string, any> & { tasks: any[]; members: { id: string }[] };

type OldTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  due_date: string | null;
  assignee_id: string | null;
  department: string | null;
  next_action: string | null;
  done: boolean;
  done_at: string | null;
  created_at: string;
};
type OldComment = { task_id: string; author_id: string | null; body: string; created_at: string };

// Departamentos del tablero anterior → departamentos del panel
const DEPT: Record<string, string> = {
  "Equipo Comercial": "Ventas",
  "Equipo Publicidad": "Ads",
  "Equipo Contenidos": "Contenido",
  "Equipo Desarrollo": "Desarrollo",
  "Equipo Diseño": "Diseño",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export async function importLegacy(supabase: SupabaseClient, state: State) {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, title, description, priority, due_date, assignee_id, department, next_action, done, done_at, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const old = (tasks ?? []) as OldTask[];

  const comments: OldComment[] = [];
  if (old.length) {
    const { data } = await supabase
      .from("comments")
      .select("task_id, author_id, body, created_at")
      .order("created_at", { ascending: true });
    comments.push(...((data ?? []) as OldComment[]));
  }
  const byTask = new Map<string, OldComment[]>();
  for (const c of comments) {
    if (!byTask.has(c.task_id)) byTask.set(c.task_id, []);
    byTask.get(c.task_id)!.push(c);
  }

  const next: State = { ...state, tasks: [...state.tasks], departments: [...(state.departments ?? [])] };
  const memberIds = new Set(next.members.map((m) => m.id));
  const titles = new Set(next.tasks.map((t) => norm(String(t.title ?? ""))));
  const legacyIds = new Set(next.tasks.map((t) => t.legacyId).filter(Boolean));
  let seq = Math.max(Number(next.seq) || 0, ...next.tasks.map((t) => Number(t.num) || 0));
  let added = 0;

  for (const t of old) {
    if (legacyIds.has(t.id) || titles.has(norm(t.title))) continue;
    let dept = t.department ? DEPT[t.department] ?? t.department : "";
    if (dept && !next.departments.includes(dept)) next.departments.push(dept);
    if (!dept) dept = "";
    const desc = [t.description?.trim(), t.next_action?.trim() ? `Próxima acción: ${t.next_action.trim()}` : ""]
      .filter(Boolean)
      .join("\n\n");
    seq += 1;
    next.tasks.push({
      id: "lg" + t.id.replace(/-/g, "").slice(0, 10),
      num: seq,
      title: t.title,
      desc,
      project: "",
      dept,
      assignees: t.assignee_id && memberIds.has(t.assignee_id) ? [t.assignee_id] : [],
      priority: ["alta", "media", "baja"].includes(String(t.priority)) ? t.priority : "media",
      due: t.due_date || "",
      // En el tablero anterior, sin fecha = columna "Updates"
      mode: t.due_date ? "auto" : "update",
      done: !!t.done,
      ...(t.done ? { doneAt: t.done_at ? new Date(t.done_at).getTime() : Date.now() } : {}),
      createdAt: new Date(t.created_at).getTime(),
      comments: (byTask.get(t.id) ?? []).map((c) => ({
        by: c.author_id ?? "",
        text: c.body,
        at: new Date(c.created_at).getTime(),
      })),
      subtasks: [],
      legacyId: t.id,
    });
    titles.add(norm(t.title));
    added++;
  }
  next.seq = seq;
  next.legacyImport = { at: Date.now(), total: old.length, added };
  return { state: next, added, total: old.length };
}
