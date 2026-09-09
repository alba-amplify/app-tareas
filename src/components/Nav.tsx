"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Tareas" },
  { href: "/contenido", label: "Contenido" },
  { href: "/accesos", label: "Accesos" },
  { href: "/updates", label: "Updates" },
  { href: "/rrss", label: "RRSS" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="w-full px-6 lg:px-10 pt-5">
      <div className="inline-flex rounded-full border border-black/[0.07] bg-white p-1 shadow-soft">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                active ? "bg-paprika text-white" : "text-ink/60 hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
