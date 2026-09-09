import type { Task } from "./types";

export type StatusKey =
  | "retrasadas"
  | "hoy"
  | "manana"
  | "pasado"
  | "mas3"
  | "finalizadas"
  | "updates";

export type StatusColumn = {
  key: StatusKey;
  label: string;
  color: string;
};

// Columnas del panel, en orden. El color usa la paleta Amplify.
export const STATUS_COLUMNS: StatusColumn[] = [
  { key: "retrasadas", label: "Retrasadas", color: "#B53324" },
  { key: "hoy", label: "Para hoy", color: "#E5A657" },
  { key: "manana", label: "Para mañana", color: "#DFBC94" },
  { key: "pasado", label: "Para pasado mañana", color: "#c9a36a" },
  { key: "mas3", label: "Para +3 días", color: "#8a9a5b" },
  { key: "finalizadas", label: "Finalizadas", color: "#5f8a5f" },
  { key: "updates", label: "Updates", color: "#8a94a6" },
];

// Convierte una fecha 'YYYY-MM-DD' a un timestamp local a medianoche.
function localMidnight(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function todayMidnight(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

// Calcula automáticamente en qué columna cae una tarea SEGÚN SU FECHA LÍMITE
// comparada con hoy. No se guarda en la base de datos: se recalcula siempre,
// así las tareas "se mueven solas" al pasar los días.
export function statusForTask(task: Task, now: Date = new Date()): StatusKey {
  if (task.done) return "finalizadas";
  if (!task.due_date) return "updates";

  const diffDays = Math.round(
    (localMidnight(task.due_date) - todayMidnight(now)) / 86_400_000,
  );

  if (diffDays < 0) return "retrasadas";
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "manana";
  if (diffDays === 2) return "pasado";
  return "mas3";
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  return !task.done && statusForTask(task, now) === "retrasadas";
}

export function daysUntilDue(task: Task, now: Date = new Date()): number | null {
  if (!task.due_date) return null;
  return Math.round(
    (localMidnight(task.due_date) - todayMidnight(now)) / 86_400_000,
  );
}
