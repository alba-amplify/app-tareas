import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  return (
    <div className="min-h-screen">
      <Header profile={profile} />
      <Nav />
      <main className="w-full px-6 lg:px-10 py-6">
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
