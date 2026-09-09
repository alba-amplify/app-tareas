// Inserta tareas de ejemplo para probar el tablero. Ejecutar: node supabase/seed-tasks.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: profiles } = await admin.from("profiles").select("id, email");
const byEmail = Object.fromEntries((profiles ?? []).map((p) => [p.email, p.id]));

const tasks = [
  { title: "Planificación estrategia", description: "Analizar y actualizar los contratos vigentes con proveedores clave de la empresa.", priority: "alta", due_date: "2026-08-01", assignee_id: byEmail["carlos@amplifyesp.com"], department: "Dirección", next_action: "Solicitar comentarios legales antes de la firma final." },
  { title: "Report Lead Diario", description: "Reporte diario de la gestión de leads.", priority: "media", due_date: "2026-08-04", assignee_id: byEmail["fernando@amplifyesp.com"], department: "Equipo Comercial", next_action: "Enviar resumen al Head of Revenue." },
  { title: "Funnel Proyecto", description: "Revisar el embudo del proyecto y ajustar la estrategia de captación.", priority: "alta", due_date: "2026-08-04", assignee_id: byEmail["alba@amplifyesp.com"], department: "Estrategia", next_action: "Organizar reunión creativa." },
  { title: "Seguimiento META", description: "Seguimiento de campañas en META y revisión de resultados.", priority: "alta", due_date: "2026-08-05", assignee_id: byEmail["lauracobarro@gmail.com"], department: "Equipo Publicidad", next_action: "Revisar los datos finales y enviar el informe." },
  { title: "Diseño creatividades", description: "Desarrollar el concepto creativo para la campaña de lanzamiento.", priority: "media", due_date: "2026-08-06", assignee_id: byEmail["mrooyaan@gmail.com"], department: "Diseño", next_action: "Presentar bocetos al equipo." },
  { title: "Email Marketing", description: "Verificar existencias actuales y registrar nuevas compras en el sistema de inventario.", priority: "media", due_date: "2026-08-09", assignee_id: byEmail["alessiopierucci2001@gmail.com"], department: "Dirección", next_action: "Realizar conteo físico y actualizar la base de datos." },
];

const { error } = await admin.from("tasks").insert(tasks);
if (error) console.error("✗", error.message);
else console.log(`✓ ${tasks.length} tareas de ejemplo insertadas`);
