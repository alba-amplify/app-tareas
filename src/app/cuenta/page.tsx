import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
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
    <div className="app-shell min-h-screen">
      <Header profile={profile} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
        <h1 className="font-display text-[28px] leading-tight font-medium text-ink mb-1">
          Mi cuenta
        </h1>
        <p className="text-muted text-sm mt-1 mb-6">
          {profile.full_name} · {profile.role} · {user.email}
        </p>
        <ChangePasswordForm />
      </main>
    </div>
  );
}
