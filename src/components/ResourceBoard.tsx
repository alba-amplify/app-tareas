"use client";

import { useState, useTransition } from "react";
import {
  createResource,
  updateResource,
  deleteResource,
  duplicateResource,
  type ResourceInput,
} from "@/app/actions/resources";
import { createClient } from "@/lib/supabase/client";
import type { Board, Resource, ResourceLink, ResourceTable } from "@/lib/types";

function hostOf(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return url;
  }
}

function normalizeUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

const CATEGORIES_BY_BOARD: Record<string, string[]> = {
  contenido: [
    "Comercial",
    "Contenido audiovisual",
    "Producto Amplify",
    "Links y UTMs",
  ],
  accesos: ["Marketing", "Comercial", "Desarrollo", "Contenidos", "RRSS"],
  updates: [
    "Comercial",
    "Contenido audiovisual",
    "Producto Amplify",
    "Links y UTMs",
  ],
};

export default function ResourceBoard({
  board,
  resources,
}: {
  board: Board;
  resources: Resource[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [preview, setPreview] = useState<Resource | null>(null);
  const [cat, setCat] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const cats = CATEGORIES_BY_BOARD[board] ?? [];
  const visible = cat ? resources.filter((r) => r.category === cat) : resources;

  const TITLES: Record<Board, { title: string; subtitle: string }> = {
    contenido: {
      title: "Contenido",
      subtitle: "Enlaces del embudo, contenidos y materiales del proyecto.",
    },
    accesos: {
      title: "Accesos",
      subtitle: "Enlaces de acceso a las herramientas y paneles del proyecto.",
    },
    updates: {
      title: "Updates",
      subtitle: "Novedades, notas y actualizaciones del proyecto.",
    },
  };
  const title = TITLES[board].title;
  const subtitle = TITLES[board].subtitle;

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(r: Resource) {
    setEditing(r);
    setOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">{title}</h1>
          <p className="text-ink/50 text-sm mt-1">{subtitle}</p>
        </div>
        <button
          onClick={openNew}
          className="bg-paprika hover:bg-paprika-dark text-white font-semibold px-5 py-2 rounded-full text-sm shadow-soft transition-colors"
        >
          + Nueva tarjeta
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {["", ...cats].map((c) => (
          <button
            key={c || "all"}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              cat === c
                ? "bg-paprika text-white border-paprika"
                : "border-black/10 text-ink/60 hover:text-ink"
            }`}
          >
            {c || "Todas"}
          </button>
        ))}
      </div>

      {resources.length === 0 && (
        <p className="text-ink/40">
          Aún no hay tarjetas. Crea la primera con “+ Nueva tarjeta”.
        </p>
      )}

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((r) => (
          <div
            key={r.id}
            onClick={() => setPreview(r)}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-soft hover:shadow-card transition-shadow flex flex-col cursor-pointer"
          >
            <h3 className="font-bold text-ink text-lg leading-snug">{r.title}</h3>
            {r.category && (
              <span className="inline-block self-start mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.05] text-ink/60">
                {r.category}
              </span>
            )}
            {r.description && (
              <p className="text-sm text-ink/60 mt-1.5">{r.description}</p>
            )}

            {r.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.image_url}
                alt={r.title}
                className="mt-3 w-full h-36 object-cover rounded-xl border border-black/[0.06]"
              />
            )}

            <div className="mt-3 flex-1">
              <div className="space-y-1.5">
                {r.links.map((l, i) => (
                  <a
                    key={i}
                    href={normalizeUrl(l.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-paprika hover:underline"
                  >
                    <span>🔗</span>
                    <span className="truncate">{l.label || hostOf(l.url)}</span>
                  </a>
                ))}
              </div>

              {r.table_data && r.table_data.rows.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    {r.table_data.columns.some((c) => c) && (
                      <thead>
                        <tr>
                          {r.table_data.columns.map((c, i) => (
                            <th
                              key={i}
                              className="text-left font-semibold text-ink/70 border-b border-black/10 px-2 py-1"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {r.table_data.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="border-b border-black/[0.06] px-2 py-1 text-ink/80 align-top"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {r.links.length === 0 &&
                !(r.table_data && r.table_data.rows.length > 0) && (
                  <p className="text-xs text-ink/30">Sin contenido</p>
                )}
            </div>

            <div
              className="mt-4 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => openEdit(r)}
                className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
              >
                ✎ Editar
              </button>
              <button
                onClick={() =>
                  startTransition(() =>
                    duplicateResource(r.id, board).then(() => {}),
                  )
                }
                disabled={pending}
                className="text-xs px-3 py-1 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
              >
                ⧉ Duplicar
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Borrar "${r.title}"?`))
                    startTransition(() =>
                      deleteResource(r.id, board).then(() => {}),
                    );
                }}
                disabled={pending}
                className="text-xs px-3 py-1 rounded-full border border-paprika/30 text-paprika hover:bg-paprika/10"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ResourceModal
          board={board}
          resource={editing}
          onClose={() => setOpen(false)}
        />
      )}

      {preview && (
        <ResourcePreview
          resource={preview}
          onClose={() => setPreview(null)}
          onEdit={() => {
            const r = preview;
            setPreview(null);
            openEdit(r);
          }}
        />
      )}
    </div>
  );
}

function ResourcePreview({
  resource,
  onClose,
  onEdit,
}: {
  resource: Resource;
  onClose: () => void;
  onEdit: () => void;
}) {
  const t = resource.table_data;
  const hasTable = !!t && t.rows.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-6 border-b border-black/[0.06]">
          <div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">
              {resource.title}
            </h2>
            {resource.description && (
              <p className="text-ink/60 mt-1">{resource.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="text-sm px-3 py-1.5 rounded-full border border-black/10 hover:bg-black/[0.04] text-ink/70"
            >
              ✎ Editar
            </button>
            <button
              onClick={onClose}
              className="text-ink/40 hover:text-ink text-xl leading-none w-9 h-9 rounded-full hover:bg-black/[0.04]"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {resource.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resource.image_url}
              alt={resource.title}
              className="w-full max-h-[65vh] object-contain rounded-xl border border-black/[0.06] bg-black/[0.02]"
            />
          )}

          {resource.links.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink/50 mb-2">Enlaces</h3>
              <div className="space-y-2">
                {resource.links.map((l, i) => (
                  <a
                    key={i}
                    href={normalizeUrl(l.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-paprika hover:underline"
                  >
                    <span>🔗</span>
                    <span>{l.label || hostOf(l.url)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {hasTable && (
            <div>
              <h3 className="text-sm font-semibold text-ink/50 mb-2">Tabla</h3>
              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="w-full text-sm border-collapse">
                  {t!.columns.some((c) => c) && (
                    <thead className="bg-black/[0.02]">
                      <tr>
                        {t!.columns.map((c, i) => (
                          <th
                            key={i}
                            className="text-left font-semibold text-ink px-3 py-2 border-b border-black/10"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {t!.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-2 border-b border-black/[0.06] text-ink/80 align-top"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resource.links.length === 0 && !hasTable && (
            <p className="text-ink/40">
              Esta tarjeta no tiene contenido todavía.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceModal({
  board,
  resource,
  onClose,
}: {
  board: Board;
  resource: Resource | null;
  onClose: () => void;
}) {
  const isEdit = !!resource;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(resource?.title ?? "");
  const [category, setCategory] = useState(resource?.category ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [links, setLinks] = useState<ResourceLink[]>(
    resource?.links?.length ? resource.links : [{ label: "", url: "" }],
  );
  const [table, setTable] = useState<ResourceTable | null>(
    resource?.table_data ?? null,
  );
  const [imageUrl, setImageUrl] = useState(resource?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${board}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("resource-images")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (!error) {
      const { data } = supabase.storage
        .from("resource-images")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } else {
      alert("No se pudo subir la imagen: " + error.message);
    }
    setUploading(false);
  }

  function setLink(i: number, key: keyof ResourceLink, value: string) {
    setLinks((ls) => ls.map((l, j) => (j === i ? { ...l, [key]: value } : l)));
  }
  function addLink() {
    setLinks((ls) => [...ls, { label: "", url: "" }]);
  }
  function removeLink(i: number) {
    setLinks((ls) => ls.filter((_, j) => j !== i));
  }

  // --- Editor de tabla ---
  function addTable() {
    setTable({ columns: ["Columna 1", "Columna 2"], rows: [["", ""]] });
  }
  function removeTable() {
    setTable(null);
  }
  function setColumn(i: number, value: string) {
    setTable((t) =>
      t ? { ...t, columns: t.columns.map((c, j) => (j === i ? value : c)) } : t,
    );
  }
  function addColumn() {
    setTable((t) =>
      t
        ? {
            columns: [...t.columns, `Columna ${t.columns.length + 1}`],
            rows: t.rows.map((r) => [...r, ""]),
          }
        : t,
    );
  }
  function removeColumn(i: number) {
    setTable((t) =>
      t
        ? {
            columns: t.columns.filter((_, j) => j !== i),
            rows: t.rows.map((r) => r.filter((_, j) => j !== i)),
          }
        : t,
    );
  }
  function addRow() {
    setTable((t) => (t ? { ...t, rows: [...t.rows, t.columns.map(() => "")] } : t));
  }
  function removeRow(i: number) {
    setTable((t) => (t ? { ...t, rows: t.rows.filter((_, j) => j !== i) } : t));
  }
  function setCell(r: number, c: number, value: string) {
    setTable((t) =>
      t
        ? {
            ...t,
            rows: t.rows.map((row, ri) =>
              ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row,
            ),
          }
        : t,
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setError(null);
    const input: ResourceInput = {
      title,
      description,
      links,
      table_data: table,
      image_url: imageUrl,
      category,
    };
    startTransition(async () => {
      const res = isEdit
        ? await updateResource(resource!.id, board, input)
        : await createResource(board, input);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onClose();
    });
  }

  const field =
    "w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-ink text-sm outline-none focus:border-paprika focus:ring-2 focus:ring-paprika/15";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-ink mb-4 tracking-tight">
          {isEdit ? "Editar tarjeta" : "Nueva tarjeta"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Título *
            </label>
            <input
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                board === "contenido"
                  ? "Ej. Embudo de ventas"
                  : board === "accesos"
                    ? "Ej. Meta Ads"
                    : "Ej. Novedad de la semana"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Categoría
            </label>
            <select
              className={field}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">— Sin categoría —</option>
              {(CATEGORIES_BY_BOARD[board] ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Descripción
            </label>
            <textarea
              className={field}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Imagen
            </label>
            {imageUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full max-h-56 object-contain rounded-xl border border-black/10 bg-black/[0.02]"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="mt-2 text-sm text-paprika hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-black/10 hover:bg-black/[0.04] cursor-pointer text-ink/70">
                {uploading ? "Subiendo…" : "📷 Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Enlaces
            </label>
            <div className="space-y-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={field + " flex-[2]"}
                    value={l.label}
                    onChange={(e) => setLink(i, "label", e.target.value)}
                    placeholder="Nombre (ej. Landing)"
                  />
                  <input
                    className={field + " flex-[3]"}
                    value={l.url}
                    onChange={(e) => setLink(i, "url", e.target.value)}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="text-ink/40 hover:text-paprika px-2"
                    aria-label="Quitar enlace"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLink}
              className="mt-2 text-sm text-paprika hover:underline font-medium"
            >
              + Añadir enlace
            </button>
          </div>

          {/* Tabla */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-ink">
                Tabla
              </label>
              {table ? (
                <button
                  type="button"
                  onClick={removeTable}
                  className="text-xs text-paprika hover:underline"
                >
                  Quitar tabla
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addTable}
                  className="text-sm text-paprika hover:underline font-medium"
                >
                  + Añadir tabla
                </button>
              )}
            </div>

            {table && (
              <div className="space-y-2">
                <div className="overflow-x-auto border border-black/10 rounded-xl p-1">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        {table.columns.map((c, i) => (
                          <th key={i} className="p-1">
                            <div className="flex items-center gap-1">
                              <input
                                value={c}
                                onChange={(e) => setColumn(i, e.target.value)}
                                className="w-28 rounded-md border border-black/10 bg-black/[0.02] px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-paprika"
                                placeholder={`Col ${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeColumn(i)}
                                className="text-ink/30 hover:text-paprika text-xs"
                                aria-label="Quitar columna"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="p-1 align-middle">
                          <button
                            type="button"
                            onClick={addColumn}
                            className="text-xs text-paprika hover:underline whitespace-nowrap"
                          >
                            + col
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="p-1">
                              <input
                                value={cell}
                                onChange={(e) => setCell(ri, ci, e.target.value)}
                                className="w-28 rounded-md border border-black/10 bg-black/[0.02] px-2 py-1 text-xs text-ink outline-none focus:border-paprika"
                              />
                            </td>
                          ))}
                          <td className="p-1 align-middle">
                            <button
                              type="button"
                              onClick={() => removeRow(ri)}
                              className="text-ink/30 hover:text-paprika text-xs"
                              aria-label="Quitar fila"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addRow}
                  className="text-sm text-paprika hover:underline font-medium"
                >
                  + Añadir fila
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-paprika font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-black/10 text-ink/70 hover:bg-black/[0.04]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 rounded-full bg-paprika hover:bg-paprika-dark text-white font-semibold disabled:opacity-60"
            >
              {pending ? "Guardando…" : isEdit ? "Guardar" : "Crear tarjeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
