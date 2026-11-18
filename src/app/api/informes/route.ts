import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/panel";
import { loadConfig, saveConfig } from "@/lib/informes/config";
import { buildReport, demoReport } from "@/lib/informes/report";
import type { InformesConfig, Range } from "@/lib/informes/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

const RANGES: Range[] = ["7", "14", "30", "all"];

// GET /api/informes?funnel=intensivo&range=7[&demo=1][&fresh=1]
export async function GET(request: Request) {
  const a = await auth();
  if (!a) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const cfg = await loadConfig(a.supabase);
  const funnel = cfg.funnels.find((f) => f.id === sp.get("funnel")) ?? cfg.funnels[0];
  const range = (RANGES.includes(sp.get("range") as Range) ? sp.get("range") : "7") as Range;
  try {
    const report = sp.get("demo") === "1" ? demoReport(funnel, range) : await buildReport(funnel, range, sp.get("fresh") === "1");
    return NextResponse.json({ report, config: cfg }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error", config: cfg }, { status: 500 });
  }
}

// POST /api/informes  { funnels: [...] } → guarda los ajustes de los funnels
export async function POST(request: Request) {
  const a = await auth();
  if (!a) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as InformesConfig | null;
  if (!body || !Array.isArray(body.funnels)) return NextResponse.json({ error: "bad-request" }, { status: 400 });
  try {
    const config = await saveConfig(a.supabase, a.user.id, body);
    return NextResponse.json({ config });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
