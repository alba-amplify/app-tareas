"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Tareas" },
  { href: "/tablero-anterior", label: "Tablero anterior" },
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
          const cls = `px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
            active ? "bg-paprika text-white" : "text-ink/60 hover:text-ink"
          }`;
          // "/" es el panel de tareas (HTML servido por un route handler):
          // se abre con navegación completa, no con el router de Next.
          if (t.href === "/") {
            return (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a key={t.href} href="/" className={cls}>
                {t.label}
              </a>
            );
          }
          return (
            <Link key={t.href} href={t.href} className={cls}>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
