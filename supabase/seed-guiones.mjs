// Reescribe los guiones de las publicaciones aplicando el SOP de Alessio.
// Ejecutar: node supabase/seed-guiones.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const guiones = {
  // AGOSTO
  "2026-08-18": "Gancho (0-3s): «Tus reels mueren en el segundo 3». · Desarrollo: enseña 3 ganchos reales (dolor / resultado+tiempo / error) documentando cómo los usas tú. · CTA: «Guarda esto para tu próximo reel».",
  "2026-08-19": "Gancho: «Tu perfil espanta clientes y no lo sabes». · Brecha: perfil actual vs. perfil que convierte, con ejemplos en pantalla. · CTA: «Arréglalo hoy».",
  "2026-08-20": "Dolor: «Tienes seguidores pero cero ventas». · Puente: la guía de 7 pasos lo resuelve; enseña la portada. · CTA: «Comenta GUÍA y te la mando por DM».",
  "2026-08-21": "Caso con nombre real: «[Cliente] pasó de 500 a 10k en 60 días». · Situación inicial + los 3 cambios que hicimos + resultado (sin exagerar). · CTA: «Escríbenos si quieres esto».",
  "2026-08-22": "Dolor: «Tu perfil pierde ventas por 8 detalles». · Marca 2-3 del checklist en directo. · CTA: «Comenta PERFIL y te paso el checklist».",
  "2026-08-24": "Gancho: «Estás matando tu alcance con este error». · El error (no responder los primeros 30 min) + tu rutina real. · CTA: «Sígueme para más».",
  "2026-08-25": "Brecha: «Sin 100k igual puedes facturar». · 3 vías de monetización con un ejemplo real de cada una. · CTA: «Empieza por la 1».",
  "2026-08-26": "Gancho: «Publicar por publicar no vende». · Documenta tu semana de contenido real. · CTA: «Guarda la plantilla».",
  "2026-08-27": "Dolor: «Improvisas tus publicaciones». · La plantilla de calendario lo ordena; enséñala. · CTA: «Comenta PLAN».",
  "2026-08-28": "Natural (Conexión): acompaña a Alessio montando la estrategia de un cliente, sin guion rígido, mostrando el proceso real. · CTA suave: «Sígueme para ver cómo trabajamos».",
  "2026-08-29": "Gancho: «Lo que funcionaba en enero hoy te hunde». · 3 cambios del algoritmo que la guía explica. · CTA: «Comenta ALGO».",
  "2026-08-31": "Conexión + brecha: «Septiembre lo vamos a petar y te llevo conmigo». · Adelanta 2 temas del mes. · CTA: «Dale a seguir».",
  // SEPTIEMBRE
  "2026-09-02": "Gancho: «Tienes audiencia y no vendes». · Brecha: el problema no es el alcance, es la oferta; documenta el diagnóstico. · CTA: «Sigue para arreglarlo».",
  "2026-09-03": "Dolor: «Tu oferta no se entiende en 5 segundos». · La plantilla de oferta irresistible. · CTA: «Comenta OFERTA».",
  "2026-09-05": "Dolor: «Vender en stories te da cringe». · El guion de venta natural. · CTA: «Comenta VENTA».",
  "2026-09-07": "Conexión: historia real de cuando Alessio trabajaba gratis. · Lección: cobrar es respetarte. · CTA: «Guarda esto».",
  "2026-09-09": "Autoridad sin presumir: las 5 piezas de una oferta, con ejemplo propio. · CTA: «Guarda».",
  "2026-09-10": "Dolor: «Tu embudo pierde dinero aquí». · El checklist de funnel. · CTA: «Comenta FUNNEL».",
  "2026-09-11": "Caso con nombre: «[Cliente] pasó de servicios sueltos a high-ticket». · 3 cambios + resultado real. · CTA: «Escríbenos».",
  "2026-09-12": "Dolor: «Tu CTA no invita a nada». · Ejemplos de CTAs que sí convierten. · CTA: «Comenta CTA».",
  "2026-09-14": "Conexión: el miedo de Alessio a subir precios y cómo lo superó. · CTA: «Sígueme».",
  "2026-09-16": "Documenta: cómo montar un funnel desde 0 en 3 pasos. · CTA: «Guarda».",
  "2026-09-17": "Dolor: «No tienes embudo». · La guía paso a paso. · CTA: «Comenta EMBUDO».",
  "2026-09-18": "Prueba social: antes/después con nombre real, sin modificar resultados. · CTA: «Escríbenos».",
  "2026-09-19": "Gancho: «Roba estos 20 copys». · El swipe file. · CTA: «Comenta COPYS».",
  "2026-09-21": "La venta no empieza en el CTA: framework para ofertar sin vendehumos. · CTA: «Guarda».",
  "2026-09-23": "3 errores en tus CTAs + su arreglo, con ejemplos propios (documentar). · CTA: «Guarda».",
  "2026-09-24": "Dolor: «Cobras poco y no lo sabes». · La calculadora de precios. · CTA: «Comenta PRECIOS».",
  "2026-09-25": "Natural (Lifestyle): un día cerrando clientes con el equipo, mostrando el proceso real. · CTA: «Sígueme».",
  "2026-09-26": "Dolor: «Tu propuesta no cierra». · La plantilla de propuesta. · CTA: «Comenta PROPUESTA».",
  "2026-09-28": "Conversión: el CTA que más nos convierte y por qué, con un dato real. · CTA: «Pruébalo».",
  "2026-09-30": "Recap del mes: 5 claves de monetización, documentando aprendizajes. · CTA: «Guarda».",
};

let n = 0;
for (const [date, script] of Object.entries(guiones)) {
  const { error } = await admin
    .from("social_posts")
    .update({ script })
    .eq("publish_date", date);
  if (!error) n++;
  else console.error(date, error.message);
}
console.log(`✓ ${n} guiones reescritos con el método del SOP`);
