import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Direcciones del panel de tareas: todas las sirve el panel ("/"), que coloca la vista
// según la dirección. Contenido, Accesos, RRSS, Updates e Informes son también páginas
// propias: con ?embed=1 (dentro del panel) se sirven ellas mismas.
const PANEL_PATHS = /^\/(tablero|lista|recursos|tareas?\/[^/]+|proyectos(\/[^/]+)?|reuniones(\/[^/]+)?)\/?$/;
const EMBEDDABLE = /^\/(informes|contenido|accesos|rrss|updates)\/?$/;
export function isPanelPath(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PANEL_PATHS.test(path)) return true;
  return EMBEDDABLE.test(path) && request.nextUrl.searchParams.get("embed") !== "1";
}

// Refresca la sesión y protege las rutas.
// Sin sesión -> redirige a /login (excepto la propia /login).
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login");
  // /auth/callback (vuelta de Google) y /auth/signout funcionan sin sesión.
  const isAuthFlow = path.startsWith("/auth/");
  if (isAuthFlow) return supabaseResponse;

  if (!user && !isAuthRoute) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "no-auth" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Tras entrar, volver al enlace que se abrió (p. ej. /tareas/AMP-73)
    url.search = path !== "/" ? `?next=${encodeURIComponent(path + request.nextUrl.search)}` : "";
    return NextResponse.redirect(url);
  }

  // Solo entra quien tiene perfil activo en la app (Google deja entrar a cualquier cuenta).
  if (user && !isAuthRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.active === false) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signout";
      url.search = "?error=sin-acceso";
      return NextResponse.redirect(url);
    }
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next") || "";
    url.pathname = /^\/[^/\\]/.test(next) ? next.split("?")[0] : "/";
    url.search = /^\/[^/\\]/.test(next) && next.includes("?") ? next.slice(next.indexOf("?")) : "";
    return NextResponse.redirect(url);
  }

  // Cada sección y cada tarea tiene su dirección: se sirve el panel, que abre esa vista.
  if (user && isPanelPath(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.rewrite(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }

  return supabaseResponse;
}
