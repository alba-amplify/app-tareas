import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile, loadPanel } from "@/lib/panel";
import { PANEL_HEAD, PANEL_SCRIPT } from "@/panel/template";

export const dynamic = "force-dynamic";

// Panel de tareas de Amplify: HTML completo con el estado actual incrustado.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const profile = await getActiveProfile(supabase, user.id);
  if (!profile) return NextResponse.redirect(`${origin}/auth/signout?error=sin-acceso`);

  let panel: Awaited<ReturnType<typeof loadPanel>>;
  try {
    panel = await loadPanel(supabase);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al cargar el panel";
    return new NextResponse(`<!DOCTYPE html><meta charset="utf-8"><p style="font:16px sans-serif;padding:40px">${msg}</p>`, {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");
  const html =
    '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<title>Panel de tareas · Amplify</title>\n" +
    PANEL_HEAD +
    "\n</head>\n<body>\n<div id=\"root\"></div>\n" +
    `<script>window.__PANEL__=${json({ me: profile.id, rev: panel.rev })};</script>\n` +
    `<script id="data" type="application/json">${json(panel.state)}</script>\n` +
    PANEL_SCRIPT +
    "\n</body>\n</html>";

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}
