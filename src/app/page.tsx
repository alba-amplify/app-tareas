import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Board from "@/components/Board";
import type { Profile, TaskWithAssignee } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>;
}) {
  const { task: openTaskId } = await searchParams;
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

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-ink">
          Tu usuario existe pero no tiene perfil. Avisa al admin.
        </p>
      </main>
    );
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "*, assignee:assignee_id (id, full_name, role)",
    )
    .order("due_date", { ascending: true, nullsFirst: false });

  // Solo personas activas (los usuarios ocultos no aparecen en las listas).
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  const profiles = (allProfiles ?? [])
    .filter((p) => p.active !== false)
    .map(({ id, full_name, role, department }) => ({
      id,
      full_name,
      role,
      department,
    }));

  return (
    <div className="app-shell min-h-screen">
      <Header profile={profile} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
        <div className="mb-6">
          <h1 className="font-display text-[28px] leading-tight font-medium text-ink">
            Tablero de tareas
          </h1>
          <p className="text-muted text-sm mt-1">
            Las tareas se colocan solas según su fecha límite.
          </p>
        </div>
        <Board
          tasks={(tasks as TaskWithAssignee[]) ?? []}
          profiles={profiles ?? []}
          currentUserId={user.id}
          isAdmin={profile.is_admin || profile.can_manage_tasks}
          openTaskId={openTaskId}
        />
      </main>
    </div>
  );
}
