import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile, getRev, loadPanel, savePanel } from "@/lib/panel";

export const dynamic = "force-dynamic";

async function auth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await getActiveProfile(supabase, user.id);
  if (!profile) return null;
  return { supabase, user };
}

// GET /api/panel?rev=N  → { rev } si no hay cambios; { rev, state } si los hay.
export async function GET(request: Request) {
  const a = await auth();
  if (!a) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const known = Number(new URL(request.url).searchParams.get("rev") ?? "-1");
  if (known >= 0) {
    const rev = await getRev(a.supabase);
    if (rev <= known) return NextResponse.json({ rev });
  }
  return NextResponse.json(await loadPanel(a.supabase), { headers: { "cache-control": "no-store" } });
}

// POST /api/panel  { rev, state } → guarda si nadie ha guardado antes (si no, 409 con la versión actual).
export async function POST(request: Request) {
  const a = await auth();
  if (!a) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.rev !== "number" || !body.state || !Array.isArray(body.state.tasks)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  try {
    const r = await savePanel(a.supabase, a.user.id, body.state, body.rev);
    if (r.conflict) return NextResponse.json({ state: r.state, rev: r.rev }, { status: 409 });
    return NextResponse.json({ rev: r.rev });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
