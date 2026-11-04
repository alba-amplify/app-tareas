"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  async function openNotification(n: Notification) {
    await markRead(n);
    setOpen(false);
    if (n.post_id) router.push(`/rrss?post=${n.post_id}`);
    else if (n.task_id) router.push(`/?task=${n.task_id}`);
  }

  async function load() {
    const { data } = await supabase
      .from("notifications")
      .select(
        "id, read, created_at, type, task_id, post_id, actor:actor_id (full_name), task:task_id (title), post:post_id (category, copy)",
      )
      .order("created_at", { ascending: false })
      .limit(30);
    setItems((data as unknown as Notification[]) ?? []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // refresca cada 30s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function markRead(n: Notification) {
    if (n.read) return;
    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
  }

  async function markAll() {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-[38px] h-[38px] rounded-xl border border-biscuit bg-white hover:border-faint grid place-items-center text-ink"
        aria-label="Notificaciones"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" />
          <path d="M10 20a2.2 2.2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-sun text-cacao text-[10.5px] font-semibold min-w-[18px] h-[18px] px-1 rounded-full ring-2 ring-cream flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed sm:absolute top-16 sm:top-auto left-3 right-3 sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white rounded-2xl border border-biscuit shadow-card z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
              <span className="font-semibold text-ink text-sm">
                Notificaciones
              </span>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="text-xs text-paprika hover:underline"
                >
                  Marcar todas
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 && (
                <p className="text-sm text-ink/40 px-4 py-6 text-center">
                  No tienes notificaciones
                </p>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`w-full text-left px-4 py-3 border-b border-black/[0.04] hover:bg-black/[0.02] ${
                    !n.read ? "bg-paprika-soft/60" : ""
                  }`}
                >
                  <p className="text-sm text-ink">
                    {!n.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-paprika mr-1.5 align-middle" />
                    )}
                    <b>{n.actor?.full_name ?? "Alguien"}</b>{" "}
                    {n.type === "assignment"
                      ? "te asignó la tarea"
                      : "te mencionó en"}{" "}
                    <b>
                      «
                      {n.post
                        ? n.post.copy?.split("\n")[0] ??
                          n.post.category ??
                          "una publicación"
                        : (n.task?.title ?? "una tarea")}
                      »
                    </b>
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {formatWhen(n.created_at)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
