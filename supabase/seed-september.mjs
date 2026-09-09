// Adapta agosto a los pilares nuevos y carga septiembre (Monetización).
// Ejecutar: node supabase/seed-september.mjs
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

// 1) Reasignar categorías de agosto a pilares + estado
const augMap = {
  "2026-08-18": "Autoridad",
  "2026-08-19": "Autoridad",
  "2026-08-20": "Lead Magnet",
  "2026-08-21": "Prueba Social",
  "2026-08-22": "Lead Magnet",
  "2026-08-24": "Autoridad",
  "2026-08-25": "Conversión",
  "2026-08-26": "Autoridad",
  "2026-08-27": "Lead Magnet",
  "2026-08-28": "Lifestyle",
  "2026-08-29": "Lead Magnet",
  "2026-08-31": "Mentalidad",
};
for (const [date, cat] of Object.entries(augMap)) {
  await admin
    .from("social_posts")
    .update({ category: cat, status: "FALTA CONTENIDO" })
    .eq("publish_date", date);
}
console.log("✓ agosto adaptado a pilares");

// 2) Septiembre — Monetización
const P = (publish_date, category, objective, copy, script) => ({
  publish_date, category, objective, status: "FALTA CONTENIDO",
  product: "Servicio Amplify", copy, script,
});
const posts = [
  P("2026-09-02","Autoridad","Autoridad","Tienes seguidores pero no vendes. El problema no es el alcance, es tu oferta. 👇","Gancho: «Tienes seguidores y cero ventas». Desarrollo: por qué falla la oferta, no el alcance. CTA: sigue para arreglarlo."),
  P("2026-09-03","Lead Magnet","Captación","Plantilla de oferta irresistible GRATIS. Comenta «OFERTA». 📩","Gancho: «Tu oferta no se entiende en 5s». Muestra la plantilla. CTA: comenta OFERTA."),
  P("2026-09-05","Lead Magnet","Captación","Guion para vender en stories sin sonar pesado. Comenta «VENTA». 📩","Gancho: «Vende en stories sin dar cringe». Enseña el guion. CTA: comenta VENTA."),
  P("2026-09-07","Mentalidad","Alcance","Deja de regalar tu trabajo. Cobrar es respetarte. 💸","Gancho: «Si trabajas gratis, esto va por ti». Reflexión + ejemplo. CTA: guarda."),
  P("2026-09-09","Autoridad","Autoridad","Anatomía de una oferta irresistible (5 piezas). Desliza 👉","Carrusel: 5 piezas de una oferta (promesa, mecanismo, prueba, precio, garantía). CTA: guarda."),
  P("2026-09-10","Lead Magnet","Captación","Checklist para montar tu funnel. Comenta «FUNNEL». 📩","Gancho: «Tu embudo pierde dinero aquí». Muestra checklist. CTA: comenta FUNNEL."),
  P("2026-09-11","Prueba Social","Prueba social","De vender servicios sueltos a high-ticket. Caso real. 🔥","Gancho: «Pasó de 300€ a 3.000€ por cliente». 3 cambios. CTA: escríbenos."),
  P("2026-09-12","Lead Magnet","Captación","Plantillas de CTA que convierten. Comenta «CTA». 📩","Gancho: «Tu CTA no invita a nada». Enseña ejemplos. CTA: comenta CTA."),
  P("2026-09-14","Mentalidad","Alcance","El miedo a subir precios te está costando dinero. 🧠","Gancho: «Subir precios da vértigo, pero…». Historia. CTA: sigue."),
  P("2026-09-16","Autoridad","Autoridad","Cómo estructurar tu funnel desde 0. Desliza 👉","Carrusel: lead magnet → nurturing → oferta. CTA: guarda."),
  P("2026-09-17","Lead Magnet","Captación","Guía: tu primer embudo paso a paso. Comenta «EMBUDO». 📩","Gancho: «Monta tu primer embudo esta semana». Muestra guía. CTA: comenta EMBUDO."),
  P("2026-09-18","Prueba Social","Prueba social","Antes/después de rehacer una oferta. 📈","Gancho: «Misma audiencia, x3 ventas». Compara. CTA: escríbenos."),
  P("2026-09-19","Lead Magnet","Captación","Swipe file: 20 copys que venden. Comenta «COPYS». 📩","Gancho: «Roba estos 20 copys». Enseña el archivo. CTA: comenta COPYS."),
  P("2026-09-21","Conversión","Conversión","Cómo hacer una oferta sin sonar a vendehumos. 🎯","Gancho: «Vender sin dar vergüenza ajena». Framework corto. CTA: guarda."),
  P("2026-09-23","Autoridad","Autoridad","3 errores en tus CTAs que matan ventas. Desliza 👉","Carrusel: 3 errores + arreglo de cada uno. CTA: guarda."),
  P("2026-09-24","Lead Magnet","Captación","Calculadora de precios para tus servicios. Comenta «PRECIOS». 📩","Gancho: «¿Cobras poco? Compruébalo». Enseña la calculadora. CTA: comenta PRECIOS."),
  P("2026-09-25","Lifestyle","Cercanía","Un día cerrando clientes con el equipo. 🎬","BTS: rutina de un día de ventas. CTA: sigue para más."),
  P("2026-09-26","Lead Magnet","Captación","Plantilla de propuesta que cierra. Comenta «PROPUESTA». 📩","Gancho: «Tu propuesta no cierra por esto». Muestra plantilla. CTA: comenta PROPUESTA."),
  P("2026-09-28","Conversión","Conversión","El CTA que más nos convierte (y por qué). 🔑","Gancho: «Este CTA nos cambió las ventas». Explica. CTA: pruébalo."),
  P("2026-09-30","Autoridad","Autoridad","Recap: lo que aprendimos monetizando en septiembre. 📊","Carrusel recap con las 5 claves del mes. CTA: guarda."),
];

await admin.from("social_posts").delete()
  .gte("publish_date", "2026-09-01").lte("publish_date", "2026-09-30");
const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} publicaciones de septiembre cargadas`);
