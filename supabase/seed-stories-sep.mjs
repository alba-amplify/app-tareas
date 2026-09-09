// Stories de septiembre (Monetización). Lun-Jue calientan; viernes = lead magnet.
// Ejecutar: node supabase/seed-stories-sep.mjs
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

const S = (publish_date, category, objective, script) => ({
  publish_date, category, objective, script,
  kind: "story", status: "FALTA CONTENIDO", product: "Servicio Amplify",
});

// Plantillas por pilar (tema: monetización)
const NICHO = (t) => `Secuencia Nicho (4 stories), sin parecer clase:\n1) Gancho: «${t}».\n2) Explícalo con un ejemplo real.\n3) Cómo lo aplico yo (documenta).\n4) Encuesta a la audiencia.`;
const AUTORIDAD = (t) => `Secuencia Autoridad (5 stories):\n1) «${t}».\n2) Situación inicial real del cliente.\n3) Qué hicimos (2-3 pasos).\n4) Resultado con captura (sin exagerar).\n5) CTA suave a Amplify.`;
const VENTA = (dolor, palabra) => `Secuencia Venta (5 stories) — calienta el lead magnet:\n1) Dolor: «${dolor}».\n2) La brecha: dónde estás vs dónde quieres estar.\n3) Qué te está frenando.\n4) «Mañana os dejo el recurso que ayuda con esto».\n5) Encuesta: «¿Lo quieres?»`;
const LM = (nombre, palabra) => `Secuencia Lead Magnet (5 stories):\n1) «Como prometí, aquí está ${nombre}».\n2) Qué es y para quién.\n3) Qué vas a conseguir.\n4) CTA: «Comenta ${palabra} y te lo mando por DM».\n5) Prueba social breve.`;
const CONEXION = (t) => `Secuencia Conexión (5 stories), natural:\n1) Cara a cámara: «${t}».\n2) Documenta el proyecto/día real.\n3) Reflexión breve.\n4) Encuesta a la audiencia.\n5) Cierre humano.`;

const posts = [
  // Semana 0 (parcial)
  S("2026-09-01","Nicho","Calentar","" + NICHO("Por qué tienes seguidores y cero ventas")),
  S("2026-09-02","Autoridad","Calentar", AUTORIDAD("Os enseño cómo [Cliente] empezó a vender")),
  S("2026-09-03","Venta","Calentar LM", VENTA("Publicas pero no entra ni un cliente")),
  S("2026-09-04","Lead Magnet","Entregar", LM("la Plantilla de Oferta Irresistible","OFERTA")),
  // Semana 1
  S("2026-09-07","Conexión","Reconectar", CONEXION("Nuevo lunes, esta semana toca hablar de dinero")),
  S("2026-09-08","Nicho","Calentar", NICHO("El error que hace que tu oferta no se entienda")),
  S("2026-09-09","Autoridad","Calentar", AUTORIDAD("Detrás de una estrategia de venta que funcionó")),
  S("2026-09-10","Venta","Calentar LM", VENTA("Tu embudo pierde dinero y no lo sabes")),
  S("2026-09-11","Lead Magnet","Entregar", LM("el Checklist de Funnel","FUNNEL")),
  // Semana 2
  S("2026-09-14","Conexión","Reconectar", CONEXION("Os cuento en qué estoy trabajando esta semana")),
  S("2026-09-15","Nicho","Calentar", NICHO("Lo que nadie te cuenta sobre montar tu primer embudo")),
  S("2026-09-16","Autoridad","Calentar", AUTORIDAD("Caso real: de improvisar a tener sistema")),
  S("2026-09-17","Venta","Calentar LM", VENTA("No tienes embudo y por eso no escalas")),
  S("2026-09-18","Lead Magnet","Entregar", LM("la Guía: tu primer embudo","EMBUDO")),
  // Semana 3
  S("2026-09-21","Conexión","Reconectar", CONEXION("Arrancamos semana, os enseño el detrás")),
  S("2026-09-22","Nicho","Calentar", NICHO("Cómo poner precio sin morir en el intento")),
  S("2026-09-23","Autoridad","Calentar", AUTORIDAD("Cliente que subió precios y facturó más")),
  S("2026-09-24","Venta","Calentar LM", VENTA("Cobras poco y ni te habías dado cuenta")),
  S("2026-09-25","Lead Magnet","Entregar", LM("la Calculadora de Precios","PRECIOS")),
  // Semana 4 (cierre)
  S("2026-09-28","Conexión","Reconectar", CONEXION("Última semana del mes, recap y planes")),
  S("2026-09-29","Nicho","Calentar", NICHO("El CTA que más convierte y por qué")),
  S("2026-09-30","Autoridad","Calentar", AUTORIDAD("Recap del mes: lo que funcionó de verdad")),
];

await admin.from("social_posts").delete()
  .eq("kind", "story").gte("publish_date", "2026-09-01").lte("publish_date", "2026-09-30");
const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} stories de septiembre cargadas`);
