import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
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
      <main className="w-full px-6 lg:px-10 py-6">
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-1">
          Mi cuenta
        </h1>
        <p className="text-ink/50 text-sm mb-6">
          {profile.full_name} · {profile.role} · {user.email}
        </p>
        <ChangePasswordForm />
      </main>
    </div>
  );
}
