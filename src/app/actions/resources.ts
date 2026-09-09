"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Board, ResourceLink, ResourceTable } from "@/lib/types";

export type ResourceInput = {
  title: string;
  description: string;
  links: ResourceLink[];
  table_data: ResourceTable | null;
  image_url: string;
  category: string;
};

function cleanLinks(links: ResourceLink[]) {
  return links
    .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.url);
}

function cleanTable(t: ResourceTable | null) {
  if (!t) return null;
  const columns = (t.columns ?? []).map((c) => (c ?? "").trim());
  const rows = (t.rows ?? [])
    .map((r) => r.map((c) => (c ?? "").trim()))
    .filter((r) => r.some((c) => c)); // quita filas vacías
  if (columns.every((c) => !c) && rows.length === 0) return null;
  return { columns, rows };
}

export async function createResource(board: Board, input: ResourceInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("resources").insert({
    board,
    title: input.title.trim(),
    description: input.description.trim() || null,
    links: cleanLinks(input.links),
    table_data: cleanTable(input.table_data),
    image_url: input.image_url || null,
    category: input.category || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath(`/${board}`);
  return { ok: true };
}

export async function updateResource(
  id: string,
  board: Board,
  input: ResourceInput,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("resources")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      links: cleanLinks(input.links),
      table_data: cleanTable(input.table_data),
      image_url: input.image_url || null,
      category: input.category || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/${board}`);
  return { ok: true };
}

export async function duplicateResource(id: string, board: Board) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: r } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();
  if (!r) return { error: "Tarjeta no encontrada" };

  const { error } = await supabase.from("resources").insert({
    board: r.board,
    title: `${r.title} (copia)`,
    description: r.description,
    links: r.links,
    table_data: r.table_data,
    image_url: r.image_url,
    category: r.category,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath(`/${board}`);
  return { ok: true };
}

export async function deleteResource(id: string, board: Board) {
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/${board}`);
  return { ok: true };
}
