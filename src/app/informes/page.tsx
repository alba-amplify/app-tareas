import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Informes from "@/components/Informes";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

// Informes de funnels (Meta Ads + GoHighLevel). Dentro del panel se muestra sin cabecera.
export default async function InformesPage() {
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

  return (
    <div className="min-h-screen">
      <Header profile={profile} />
      <Nav />
      <main className="w-full">
        <Informes />
      </main>
    </div>
  );
}
