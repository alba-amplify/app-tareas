import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import SocialCalendar from "@/components/SocialCalendar";
import type { Profile, SocialPost } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RRSSPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { post: openPostId } = await searchParams;
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

  const { data: posts } = await supabase
    .from("social_posts")
    .select("*")
    .order("publish_date", { ascending: true });

  // Solo personas activas (los usuarios ocultos no aparecen en las listas).
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");
  const profiles = (allProfiles ?? [])
    .filter((p) => p.active !== false)
    .map(({ id, full_name }) => ({ id, full_name }));

  return (
    <div className="app-shell min-h-screen">
      <Header profile={profile} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
        <SocialCalendar
          posts={(posts as SocialPost[]) ?? []}
          openPostId={openPostId}
          currentUserId={user.id}
          profiles={profiles ?? []}
        />
      </main>
    </div>
  );
}
