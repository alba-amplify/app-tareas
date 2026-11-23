import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfile } from "@/lib/panel";

export const dynamic = "force-dynamic";

// Vuelta del login con Google: crea la sesión y comprueba que la persona es del equipo.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=google`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=google`);

  const profile = await getActiveProfile(supabase, data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=sin-acceso`);
  }
  return NextResponse.redirect(`${origin}/`);
}
