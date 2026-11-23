import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/panel";
import { slackDMToUsers } from "@/app/actions/slack";

export const dynamic = "force-dynamic";

const APP_URL = "https://amplify-tareas.vercel.app";

// POST /api/panel/mencion  { num, title, text, ids }
// Avisa por Slack (DM) a las personas mencionadas con @ en un comentario del panel.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const me = await getActiveProfile(supabase, user.id);
  if (!me) return NextResponse.json({ error: "no-auth" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    num?: number;
    title?: string;
    text?: string;
    ids?: string[];
  } | null;
  const ids = Array.isArray(body?.ids) ? body!.ids.filter((x) => typeof x === "string" && x !== user.id).slice(0, 20) : [];
  if (!ids.length) return NextResponse.json({ ok: true, sent: 0 });

  const num = Number(body?.num) || 0;
  const title = String(body?.title || "").slice(0, 200);
  const text = String(body?.text || "").slice(0, 600);
  const who = (me as { full_name?: string }).full_name || "Alguien";
  const link = num ? `${APP_URL}/tareas/AMP-${num}` : APP_URL;

  await slackDMToUsers(
    ids,
    `💬 *${who}* te ha mencionado en *AMP-${num} · ${title}*:\n> ${text.replace(/\n/g, "\n> ")}\n${link}`,
  );
  return NextResponse.json({ ok: true, sent: ids.length });
}
