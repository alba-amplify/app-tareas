"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SocialInput = {
  publish_date: string;
  category: string;
  objective: string;
  product: string;
  status: string;
  link: string;
  content: string;
  copy: string;
  script: string;
  content_raw: string;
  content_edited: string;
  newsletter: string;
  kind: string;
  format: string;
  inspiration: string;
};

function clean(i: SocialInput) {
  return {
    publish_date: i.publish_date || null,
    category: i.category.trim() || null,
    objective: i.objective.trim() || null,
    product: i.product.trim() || null,
    status: i.status || "FALTA COPY",
    link: i.link.trim() || null,
    content: i.content.trim() || null,
    copy: i.copy.trim() || null,
    script: i.script.trim() || null,
    content_raw: i.content_raw.trim() || null,
    content_edited: i.content_edited.trim() || null,
    newsletter: i.newsletter.trim() || null,
    format: i.format || "Post",
    inspiration: i.inspiration.trim() || null,
    // El tipo (publicación/story) se deriva del formato
    kind: i.format === "Story" ? "story" : "publicacion",
  };
}

export async function createPost(input: SocialInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  const { error } = await supabase
    .from("social_posts")
    .insert({ ...clean(input), created_by: user.id });
  if (error) return { error: error.message };
  revalidatePath("/rrss");
  return { ok: true };
}

export async function updatePost(id: string, input: SocialInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_posts")
    .update({ ...clean(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/rrss");
  return { ok: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("social_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/rrss");
  return { ok: true };
}
