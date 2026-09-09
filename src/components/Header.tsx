"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import NotificationBell from "./NotificationBell";

export default function Header({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-black/[0.06]">
      <div className="w-full px-6 lg:px-10 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-paprika text-white font-extrabold px-3 py-1 rounded-full text-sm tracking-tight">
            Amplify
          </span>
          <span className="font-medium text-ink/70 hidden sm:inline text-sm">
            Tareas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/cuenta"
            className="text-right leading-tight hover:opacity-70 transition-opacity"
            title="Mi cuenta"
          >
            <p className="text-sm font-semibold text-ink flex items-center gap-2 justify-end">
              {profile.full_name}
              {profile.is_admin && (
                <span className="text-[10px] font-bold bg-paprika/10 text-paprika px-2 py-0.5 rounded-full">
                  admin
                </span>
              )}
            </p>
            <p className="text-xs text-ink/50">{profile.role}</p>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm border border-black/10 hover:bg-black/[0.04] text-ink/70 px-4 py-1.5 rounded-full transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
