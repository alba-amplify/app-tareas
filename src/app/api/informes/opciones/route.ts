import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/panel";
import { ghlConfigured, pipelines, tags } from "@/lib/informes/ghl";
import { listCampaignNames, metaConfigured } from "@/lib/informes/meta";

export const dynamic = "force-dynamic";

// Opciones reales para los Ajustes: etiquetas y pipelines de GHL, campañas de Meta.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await getActiveProfile(supabase, user.id))) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }
  const [t, p, c] = await Promise.allSettled([
    ghlConfigured() ? tags() : Promise.resolve([]),
    ghlConfigured() ? pipelines() : Promise.resolve([]),
    metaConfigured() ? listCampaignNames() : Promise.resolve([]),
  ]);
  const err = (r: PromiseSettledResult<unknown>) => (r.status === "rejected" ? String((r.reason as Error)?.message || r.reason) : undefined);
  return NextResponse.json({
    meta: { configured: metaConfigured(), error: err(c) },
    ghl: { configured: ghlConfigured(), error: err(t) || err(p) },
    tags: t.status === "fulfilled" ? t.value : [],
    pipelines: p.status === "fulfilled" ? p.value.map((x) => ({ id: x.id, name: x.name })) : [],
    campaigns: c.status === "fulfilled" ? c.value : [],
  });
}
