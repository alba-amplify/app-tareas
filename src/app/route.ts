import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile, loadPanel, savePanel } from "@/lib/panel";
import { importLegacy } from "@/lib/legacy";
import { importMeetings } from "@/panel/meetings";
import { applyOps } from "@/panel/ops";
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
  } catch {
    // Si aún no existe la tabla panel_state (falta ejecutar el SQL), se abre el tablero anterior.
    return NextResponse.redirect(`${origin}/tablero-anterior`);
  }

  // Una sola vez: volcar las tareas del tablero anterior al panel.
  if (!panel.state.legacyImport) {
    try {
      for (let i = 0; i < 3; i++) {
        const state = (await importLegacy(supabase, panel.state)).state as typeof panel.state;
        const r = await savePanel(supabase, user.id, state, panel.rev);
        if (!r.conflict) {
          panel = { state, rev: r.rev };
          break;
        }
        panel = await loadPanel(supabase);
        if (panel.state.legacyImport) break;
      }
    } catch (e) {
      // Si falla, el panel se abre igual y se reintenta la próxima vez.
      console.error("importLegacy", e);
    }
  }

  // Reuniones nuevas (src/panel/meetings.ts) con sus tareas: se añaden una sola vez.
  if (importMeetings(panel.state).added) {
    try {
      for (let i = 0; i < 3; i++) {
        const { state, added } = importMeetings(panel.state);
        if (!added) break;
        const r = await savePanel(supabase, user.id, state as typeof panel.state, panel.rev);
        if (!r.conflict) {
          panel = { state: state as typeof panel.state, rev: r.rev };
          break;
        }
        panel = await loadPanel(supabase);
      }
    } catch (e) {
      console.error("importMeetings", e);
    }
  }

  // Cambios puntuales pendientes (src/panel/ops.ts): una sola vez.
  if (applyOps(panel.state).applied.length) {
    try {
      for (let i = 0; i < 3; i++) {
        const r0 = applyOps(panel.state);
        if (!r0.applied.length) break;
        const r = await savePanel(supabase, user.id, r0.state as typeof panel.state, panel.rev);
        if (!r.conflict) {
          panel = { state: r0.state as typeof panel.state, rev: r.rev };
          break;
        }
        panel = await loadPanel(supabase);
      }
    } catch (e) {
      console.error("applyOps", e);
    }
  }

  const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");
  const html =
    '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<title>Panel de tareas · Amplify</title>\n" +
    // Idioma (es / en)
    "<style>html.i18n-pending body{visibility:hidden}</style>\n" +
    "<script>try{if(/(?:^|;\\s*)amplify_lang=en/.test(document.cookie)){document.documentElement.classList.add('i18n-pending');document.documentElement.lang='en'}}catch(e){}</script>\n" +
    '<script src="/i18n.js"></script>\n' +
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
