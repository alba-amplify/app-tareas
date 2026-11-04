"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_COLUMNS, statusForTask } from "@/lib/status";
import {
  updateTask,
  deleteTask,
  moveTask,
  type TaskInput,
} from "@/app/actions/tasks";
import { notifyMentionsSlack } from "@/app/actions/slack";
import type { Comment, Priority, Profile, Task, TaskWithAssignee } from "@/lib/types";
import { departmentOptions } from "@/lib/departments";

const EMOJIS = ["👍", "❤️", "😂", "🎉", "🙌", "👀", "🔥", "✅"];

// Convierte emoticonos de texto en emojis mientras se escribe
const EMOTICONS: [RegExp, string][] = [
  [/<3/g, "❤️"],
  [/:-?\)/g, "🙂"],
  [/:-?D/g, "😄"],
  [/:-?\(/g, "🙁"],
  [/;-?\)/g, "😉"],
  [/:-?[pP]/g, "😛"],
  [/:-?[oO]/g, "😮"],
];
function applyEmoticons(t: string): string {
  let r = t;
  for (const [re, e] of EMOTICONS) r = r.replace(re, e);
  return r;
}

type Props = {
  task: TaskWithAssignee;
  profiles: Pick<Profile, "id" | "full_name" | "role" | "department">[];
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaskDrawer({
  task,
  profiles,
  currentUserId,
  isAdmin,
  onClose,
}: Props) {
  const supabase = createClient();
  const [show, setShow] = useState(false);
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estado del formulario (editable por el admin)
  const [form, setForm] = useState<TaskInput>({
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    due_date: task.due_date ?? "",
    assignee_id: task.assignee_id ?? "",
    department: task.department ?? "",
    next_action: task.next_action ?? "",
  });

  // Comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [mention, setMention] = useState<{ query: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reactions, setReactions] = useState<
    { comment_id: string; user_id: string; emoji: string }[]
  >([]);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [inputPicker, setInputPicker] = useState(false);
  const [statusSel, setStatusSel] = useState<string>(statusForTask(task));

  function reactionsFor(commentId: string) {
    const map = new Map<string, { count: number; mine: boolean }>();
    for (const r of reactions) {
      if (r.comment_id !== commentId) continue;
      const e = map.get(r.emoji) ?? { count: 0, mine: false };
      e.count++;
      if (r.user_id === currentUserId) e.mine = true;
      map.set(r.emoji, e);
    }
    return [...map.entries()];
  }

  async function toggleReaction(commentId: string, emoji: string) {
    setPickerFor(null);
    const mine = reactions.some(
      (r) =>
        r.comment_id === commentId &&
        r.emoji === emoji &&
        r.user_id === currentUserId,
    );
    if (mine) {
      await supabase
        .from("comment_reactions")
        .delete()
        .match({ comment_id: commentId, user_id: currentUserId, emoji });
    } else {
      await supabase
        .from("comment_reactions")
        .insert({ comment_id: commentId, user_id: currentUserId, emoji });
    }
    await loadComments();
  }

  function changeStatus(key: string) {
    setStatusSel(key);
    startSave(() => moveTask(task.id, key).then(() => {}));
  }

  const suggestions = mention
    ? profiles
        .filter((p) => p.full_name.toLowerCase().startsWith(mention.query))
        .slice(0, 5)
    : [];

  function onBodyChange(v: string) {
    const withEmojis = applyEmoticons(v);
    setBody(withEmojis);
    const m = withEmojis.match(/@(\p{L}*)$/u);
    setMention(m ? { query: m[1].toLowerCase() } : null);
    setActiveIndex(0);
  }

  function onCommentKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length > 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        pickMention(suggestions[activeIndex].full_name);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Escape") {
        setMention(null);
        return;
      }
    }
    // Enter = salto de línea; Cmd/Ctrl+Enter = enviar
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendComment();
    }
  }

  function pickMention(name: string) {
    setBody((b) => b.replace(/@(\p{L}*)$/u, `@${name} `));
    setMention(null);
  }

  function parseMentions(text: string): string[] {
    const found = new Set<string>();
    const re = /@(\p{L}+)/gu;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const name = m[1].toLowerCase();
      const p = profiles.find((x) => x.full_name.toLowerCase() === name);
      if (p) found.add(p.id);
    }
    return [...found];
  }

  function renderBody(text: string) {
    // Divide por negritas (**...**), menciones (@Nombre) y enlaces
    const parts = text.split(
      /(\*\*[^*]+\*\*|@\p{L}+|https?:\/\/[^\s]+|www\.[^\s]+)/giu,
    );
    return parts.map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return (
          <strong key={i} className="font-bold text-ink">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^@\p{L}+$/u.test(part)) {
        return (
          <span key={i} className="text-paprika font-semibold">
            {part}
          </span>
        );
      }
      if (/^(https?:\/\/|www\.)/i.test(part)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-paprika underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  // Animación de entrada
  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function close() {
    setShow(false);
    setTimeout(onClose, 300);
  }

  function set<K extends keyof TaskInput>(k: K, v: TaskInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  // Al elegir responsable, se auto-asigna su departamento
  function onAssignee(id: string) {
    setForm((f) => {
      const p = profiles.find((x) => x.id === id);
      return { ...f, assignee_id: id, department: p?.department ?? f.department };
    });
    setSaved(false);
  }

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("id, task_id, body, created_at, author_id, author:author_id (id, full_name)")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true });
    const list = (data as unknown as Comment[]) ?? [];
    setComments(list);
    const ids = list.map((c) => c.id);
    if (ids.length) {
      const { data: rx } = await supabase
        .from("comment_reactions")
        .select("comment_id, user_id, emoji")
        .in("comment_id", ids);
      setReactions(rx ?? []);
    } else {
      setReactions([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  function save() {
    startSave(async () => {
      const res = await updateTask(task.id, form);
      if (!res?.error) setSaved(true);
    });
  }

  function handleDelete() {
    if (!confirm(`¿Borrar la tarea "${form.title}"?`)) return;
    startSave(async () => {
      await deleteTask(task.id);
      close();
    });
  }

  async function saveEditComment(id: string) {
    const text = editBody.trim();
    if (!text) return;
    await supabase.from("comments").update({ body: text }).eq("id", id);
    setEditingComment(null);
    setEditBody("");
    await loadComments();
  }

  async function sendComment(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const { data: created, error } = await supabase
      .from("comments")
      .insert({ task_id: task.id, author_id: currentUserId, body: text })
      .select("id")
      .single();
    if (!error) {
      // Avisar a los mencionados (@Nombre)
      const mentionedIds = parseMentions(text);
      if (created && mentionedIds.length) {
        await supabase.from("notifications").insert(
          mentionedIds.map((rid) => ({
            recipient_id: rid,
            actor_id: currentUserId,
            task_id: task.id,
            comment_id: created.id,
            type: "mention",
          })),
        );
        // Aviso en Slack (DM). Si no hay token configurado, no hace nada.
        notifyMentionsSlack(task.title, mentionedIds).catch(() => {});
      }
      setBody("");
      setMention(null);
      await loadComments();
    }
    setSending(false);
  }

  async function removeComment(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    await loadComments();
  }

  // Estado calculado en vivo según la fecha del formulario
  const liveTask = {
    ...task,
    due_date: form.due_date || null,
  } as Task;
  const status = statusForTask(liveTask);
  const col = STATUS_COLUMNS.find((c) => c.key === status)!;

  const label = "block text-xs font-semibold text-ink/50 mb-1";
  const field =
    "w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15 disabled:opacity-70 disabled:cursor-default";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          {isAdmin ? (
            <select
              value={statusSel}
              onChange={(e) => changeStatus(e.target.value)}
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white border-0 outline-none cursor-pointer"
              style={{
                backgroundColor:
                  STATUS_COLUMNS.find((c) => c.key === statusSel)?.color ??
                  col.color,
              }}
            >
              {STATUS_COLUMNS.map((c) => (
                <option key={c.key} value={c.key} className="bg-white text-ink">
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: col.color }}
            >
              {col.label}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/?task=${task.id}`,
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="text-xs px-3 py-1 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/70 whitespace-nowrap"
            >
              {copied ? "✓ Copiado" : "🔗 Enlace"}
            </button>
            <button
              onClick={close}
              className="text-ink/40 hover:text-ink text-xl leading-none w-8 h-8 rounded-full hover:bg-black/[0.04]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <input
            className="w-full text-2xl font-bold text-ink tracking-tight bg-transparent outline-none disabled:opacity-100"
            value={form.title}
            disabled={!isAdmin}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Título de la tarea"
          />

          <div>
            <label className={label}>Descripción</label>
            <textarea
              className={field}
              rows={3}
              disabled={!isAdmin}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Prioridad</label>
              <select
                className={field}
                disabled={!isAdmin}
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as Priority)}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className={label}>Fecha límite</label>
              <input
                type="date"
                className={field}
                disabled={!isAdmin}
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={label}>Responsable</label>
            <select
              className={field}
              disabled={!isAdmin}
              value={form.assignee_id}
              onChange={(e) => onAssignee(e.target.value)}
            >
              <option value="">— Sin asignar —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} · {p.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Departamento</label>
            <select
              className={field}
              disabled={!isAdmin}
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
            >
              <option value="">— Sin departamento —</option>
              {departmentOptions(form.department).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Sugerencia de próxima acción</label>
            <input
              className={field}
              disabled={!isAdmin}
              value={form.next_action}
              onChange={(e) => set("next_action", e.target.value)}
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={save}
                disabled={saving}
                className="bg-paprika hover:bg-paprika-dark text-white text-sm font-medium px-5 py-2 rounded-xl disabled:opacity-60"
              >
                {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-sm text-paprika/80 hover:text-paprika px-3 py-2 rounded-full hover:bg-paprika/10"
              >
                Borrar
              </button>
            </div>
          )}

          {/* Comentarios */}
          <div className="pt-4 border-t border-black/[0.06]">
            <h3 className="font-semibold text-ink text-sm mb-3">
              Comentarios{" "}
              <span className="text-ink/40 font-normal">
                ({comments.length})
              </span>
            </h3>

            <div className="space-y-2.5">
              {loading && <p className="text-sm text-ink/40">Cargando…</p>}
              {!loading && comments.length === 0 && (
                <p className="text-sm text-ink/40">Todavía no hay comentarios</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="bg-black/[0.03] rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">
                      {c.author?.full_name ?? "Usuario"}
                    </span>
                    <span className="text-xs text-ink/40">
                      {formatWhen(c.created_at)}
                    </span>
                  </div>
                  {editingComment === c.id ? (
                    <div className="mt-1">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-paprika"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => saveEditComment(c.id)}
                          className="text-xs bg-paprika text-white px-3 py-1 rounded-full font-semibold"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditBody("");
                          }}
                          className="text-xs px-3 py-1 rounded-full border border-black/10 text-ink/70"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink/80 mt-1 whitespace-pre-wrap break-words">
                      {renderBody(c.body)}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {reactionsFor(c.id).map(([emoji, info]) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(c.id, emoji)}
                        className={`text-xs px-2 py-0.5 rounded-[10px] border ${
                          info.mine
                            ? "border-paprika bg-paprika/10"
                            : "border-biscuit bg-white hover:border-faint"
                        }`}
                      >
                        {emoji} {info.count}
                      </button>
                    ))}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setPickerFor((p) => (p === c.id ? null : c.id))
                        }
                        className="text-xs px-2 py-0.5 rounded-[10px] border border-biscuit bg-white hover:border-faint text-ink/50"
                      >
                        ＋
                      </button>
                      {pickerFor === c.id && (
                        <div className="absolute z-10 mt-1 bg-white rounded-xl border border-black/10 shadow-card p-1 flex gap-1">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => toggleReaction(c.id, e)}
                              className="text-base hover:bg-black/[0.06] rounded-md px-1"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {(c.author_id === currentUserId || isAdmin) &&
                    editingComment !== c.id && (
                      <div className="flex gap-3 mt-1">
                        {c.author_id === currentUserId && (
                          <button
                            onClick={() => {
                              setEditingComment(c.id);
                              setEditBody(c.body);
                            }}
                            className="text-xs text-ink/50 hover:text-ink"
                          >
                            Editar
                          </button>
                        )}
                        <button
                          onClick={() => removeComment(c.id)}
                          className="text-xs text-paprika/70 hover:text-paprika"
                        >
                          Borrar
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Añadir comentario (fijo abajo) */}
        <div className="relative border-t border-black/[0.06] px-5 py-4">
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-5 right-5 mb-2 bg-white rounded-xl border border-black/10 shadow-card overflow-hidden z-10">
              {suggestions.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickMention(p.full_name)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                    i === activeIndex ? "bg-black/[0.05]" : "hover:bg-black/[0.04]"
                  }`}
                >
                  <span className="font-semibold text-paprika">
                    @{p.full_name}
                  </span>
                  <span className="text-ink/40 text-xs">{p.role}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={sendComment} className="flex gap-2 items-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => setInputPicker((v) => !v)}
                className="w-9 h-9 rounded-[10px] border border-biscuit bg-white hover:border-faint text-lg flex items-center justify-center"
                aria-label="Emojis"
              >
                😀
              </button>
              {inputPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl border border-black/10 shadow-card p-1 flex gap-1 z-10">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setBody((b) => b + e);
                        setInputPicker(false);
                      }}
                      className="text-base hover:bg-black/[0.06] rounded-md px-1"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              onKeyDown={onCommentKeyDown}
              rows={1}
              placeholder="Comentario…  (Enter = salto de línea · Cmd/Ctrl+Enter = enviar · **negrita**)"
              className="flex-1 resize-none rounded-2xl border border-biscuit bg-white px-4 py-2 text-ink text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15 max-h-32"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="bg-paprika hover:bg-paprika-dark text-white font-medium px-5 py-2 rounded-xl text-sm disabled:opacity-60"
            >
              {sending ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
