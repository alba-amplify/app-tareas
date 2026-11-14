import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
