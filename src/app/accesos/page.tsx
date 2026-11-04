import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ResourceBoard from "@/components/ResourceBoard";
import type { Profile, Resource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccesosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login");

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("board", "accesos")
    .order("created_at", { ascending: true });

  return (
    <div className="app-shell min-h-screen">
      <Header profile={profile} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
        <ResourceBoard
          board="accesos"
          resources={(resources as Resource[]) ?? []}
        />
      </main>
    </div>
  );
}
