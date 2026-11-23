// Cambios puntuales en las tareas del panel que se aplican UNA sola vez
// (quedan anotados en state.appliedOps) la próxima vez que alguien abre el panel.

/* eslint-disable @typescript-eslint/no-explicit-any */
type State = Record<string, any> & { tasks: any[] };

type Op = { id: string; apply: (state: State) => number };

export const OPS: Op[] = [
  {
    // 23/11/2026 · Alba: «las tareas que están sin fecha, ponlas todas para mañana».
    // Solo la columna «Sin fecha» (abiertas, sin fecha, ni «A la espera» ni «Updates»)
    // y solo las que ya existían a esa hora.
    id: "2026-11-23-sin-fecha-a-manana",
    apply: (state) => {
      const until = Date.parse("2026-11-23T17:30:00+01:00");
      let n = 0;
      for (const t of state.tasks) {
        if (t.done || t.due || t.mode === "espera" || t.mode === "update") continue;
        if (t.createdAt && t.createdAt > until) continue;
        t.due = "2026-11-24";
        t.mode = "auto";
        n++;
      }
      return n;
    },
  },
  {
    // 23/11/2026 · Alba: «todas las tareas que sean de desarrollo pónselas a ella» (Florencia).
    // Tareas abiertas del departamento Desarrollo → responsable única: Florencia.
    id: "2026-11-23-desarrollo-a-florencia",
    apply: (state) => {
      const norm = (x: string) => String(x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
      const flo = (state.members || []).find((m: any) => ["flor", "florencia"].includes(norm(m.name).split(/\s+/)[0]));
      if (!flo) throw new Error("florencia-no-esta");
      let n = 0;
      for (const t of state.tasks) {
        if (t.done || norm(t.dept) !== "desarrollo") continue;
        if (Array.isArray(t.assignees) && t.assignees.length === 1 && t.assignees[0] === flo.id) continue;
        t.assignees = [flo.id];
        n++;
      }
      return n;
    },
  },
];

export function applyOps(state: State): { state: State; applied: string[]; changed: number } {
  const done: string[] = Array.isArray(state.appliedOps) ? state.appliedOps : [];
  const pending = OPS.filter((o) => !done.includes(o.id));
  if (!pending.length) return { state, applied: [], changed: 0 };
  const next: State = JSON.parse(JSON.stringify(state));
  let changed = 0;
  const applied: string[] = [];
  for (const o of pending) {
    try {
      changed += o.apply(next);
      applied.push(o.id);
    } catch {
      // si falta algo (p. ej. la persona aún no está en el equipo) se reintenta la próxima vez
    }
  }
  if (!applied.length) return { state, applied: [], changed: 0 };
  next.appliedOps = [...done, ...applied];
  return { state: next, applied, changed };
}
