"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import NotificationBell from "./NotificationBell";

// Iconos de trazo (estilo lineal, 1.7px) para la navegación.
const ICONS: Record<string, React.ReactNode> = {
  tareas: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  contenido: (
    <>
      <path d="M14 3H7a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9z" />
      <path d="M14 3v6h6M8.5 13h7M8.5 17h5" />
    </>
  ),
  accesos: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.2-8.2M16 7l3 3M14 9l2 2" />
    </>
  ),
  updates: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  rrss: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  salir: (
    <>
      <path d="M15 4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2" />
      <path d="M10 16l-4-4 4-4M6 12h9" />
    </>
  ),
};

export const NAV_ITEMS = [
  { href: "/", label: "Tareas", icon: "tareas" },
  { href: "/contenido", label: "Contenido", icon: "contenido" },
  { href: "/accesos", label: "Accesos", icon: "accesos" },
  { href: "/updates", label: "Updates", icon: "updates" },
  { href: "/rrss", label: "RRSS", icon: "rrss" },
];

function Icon({ name, className = "w-[18px] h-[18px]" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} flex-none`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Header({ profile }: { profile: Profile }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const current =
    pathname === "/cuenta"
      ? "Mi cuenta"
      : (NAV_ITEMS.find((t) => t.href === pathname)?.label ?? "Tareas");

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ---------- Barra lateral (escritorio) ---------- */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[var(--sidebar-w)] flex-col gap-5 bg-cacao text-[#F9F6F0] px-3.5 py-5">
        <Link href="/" className="flex items-baseline gap-2 px-2.5 pt-1">
          <span className="font-display font-semibold text-[23px] leading-none tracking-[-0.035em] text-sun">
            amplify
          </span>
          <span className="text-[13px] font-medium text-[#F9F6F0]/60">
            Tareas
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          <span className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F9F6F0]/40">
            Equipo
          </span>
          {NAV_ITEMS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sun text-cacao font-medium"
                    : "text-[#F9F6F0]/65 hover:bg-cacao-hover hover:text-[#F9F6F0]"
                }`}
              >
                <Icon name={t.icon} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/cuenta"
            title="Mi cuenta"
            className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors ${
              pathname === "/cuenta"
                ? "bg-sun text-cacao"
                : "bg-cacao-hover hover:bg-cacao-raise"
            }`}
          >
            <span className="grid place-items-center w-8 h-8 rounded-full bg-sun text-cacao text-xs font-semibold flex-none">
              {initials(profile.full_name)}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="flex items-center gap-1.5 text-sm font-medium truncate">
                {profile.full_name}
                {profile.is_admin && (
                  <span className="text-[10px] font-semibold px-1.5 py-px rounded-md bg-sun/20 text-sun">
                    admin
                  </span>
                )}
              </span>
              <span className="block text-[11.5px] opacity-70 truncate">
                {profile.role}
              </span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#F9F6F0]/60 hover:bg-cacao-hover hover:text-[#F9F6F0] transition-colors"
          >
            <Icon name="salir" />
            Salir
          </button>
        </div>
      </aside>

      {/* ---------- Barra superior ---------- */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-biscuit">
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-3">
          {/* Marca (solo móvil) */}
          <Link
            href="/"
            className="lg:hidden font-display font-semibold text-xl leading-none tracking-[-0.035em] bg-cacao text-sun px-2.5 py-1.5 rounded-lg"
          >
            amplify
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 text-[13px] text-muted min-w-0">
            <span>Amplify</span>
            <span className="text-faint">/</span>
            <b className="font-medium text-ink truncate">{current}</b>
          </div>

          <div className="flex-1" />

          <NotificationBell />

          {/* Cuenta y salir (solo móvil) */}
          <Link
            href="/cuenta"
            title="Mi cuenta"
            className="lg:hidden grid place-items-center w-9 h-9 rounded-full bg-sun text-cacao text-xs font-semibold"
          >
            {initials(profile.full_name)}
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Salir"
            className="lg:hidden grid place-items-center w-9 h-9 rounded-xl border border-biscuit bg-white text-muted"
          >
            <Icon name="salir" className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación en móvil */}
        <nav className="lg:hidden flex gap-1.5 overflow-x-auto px-4 sm:px-6 pb-3">
          {NAV_ITEMS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] border transition-colors ${
                  active
                    ? "bg-cacao text-[#F9F6F0] border-transparent"
                    : "bg-white text-muted border-biscuit"
                }`}
              >
                <Icon name={t.icon} className="w-4 h-4" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
