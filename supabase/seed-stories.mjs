// Estrategia semanal de Stories de Alessio (SOP) para el resto de agosto.
// Lun-Jue calientan; viernes = lead magnet. Ejecutar: node supabase/seed-stories.mjs
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

const posts = [
  // Semana 1 (parcial)
  S("2026-08-18","Nicho","Calentar (nicho)",
    "Secuencia Nicho (4 stories), sin parecer clase:\n1) Gancho: «El error que veo cada semana en cuentas que no crecen».\n2) El error con un ejemplo real.\n3) Cómo lo hago yo (documenta pantalla).\n4) Encuesta: «¿Te pasa esto?»"),
  S("2026-08-19","Autoridad","Calentar (autoridad)",
    "Secuencia Autoridad (5 stories):\n1) «Os enseño lo que ha pasado con [Cliente]».\n2) Situación inicial real.\n3) Qué hicimos (2-3 pasos).\n4) Resultado con captura (sin exagerar).\n5) «Esto es lo que hacemos en Amplify»."),
  S("2026-08-20","Venta","Calentar lead magnet",
    "Secuencia Venta (5 stories) — calienta el lead magnet del viernes:\n1) Dolor: «Publicas y no crece nadie».\n2) La brecha: dónde estás vs dónde quieres estar.\n3) Qué te está frenando (sin culpa).\n4) «El viernes os dejo algo que ayuda justo con esto».\n5) Encuesta: «¿Lo quieres?»"),
  S("2026-08-21","Lead Magnet","Entregar recurso",
    "Secuencia Lead Magnet (5 stories):\n1) «Como prometí, aquí está la Guía de Ganchos».\n2) Qué es y para quién.\n3) Qué vas a conseguir.\n4) CTA: «Comenta GANCHOS y te la mando por DM».\n5) Prueba social breve."),
  // Semana 2
  S("2026-08-24","Conexión","Reconectar",
    "Secuencia Conexión (5 stories), natural:\n1) Cara a cámara: «Nuevo lunes, os cuento en qué ando».\n2) Documenta el proyecto/escritorio real.\n3) Reflexión breve del porqué.\n4) Encuesta: «¿Tú en qué estás esta semana?»\n5) Cierre humano."),
  S("2026-08-25","Nicho","Calentar (nicho)",
    "Secuencia Nicho (4 stories):\n1) Gancho: «Nadie te cuenta esto sobre crecer en redes».\n2) Insight de nicho con ejemplo.\n3) Cómo lo aplico yo.\n4) Pregunta abierta a la audiencia."),
  S("2026-08-26","Autoridad","Calentar (autoridad)",
    "Secuencia Autoridad (5 stories):\n1) Detrás de una reunión con cliente.\n2) El problema que traía.\n3) La estrategia que le dimos.\n4) Primer resultado real (captura).\n5) CTA suave a Amplify."),
  S("2026-08-27","Venta","Calentar lead magnet",
    "Secuencia Venta (5 stories) — calienta el lead magnet:\n1) Dolor: «El algoritmo te está enterrando».\n2) La brecha.\n3) Qué te frena.\n4) «Mañana os dejo la guía que lo arregla».\n5) Encuesta teaser."),
  S("2026-08-28","Lead Magnet","Entregar recurso",
    "Secuencia Lead Magnet (5 stories):\n1) «Aquí está la Guía del Algoritmo 2026».\n2) Qué incluye.\n3) Resultado esperado.\n4) CTA: «Comenta ALGO y te la mando».\n5) Urgencia suave."),
  // Semana 3 (arranque)
  S("2026-08-31","Conexión","Reconectar",
    "Secuencia Conexión (5 stories):\n1) «Arrancamos septiembre fuerte, os cuento el plan».\n2) Documenta.\n3) Reflexión breve.\n4) Encuesta.\n5) Cierre humano."),
];

await admin.from("social_posts").delete()
  .eq("kind", "story").gte("publish_date", "2026-08-01").lte("publish_date", "2026-08-31");
const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} stories de agosto cargadas`);
