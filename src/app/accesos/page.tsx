import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
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
    <div className="min-h-screen">
      <Header profile={profile} />
      <Nav />
      <main className="w-full px-6 lg:px-10 py-6">
        <ResourceBoard
          board="accesos"
          resources={(resources as Resource[]) ?? []}
        />
      </main>
    </div>
  );
}
