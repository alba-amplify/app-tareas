"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slackDMToUsers } from "./slack";
import type { Priority } from "@/lib/types";

const APP_URL = "https://amplify-tareas.vercel.app";

// Avisa (app + Slack) a la persona a la que se le asigna una tarea.
async function notifyAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string,
  assigneeId: string,
  taskId: string,
  taskTitle: string,
) {
  await supabase.from("notifications").insert({
    recipient_id: assigneeId,
    actor_id: actorId,
    task_id: taskId,
    type: "assignment",
  });
  const { data: actor } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", actorId)
    .single();
  const actorName = actor?.full_name ?? "Alguien";
  await slackDMToUsers(
    [assigneeId],
    `✅ *${actorName}* te ha asignado la tarea *${taskTitle}*.\nÁbrela en el panel: ${APP_URL}`,
  );
}

export type TaskInput = {
  title: string;
  description: string;
  priority: Priority;
  due_date: string; // '' o 'YYYY-MM-DD'
  assignee_id: string; // '' o uuid
  department: string;
  next_action: string;
};

function clean(input: TaskInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    priority: input.priority,
    due_date: input.due_date || null,
    assignee_id: input.assignee_id || null,
    department: input.department.trim() || null,
    next_action: input.next_action.trim() || null,
  };
}

export async function createTask(input: TaskInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const cleaned = clean(input);
  const { data: created, error } = await supabase
    .from("tasks")
    .insert({ ...cleaned, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (cleaned.assignee_id && created) {
    await notifyAssignment(
      supabase,
      user.id,
      cleaned.assignee_id,
      created.id,
      cleaned.title,
    );
  }
  revalidatePath("/");
  return { ok: true };
}

export async function updateTask(id: string, input: TaskInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cleaned = clean(input);

  // Responsable anterior (para avisar solo si cambia)
  const { data: prev } = await supabase
    .from("tasks")
    .select("assignee_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({ ...cleaned, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  if (
    user &&
    cleaned.assignee_id &&
    cleaned.assignee_id !== prev?.assignee_id
  ) {
    await notifyAssignment(supabase, user.id, cleaned.assignee_id, id, cleaned.title);
  }
  revalidatePath("/");
  return { ok: true };
}

export async function duplicateTask(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: t } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (!t) return { error: "Tarea no encontrada" };

  const { error } = await supabase.from("tasks").insert({
    title: `${t.title} (copia)`,
    description: t.description,
    priority: t.priority,
    due_date: t.due_date,
    assignee_id: t.assignee_id,
    department: t.department,
    next_action: t.next_action,
    done: false,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

// Mueve una tarea a una columna arrastrándola: ajusta la fecha límite
// (o el estado "hecha") para que caiga en la columna destino.
export async function moveTask(id: string, target: string) {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const base = { done: false, done_at: null, updated_at: new Date().toISOString() };
  let patch: Record<string, unknown>;
  switch (target) {
    case "finalizadas":
      patch = { done: true, done_at: new Date().toISOString(), updated_at: base.updated_at };
      break;
    case "retrasadas":
      patch = { ...base, due_date: isoDate(-1) };
      break;
    case "hoy":
      patch = { ...base, due_date: isoDate(0) };
      break;
    case "manana":
      patch = { ...base, due_date: isoDate(1) };
      break;
    case "pasado":
      patch = { ...base, due_date: isoDate(2) };
      break;
    case "mas3":
      patch = { ...base, due_date: isoDate(3) };
      break;
    case "updates":
      patch = { ...base, due_date: null };
      break;
    default:
      return { error: "Columna desconocida" };
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function setDepartment(id: string, department: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      department: department || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function setDone(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      done,
      done_at: done ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}
