"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createPost,
  updatePost,
  deletePost,
  type SocialInput,
} from "@/app/actions/social";
import { createClient } from "@/lib/supabase/client";
import { notifyPostMentionsSlack } from "@/app/actions/slack";
import type { SocialPost, PostComment } from "@/lib/types";

type MiniProfile = { id: string; full_name: string };

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const STATUSES = [
  "FALTA COPY",
  "FALTA CONTENIDO",
  "POR REVISAR",
  "POR CORREGIR",
  "REVISADO",
  "PROGRAMADO",
  "PUBLICADO",
  "POSPUESTO",
  "CANCELADO",
];
const STATUS_COLOR: Record<string, string> = {
  "FALTA COPY": "#B53324",
  "FALTA CONTENIDO": "#d1663a",
  "POR REVISAR": "#E5A657",
  "POR CORREGIR": "#c98a3c",
  REVISADO: "#5b8def",
  PROGRAMADO: "#7a6ff0",
  PUBLICADO: "#5f8a5f",
  POSPUESTO: "#8a94a6",
  CANCELADO: "#9b9b9b",
};
function statusColor(s: string | null) {
  return (s && STATUS_COLOR[s]) || "#8a94a6";
}

// Pilares de contenido (agrupados)
const CATEGORY_GROUPS = [
  { group: "Atracción", options: ["Mentalidad", "Lead Magnet", "Lifestyle"] },
  { group: "Nutrición", options: ["Autoridad", "Prueba Social"] },
  { group: "Conversión", options: ["Conversión"] },
  { group: "Stories (Alessio)", options: ["Conexión", "Nicho", "Venta"] },
];
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.options);
const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

// Plantilla de lead magnet (se rellena en "Contenido en bruto")
const CANVA_TEMPLATE =
  "https://www.canva.com/design/DAHR_MdNMyY/FTO1BytoRrm0SGNVtuvhAw/edit";

// Formato del contenido (visible desde fuera)
const FORMATS = ["Reel", "Carrusel", "Post", "Story"];
const FORMAT_EMOJI: Record<string, string> = {
  Reel: "🎬",
  Carrusel: "🎠",
  Post: "🖼️",
  Story: "📱",
};
function formatOf(p: SocialPost) {
  return p.format || (p.kind === "story" ? "Story" : "Post");
}
function chipLabel(p: SocialPost) {
  const f = formatOf(p);
  const rest = p.category || (p.copy ? p.copy.split("\n")[0] : "");
  return `${FORMAT_EMOJI[f] ?? ""} ${f}${rest ? " · " + rest : ""}`;
}

export default function SocialCalendar({
  posts,
  openPostId,
  currentUserId,
  profiles,
}: {
  posts: SocialPost[];
  openPostId?: string;
  currentUserId: string;
  profiles: MiniProfile[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creatingKind, setCreatingKind] = useState<"publicacion" | "story">(
    "publicacion",
  );
  const [mode, setMode] = useState<"calendario" | "kanban">("calendario");
  const [kanbanGroup, setKanbanGroup] = useState<"estado" | "dias">("estado");

  const byStatus = useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    for (const s of STATUSES) map.set(s, []);
    for (const p of posts) {
      const st = p.status || "FALTA COPY";
      if (!map.has(st)) map.set(st, []);
      map.get(st)!.push(p);
    }
    return map;
  }, [posts]);

  const byDate = useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    for (const p of posts) {
      if (!p.publish_date) continue;
      const arr = map.get(p.publish_date) ?? [];
      arr.push(p);
      map.set(p.publish_date, arr);
    }
    return map;
  }, [posts]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Lun=0

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  function openNew(
    dateStr: string | null,
    kind: "publicacion" | "story" = "publicacion",
  ) {
    setEditing(null);
    setCreatingDate(dateStr);
    setCreatingKind(kind);
    setModalOpen(true);
  }
  function openEdit(p: SocialPost) {
    setEditing(p);
    setCreatingDate(null);
    setModalOpen(true);
  }

  // Abrir automáticamente la publicación que venga en la URL (?post=...)
  useEffect(() => {
    if (openPostId) {
      const p = posts.find((x) => x.id === openPostId);
      if (p) openEdit(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPostId, posts]);

  const todayKey = dateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">
            Calendario RRSS
          </h1>
          <p className="text-ink/50 text-sm mt-1">
            Planificación mensual del contenido de redes sociales.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-full border border-black/[0.07] bg-white p-1 shadow-soft mr-1">
            <button
              onClick={() => setMode("calendario")}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                mode === "calendario"
                  ? "bg-paprika text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setMode("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                mode === "kanban"
                  ? "bg-paprika text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Kanban
            </button>
          </div>
          <button
            onClick={() => openNew(dateKey(year, month, 1), "publicacion")}
            className="bg-paprika hover:bg-paprika-dark text-white font-semibold px-4 py-2 rounded-full text-sm shadow-soft whitespace-nowrap"
          >
            + Publicación
          </button>
          <button
            onClick={() => openNew(dateKey(year, month, 1), "story")}
            className="bg-ink hover:bg-ink/80 text-white font-semibold px-4 py-2 rounded-full text-sm shadow-soft whitespace-nowrap"
          >
            + Story
          </button>
        </div>
      </div>

      {mode === "calendario" && (
      <>
      {/* Navegación de mes */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink"
        >
          ‹
        </button>
        <h2 className="text-lg font-bold text-ink tracking-tight min-w-[180px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink"
        >
          ›
        </button>
        <button
          onClick={goToday}
          className="text-sm px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
        >
          Hoy
        </button>
      </div>

      {/* Rejilla del calendario */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-xs font-semibold text-ink/50 text-center"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, i) => {
              if (d === null)
                return <div key={i} className="min-h-28 rounded-xl" />;
              const key = dateKey(year, month, d);
              const dayPosts = byDate.get(key) ?? [];
              const isToday = key === todayKey;
              return (
                <div
                  key={i}
                  className={`min-h-28 rounded-xl border p-1.5 bg-white ${
                    isToday ? "border-paprika" : "border-black/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "text-paprika" : "text-ink/50"
                      }`}
                    >
                      {d}
                    </span>
                    <button
                      onClick={() => openNew(key)}
                      className="text-ink/30 hover:text-paprika text-sm leading-none"
                      aria-label="Añadir publicación"
                    >
                      ＋
                    </button>
                  </div>
                  <div className="space-y-1">
                    {dayPosts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => openEdit(p)}
                        className="w-full text-left rounded-md px-1.5 py-1 text-[11px] leading-tight text-white truncate"
                        style={{ backgroundColor: statusColor(p.status) }}
                        title={p.copy ?? p.category ?? ""}
                      >
                        {chipLabel(p)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}

      {mode === "kanban" && (
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex rounded-full border border-black/[0.07] bg-white p-1 shadow-soft">
            <button
              onClick={() => setKanbanGroup("estado")}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                kanbanGroup === "estado"
                  ? "bg-ink text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Por estado
            </button>
            <button
              onClick={() => setKanbanGroup("dias")}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                kanbanGroup === "dias"
                  ? "bg-ink text-white"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Por días
            </button>
          </div>
          {kanbanGroup === "dias" && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-ink min-w-[150px] text-center">
                {MONTHS[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink"
              >
                ›
              </button>
              <button
                onClick={goToday}
                className="text-sm px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
              >
                Hoy
              </button>
            </div>
          )}
        </div>

        {kanbanGroup === "dias" ? (
          <div className="grid items-start gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {WEEKDAYS.map((wd, wi) => {
              const daysForWd: number[] = [];
              for (let d = 1; d <= daysInMonth; d++) {
                if ((new Date(year, month, d).getDay() + 6) % 7 === wi)
                  daysForWd.push(d);
              }
              const hasAny = daysForWd.some(
                (d) => (byDate.get(dateKey(year, month, d)) ?? []).length > 0,
              );
              return (
                <div key={wi} className="min-w-0">
                  <div className="text-sm font-semibold text-ink tracking-tight mb-2 px-1">
                    {wd}
                  </div>
                  <div className="space-y-2">
                    {daysForWd.map((d) => {
                      const dayPosts = byDate.get(dateKey(year, month, d)) ?? [];
                      if (dayPosts.length === 0) return null;
                      return (
                        <div
                          key={d}
                          className="bg-white rounded-xl border border-black/[0.06] p-3"
                        >
                          <div className="text-sm font-semibold text-ink/60 mb-1.5">
                            {pad(d)}/{pad(month + 1)}
                          </div>
                          <div className="space-y-1">
                            {dayPosts.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => openEdit(p)}
                                className="w-full text-left rounded-md px-1.5 py-1 text-[11px] leading-tight text-white truncate"
                                style={{ backgroundColor: statusColor(p.status) }}
                                title={p.copy ?? p.category ?? ""}
                              >
                                {chipLabel(p)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {!hasAny && (
                      <p className="text-xs text-ink/30 px-1">Sin contenido</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
        <div className="grid items-start gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {STATUSES.map((st) => {
            const items = byStatus.get(st) ?? [];
            return (
              <div key={st} className="min-w-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor(st) }}
                  />
                  <span className="text-sm font-semibold text-ink tracking-tight">
                    {st}
                  </span>
                  <span className="text-xs text-ink/40 font-medium bg-black/[0.04] px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[40px]">
                  {items.length === 0 && (
                    <p className="text-xs text-ink/30 px-1">—</p>
                  )}
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => openEdit(p)}
                      className="w-full text-left bg-white rounded-2xl border border-black/[0.06] p-4 shadow-soft hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink text-white">
                          {FORMAT_EMOJI[formatOf(p)] ?? ""} {formatOf(p)}
                        </span>
                        {p.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.05] text-ink/60">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-ink leading-snug break-words">
                        {p.copy?.split("\n")[0] || p.content || "Publicación"}
                      </p>
                      <p className="text-xs text-ink/40 mt-1">
                        {p.publish_date
                          ? p.publish_date.split("-").reverse().join("/")
                          : "sin fecha"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
      )}

      {modalOpen && (
        <PostModal
          post={editing}
          defaultDate={creatingDate}
          defaultKind={creatingKind}
          currentUserId={currentUserId}
          profiles={profiles}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function PostModal({
  post,
  defaultDate,
  defaultKind,
  currentUserId,
  profiles,
  onClose,
}: {
  post: SocialPost | null;
  defaultDate: string | null;
  defaultKind: "publicacion" | "story";
  currentUserId: string;
  profiles: MiniProfile[];
  onClose: () => void;
}) {
  const isEdit = !!post;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);
  function close() {
    setShow(false);
    setTimeout(onClose, 300);
  }
  const [form, setForm] = useState<SocialInput>({
    publish_date: post?.publish_date ?? defaultDate ?? "",
    category: post?.category ?? "",
    objective: post?.objective ?? "",
    product: post?.product ?? "",
    status: post?.status ?? "FALTA COPY",
    link: post?.link ?? "",
    content: post?.content ?? "",
    copy: post?.copy ?? "",
    script: post?.script ?? "",
    content_raw: post?.content_raw ?? "",
    content_edited: post?.content_edited ?? "",
    newsletter: post?.newsletter ?? "",
    kind: post?.kind ?? defaultKind,
    format:
      post?.format ??
      (post?.kind === "story" || defaultKind === "story" ? "Story" : "Reel"),
    inspiration: post?.inspiration ?? "",
  });

  function set<K extends keyof SocialInput>(k: K, v: SocialInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // ---- Comentarios (con menciones) ----
  const supabase = createClient();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [cbody, setCbody] = useState("");
  const [csending, setCsending] = useState(false);
  const [cmention, setCmention] = useState<{ query: string } | null>(null);
  const [cactive, setCactive] = useState(0);

  const csug = cmention
    ? profiles
        .filter((p) => p.full_name.toLowerCase().startsWith(cmention.query))
        .slice(0, 5)
    : [];

  async function loadComments() {
    if (!post) return;
    const { data } = await supabase
      .from("post_comments")
      .select(
        "id, post_id, body, created_at, author_id, author:author_id (id, full_name)",
      )
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments((data as unknown as PostComment[]) ?? []);
  }
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onCbodyChange(v: string) {
    setCbody(v);
    const m = v.match(/@(\p{L}*)$/u);
    setCmention(m ? { query: m[1].toLowerCase() } : null);
    setCactive(0);
  }
  function pickCmention(name: string) {
    setCbody((b) => b.replace(/@(\p{L}*)$/u, `@${name} `));
    setCmention(null);
  }
  function mentionIds(text: string) {
    const found = new Set<string>();
    const re = /@(\p{L}+)/gu;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const p = profiles.find(
        (x) => x.full_name.toLowerCase() === m![1].toLowerCase(),
      );
      if (p) found.add(p.id);
    }
    return [...found];
  }
  function renderC(text: string) {
    return text.split(/(@\p{L}+|https?:\/\/[^\s]+)/giu).map((part, i) => {
      if (/^@\p{L}+$/u.test(part))
        return (
          <span key={i} className="text-paprika font-semibold">
            {part}
          </span>
        );
      if (/^https?:\/\//i.test(part))
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-paprika underline break-all"
          >
            {part}
          </a>
        );
      return <span key={i}>{part}</span>;
    });
  }
  async function sendComment() {
    const text = cbody.trim();
    if (!text || !post) return;
    setCsending(true);
    const { data: created } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, author_id: currentUserId, body: text })
      .select("id")
      .single();
    const ids = mentionIds(text);
    if (created && ids.length) {
      await supabase.from("notifications").insert(
        ids.map((rid) => ({
          recipient_id: rid,
          actor_id: currentUserId,
          post_id: post.id,
          type: "mention",
        })),
      );
      const postTitle =
        post.copy?.split("\n")[0] || post.category || "una publicación";
      notifyPostMentionsSlack(postTitle, ids).catch(() => {});
    }
    setCbody("");
    setCmention(null);
    await loadComments();
    setCsending(false);
  }
  function onCKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (csug.length > 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        pickCmention(csug[cactive].full_name);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCactive((i) => Math.min(i + 1, csug.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCactive((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Escape") {
        setCmention(null);
        return;
      }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendComment();
    }
  }
  function whenC(iso: string) {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updatePost(post!.id, form)
        : await createPost(form);
      if (res?.error) {
        setError(res.error);
        return;
      }
      close();
    });
  }

  function remove() {
    if (!post || !confirm("¿Borrar esta publicación?")) return;
    startTransition(async () => {
      await deletePost(post.id);
      close();
    });
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15";
  const label = "block text-xs font-semibold text-ink/50 mb-1";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <h2 className="text-xl font-bold text-ink tracking-tight">
            {isEdit ? "Editar publicación" : "Nueva publicación"}
          </h2>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/rrss?post=${post!.id}`,
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70 whitespace-nowrap"
              >
                {copied ? "✓ Copiado" : "🔗 Enlace"}
              </button>
            )}
            <button
              onClick={close}
              className="text-ink/40 hover:text-ink text-xl leading-none w-8 h-8 rounded-full hover:bg-black/[0.04]"
            >
              ✕
            </button>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
        >
          <div>
            <label className={label}>Formato</label>
            <select
              className={field}
              value={form.format}
              onChange={(e) => set("format", e.target.value)}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_EMOJI[f]} {f}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Fecha de publicación</label>
              <input
                type="date"
                className={field}
                value={form.publish_date}
                onChange={(e) => set("publish_date", e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Estado</label>
              <select
                className={field}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Pilar de contenido</label>
              <select
                className={field}
                value={form.category}
                onChange={(e) => {
                  const v = e.target.value;
                  set("category", v);
                  if (v === "Lead Magnet" && !form.content_raw)
                    set("content_raw", CANVA_TEMPLATE);
                }}
              >
                <option value="">— Pilar —</option>
                {form.category && !ALL_CATEGORIES.includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
                {CATEGORY_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Producto / Servicio</label>
              <input
                className={field}
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={label}>Objetivo</label>
            <input
              className={field}
              value={form.objective}
              onChange={(e) => set("objective", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Contenido</label>
            <textarea
              className={field}
              rows={2}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Copy</label>
            <textarea
              className={field}
              rows={3}
              value={form.copy}
              onChange={(e) => set("copy", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Newsletter (versión email del contenido)</label>
            <textarea
              className={field}
              rows={3}
              value={form.newsletter}
              onChange={(e) => set("newsletter", e.target.value)}
              placeholder="Adaptación del contenido para enviar por email"
            />
          </div>
          <div>
            <label className={label}>Guion (para grabar Alessio)</label>
            <textarea
              className={field}
              rows={4}
              value={form.script}
              onChange={(e) => set("script", e.target.value)}
              placeholder="Gancho (0-3s) · Desarrollo · CTA"
            />
          </div>
          <div>
            <label className={label}>Contenido en bruto</label>
            <textarea
              className={field}
              rows={2}
              value={form.content_raw}
              onChange={(e) => set("content_raw", e.target.value)}
              placeholder="Enlace o notas del material grabado sin editar"
            />
          </div>
          <div>
            <label className={label}>Contenido editado</label>
            <textarea
              className={field}
              rows={2}
              value={form.content_edited}
              onChange={(e) => set("content_edited", e.target.value)}
              placeholder="Enlace al contenido final editado"
            />
          </div>
          <div>
            <label className={label}>Inspiración (links)</label>
            <textarea
              className={field}
              rows={2}
              value={form.inspiration}
              onChange={(e) => set("inspiration", e.target.value)}
              placeholder="Pega aquí links de referencia / inspiración"
            />
          </div>
          <div>
            <label className={label}>Enlace</label>
            <input
              className={field}
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://…"
            />
          </div>

          {error && <p className="text-sm text-paprika font-medium">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="text-sm text-paprika/80 hover:text-paprika px-3 py-2 rounded-full hover:bg-paprika/10"
              >
                Borrar
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="px-5 py-2 rounded-full border border-black/10 text-ink/70 hover:bg-black/[0.04]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-5 py-2 rounded-full bg-paprika hover:bg-paprika-dark text-white font-semibold disabled:opacity-60"
              >
                {pending ? "Guardando…" : isEdit ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
          {isEdit && (
            <div className="pt-4 mt-2 border-t border-black/[0.06]">
              <h3 className="font-semibold text-ink text-sm mb-3">
                Comentarios{" "}
                <span className="text-ink/40 font-normal">
                  ({comments.length})
                </span>
              </h3>
              <div className="space-y-2.5 mb-3">
                {comments.length === 0 && (
                  <p className="text-sm text-ink/40">
                    Todavía no hay comentarios
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="bg-black/[0.03] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">
                        {c.author?.full_name ?? "Usuario"}
                      </span>
                      <span className="text-xs text-ink/40">
                        {whenC(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-ink/80 mt-1 whitespace-pre-wrap break-words">
                      {renderC(c.body)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative">
                {csug.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-black/10 shadow-card overflow-hidden z-10">
                    {csug.map((p, i) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickCmention(p.full_name)}
                        onMouseEnter={() => setCactive(i)}
                        className={`w-full text-left px-3 py-2 text-sm ${
                          i === cactive
                            ? "bg-black/[0.05]"
                            : "hover:bg-black/[0.04]"
                        }`}
                      >
                        <span className="font-semibold text-paprika">
                          @{p.full_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    value={cbody}
                    onChange={(e) => onCbodyChange(e.target.value)}
                    onKeyDown={onCKeyDown}
                    rows={1}
                    placeholder="Comentario…  (@ para mencionar · Cmd/Ctrl+Enter enviar)"
                    className="flex-1 resize-none rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-2 text-ink text-sm outline-none focus:border-paprika max-h-32"
                  />
                  <button
                    type="button"
                    onClick={sendComment}
                    disabled={csending || !cbody.trim()}
                    className="bg-paprika hover:bg-paprika-dark text-white font-semibold px-5 py-2 rounded-full text-sm disabled:opacity-60"
                  >
                    {csending ? "…" : "Enviar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </aside>
    </div>
  );
}
