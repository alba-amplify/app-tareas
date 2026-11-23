import type { SupabaseClient } from "@supabase/supabase-js";
import seed from "@/panel/seed.json";

// Estado del panel de tareas: un único documento JSON en public.panel_state (id = 1).
// El equipo del panel son los perfiles activos de la app.

/* eslint-disable @typescript-eslint/no-explicit-any */
type PanelState = Record<string, any> & {
  members: { id: string; name: string; color: string }[];
  tasks: any[];
};

type ProfileRow = { id: string; full_name: string; active?: boolean | null };

const PALETTE = ["#b5402f", "#2f8a57", "#7c3aed", "#db2777", "#d97706", "#0e7490", "#4f6889", "#9c7a48", "#5f8a35", "#a3477a"];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().split(/\s+/)[0].toLowerCase();

export async function getActiveProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, active")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (!data || data.active === false) return null;
  return data;
}

async function activeProfiles(supabase: SupabaseClient): Promise<ProfileRow[]> {
  const { data } = await supabase.from("profiles").select("id, full_name, active").order("full_name");
  return (data ?? []).filter((p: ProfileRow) => p.active !== false);
}

// Equipo = perfiles activos; conserva el color que ya tuviera cada persona.
function withMembers(state: PanelState, profiles: ProfileRow[]): PanelState {
  const prevById = new Map(state.members.map((m) => [m.id, m]));
  const prevByName = new Map(state.members.map((m) => [norm(m.name), m]));
  const used = new Set<string>();
  const members = profiles.map((p, i) => {
    const prev = prevById.get(p.id) ?? prevByName.get(norm(p.full_name));
    let color = prev?.color;
    if (!color || used.has(color)) color = PALETTE.find((c) => !used.has(c)) ?? PALETTE[i % PALETTE.length];
    used.add(color);
    return { id: p.id, name: p.full_name, color };
  });
  // Alba primero (es quien gestiona el panel), el resto por nombre.
  members.sort((a, b) => (norm(a.name) === "alba" ? -1 : norm(b.name) === "alba" ? 1 : a.name.localeCompare(b.name, "es")));
  return { ...state, members };
}

// Primer arranque: las personas del panel original se emparejan por nombre con los perfiles.
function seedFor(profiles: ProfileRow[]): PanelState {
  const s = JSON.parse(JSON.stringify(seed)) as PanelState;
  const byName = new Map(profiles.map((p) => [norm(p.full_name), p.id]));
  const idMap = new Map<string, string>();
  for (const m of s.members) {
    const pid = byName.get(norm(m.name));
    if (pid) idMap.set(m.id, pid);
  }
  for (const t of s.tasks) {
    t.assignees = (t.assignees as string[]).map((a) => idMap.get(a)).filter(Boolean);
    for (const c of t.comments ?? []) if (idMap.has(c.by)) c.by = idMap.get(c.by);
  }
  return withMembers(s, profiles);
}

export async function loadPanel(supabase: SupabaseClient) {
  const profiles = await activeProfiles(supabase);
  let { data: row } = await supabase.from("panel_state").select("data, rev").eq("id", 1).maybeSingle();
  if (!row) {
    await supabase.from("panel_state").upsert({ id: 1, data: seedFor(profiles), rev: 1 }, { onConflict: "id", ignoreDuplicates: true });
    ({ data: row } = await supabase.from("panel_state").select("data, rev").eq("id", 1).maybeSingle());
    if (!row) throw new Error("No se pudo leer panel_state. ¿Has ejecutado supabase/2026-11-panel-tareas.sql?");
  }
  return { state: withMembers(row.data as PanelState, profiles), rev: row.rev as number };
}

export async function getRev(supabase: SupabaseClient) {
  const { data } = await supabase.from("panel_state").select("rev").eq("id", 1).maybeSingle();
  return (data?.rev as number) ?? 0;
}

export async function savePanel(supabase: SupabaseClient, userId: string, state: PanelState, rev: number) {
  const { data, error } = await supabase
    .from("panel_state")
    .update({ data: state, rev: rev + 1, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .eq("rev", rev)
    .select("rev");
  if (error) throw error;
  if (!data || data.length === 0) return { conflict: true as const, ...(await loadPanel(supabase)) };
  return { conflict: false as const, rev: data[0].rev as number };
}
