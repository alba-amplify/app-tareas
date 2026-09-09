// Integra la estrategia REAL de Stories de Alessio (Lun calentamiento / Jue CTA+PDF / Sáb wins).
// Sustituye las stories genéricas de agosto y septiembre. Ejecutar: node supabase/seed-stories-real.mjs
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

const S = (publish_date, category, objective, script, copy = "") => ({
  publish_date, category, objective, script, copy,
  kind: "story", status: "FALTA CONTENIDO", product: "Servicio Amplify",
});

const CAL = "Calentamiento (Lunes)";
const CTA = "CTA / Regalo (Jueves)";
const WIN = "Resultados / Wins (Sábado)";

const posts = [
  // ---- AGOSTO ----
  S("2026-08-29","Autoridad",WIN,
    "Wins (7 stories, un resultado por story + captura de Circle):\n1) Hook relajado: «Así de contento estoy viendo los resultados de esta semana de los alumnos de Amplify».\n2) Irantzu: de sus últimos 6 reels, más de la mitad virales.\n3) Pablo: primer vídeo con 100.000 views.\n4) Yohany: +1M views y 900 seguidores nuevos con carruseles (danza folclórica).\n5) Kiara: primera venta de 1.500€, cerca de 11k seguidores (+100/día).\n6) Angel Luis: copió un formato del grupo y en 1 día +200 seguidores y +10 ventas.\n7) Cierre + CTA: «La única diferencia es que tomaron acción. Escríbeme AMPLIFY».",
    "Resultados de la semana · palabra clave AMPLIFY"),
  S("2026-08-31","Nicho",CAL,
    "Calentamiento (5 stories) — dolor: vistas altas que no traen seguidores:\n1) Hook observación: «Llevo tiempo viendo un patrón raro en las cuentas de Amplify...».\n2) Problema: gente con millones de views que apenas gana seguidores, y gente con views normales que crece mucho.\n3) Causa real: las views dependen del algoritmo; los seguidores, de si la persona decide quedarse.\n4) Reencuadre: el objetivo no es el vídeo viral, es que quiera ver el siguiente.\n5) Teaser jueves: «Esta semana os enseño qué hace que alguien decida seguirte tras un solo vídeo». (sin CTA)",
    "Calentamiento semanal · cierra en intriga"),
  // ---- SEPTIEMBRE ----
  S("2026-09-03","Venta",CTA,
    "CTA + PDF (4 stories) — palabra clave CRECER:\n1) Hook travesura: «Mi equipo me va a matar por hacer esto pero me da igual».\n2) Presenta el PDF: «por qué tus vídeos más vistos no son los que más te hacen crecer, y qué hacer».\n3) Preview de la foto del PDF (tarjeta AMPLIFY2.0).\n4) CTA: «Escríbeme CRECER y te lo envío por privado».\n\nPDF (12 slides): 'Por qué tus vídeos virales no te hacen crecer' — vista≠seguidor · framework 3 palancas (curiosidad resuelta / identidad reconocible / razón para volver) · diagnóstico de conversión · viral vs storytelling · señales de perfil que no retiene · checklist. (Guion de slides en el doc).",
    "Regalo de la semana · palabra clave CRECER"),
  S("2026-09-05","Autoridad",WIN,
    "Wins (4-6 stories, un resultado por story) — a la espera de los resultados de la semana. Rellenar con casos reales de Circle + cierre CTA AMPLIFY.",
    "Resultados de la semana · palabra clave AMPLIFY"),
  S("2026-09-07","Nicho",CAL,
    "Calentamiento (5 stories) — dolor: creer que hace falta muchísima audiencia para monetizar:\n1) Hook (talking head): «Hay una creencia que frena a más gente de la que imagináis».\n2) La creencia: «necesito 200.000 seguidores o un vídeo que lo cambie todo».\n3) Contraste real: gente con 5.000 viviendo de esto y creadores con 150.000 que no.\n4) Causa real: no es el tamaño, es si la audiencia sabe qué ofreces y cómo comprarlo.\n5) Teaser jueves: «Esta semana os enseño cómo montarlo aunque tu cuenta sea pequeña». (sin CTA)",
    "Calentamiento semanal"),
  S("2026-09-10","Venta",CTA,
    "CTA + PDF (4 stories) — palabra clave PRODUCTO:\n1) Hook: «Llevaba semanas queriendo hacer esto y hoy por fin me he puesto».\n2) Presenta PDF: «aprenderás a monetizar tu marca personal sin depender de marcas ni colaboraciones».\n3) Autoridad + preview del PDF (tarjeta AMPLIFY2.0).\n4) CTA: «Escríbeme PRODUCTO y te lo envío por privado».\n\nPDF (12 slides): 'Cómo monetizar tu marca personal con un producto digital' — audiencia sin oferta no vende · framework 3 pilares (claridad / accesibilidad / confianza previa) · qué es un producto digital · cómo elegir el primero · objeción emocional · ciclo · checklist. (Slides en el doc).",
    "Regalo de la semana · palabra clave PRODUCTO"),
  S("2026-09-12","Autoridad",WIN,
    "Wins (6 stories) — monetización con audiencias no gigantes:\n1) Hook: «Esta semana os traigo resultados que tienen algo en común: ninguno tenía una audiencia enorme cuando esto pasó».\n2) Borja: de cero (nunca a cámara) a casi 30.000 seguidores y ~30.000€ facturados.\n3) Rocío: 8.000€ en 16 días, su primer mes viviendo de su marca.\n4) Nacho: a los 2 meses, primera charla remunerada y 2 infoproductos en marcha.\n5) Claudia: vive de su marca, +22 clientes, colabs con Dr. Franklin, Fila y una marca de matcha.\n6) Cierre (talking head): «Ninguno esperó a 100.000 seguidores. Escríbeme AMPLIFY».",
    "Resultados de la semana · palabra clave AMPLIFY"),
  // ---- SEPTIEMBRE: resto (mismo patrón, rellenar dolor/PDF/casos de la semana) ----
  S("2026-09-14","Nicho",CAL,
    "Calentamiento (5 stories): hook patrón → nombra el problema → causa real → reencuadre → teaser del jueves. Elegir dolor de dolores_alumnos.md. Sin CTA.",
    "Calentamiento semanal"),
  S("2026-09-17","Venta",CTA,
    "CTA + PDF (4 stories): hook travesura → presenta PDF ligado al dolor de la semana → preview del PDF → CTA «comenta [PALABRA]». Requiere PDF nuevo (12 slides, misma estructura).",
    "Regalo de la semana"),
  S("2026-09-19","Autoridad",WIN,
    "Wins (4-6 stories): un resultado real por story (casos de casos_reales.md) + cierre CTA AMPLIFY.",
    "Resultados de la semana · palabra clave AMPLIFY"),
  S("2026-09-21","Nicho",CAL,
    "Calentamiento (5 stories): mismo esquema, dolor de la semana → teaser del jueves. Sin CTA.",
    "Calentamiento semanal"),
  S("2026-09-24","Venta",CTA,
    "CTA + PDF (4 stories): presenta el regalo de la semana ligado al dolor → CTA «comenta [PALABRA]». PDF nuevo.",
    "Regalo de la semana"),
  S("2026-09-26","Autoridad",WIN,
    "Wins (4-6 stories): resultados reales de la semana + cierre CTA AMPLIFY.",
    "Resultados de la semana · palabra clave AMPLIFY"),
  S("2026-09-28","Nicho",CAL,
    "Calentamiento (5 stories): esquema de calentamiento, teaser del jueves. Sin CTA.",
    "Calentamiento semanal"),
];

await admin.from("social_posts").delete()
  .eq("kind", "story").gte("publish_date", "2026-08-01").lte("publish_date", "2026-09-30");
const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} stories reales (Lun/Jue/Sáb) integradas`);
