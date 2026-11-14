import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Cierra la sesión y vuelve al login (con el aviso de error si lo hay).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();
  const error = searchParams.get("error");
  return NextResponse.redirect(`${origin}/login${error ? `?error=${encodeURIComponent(error)}` : ""}`);
}
