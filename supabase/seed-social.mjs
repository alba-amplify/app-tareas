// Recarga las ideas de contenido RRSS de agosto (lead magnets jue/sáb) con guiones.
// Ejecutar: node supabase/seed-social.mjs
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

const S = "Idea";
const posts = [
  {
    publish_date: "2026-08-18", category: "Reel", objective: "Alcance", product: "Contenido orgánico", status: S,
    content: "3 ganchos que paran el scroll.",
    copy: "Si tu vídeo no engancha en 3 segundos, no lo ve nadie. 🚫\n3 ganchos que más retención nos dan:\n1) Pregunta incómoda 2) Resultado+tiempo 3) Error común\nGuárdalo. 📌",
    script: "Gancho (0-3s): «Si tus reels no enganchan en 3s, pierdes el 90% de las vistas.»\nDesarrollo: muestra en pantalla los 3 ganchos con un ejemplo real de cada uno.\nCTA: «Guarda esto para tu próximo reel.»",
  },
  {
    publish_date: "2026-08-19", category: "Carrusel", objective: "Autoridad", product: "Contenido orgánico", status: S,
    content: "Por qué tu perfil no vende (6 slides).",
    copy: "Tu perfil es tu página de ventas y no lo sabías. 👀\nDesliza para ver los 5 fallos que hacen que entren… y se vayan sin seguirte.",
    script: "Slide 1: «Tu perfil espanta seguidores (y no lo sabes)».\nSlides 2-6: un fallo por slide (bio genérica, foto, destacados sin orden, sin CTA, feed incoherente).\nÚltimo slide: CTA «Guarda y arrégla el tuyo hoy».",
  },
  {
    publish_date: "2026-08-20", category: "Lead magnet", objective: "Captación", product: "Guía 7 pasos", status: S,
    content: "Lead magnet (jueves): Guía 'Monetiza tu perfil en 7 pasos'. CTA comenta la palabra.",
    copy: "Quieres monetizar tu perfil pero no sabes por dónde empezar. 🤔\nGuía de 7 pasos GRATIS.\nComenta «GUÍA» y te la mando por DM. 📩",
    script: "Gancho: «¿Tienes seguidores pero cero ventas? Te falta esto.»\nDesarrollo: enseña la portada de la guía y 2 pasos clave.\nCTA claro: «Comenta GUÍA y te la envío por DM.»",
  },
  {
    publish_date: "2026-08-21", category: "Testimonio", objective: "Prueba social", product: "Servicio Amplify", status: S,
    content: "Caso real 0→10k en 60 días.",
    copy: "Hace 2 meses no llegaba a 500 cuentas. Hoy: 10k y clientes cada semana. 🔥\nEsto es lo que cambiamos con [cliente]. 👇",
    script: "Gancho: «De 0 a 10k en 60 días, sin pagar publicidad.»\nDesarrollo: 3 cosas concretas que cambiamos (nicho, ganchos, cadencia).\nCTA: «¿Quieres esto para tu cuenta? Escríbenos.»",
  },
  {
    publish_date: "2026-08-22", category: "Lead magnet", objective: "Captación", product: "Checklist", status: S,
    content: "Lead magnet (sábado): Checklist 'Perfil que convierte'. CTA comenta la palabra.",
    copy: "Optimiza tu perfil en 10 minutos. ✅\nChecklist gratis para dejarlo listo para vender.\nComenta «PERFIL» y te lo mando. 📩",
    script: "Gancho: «Tu perfil pierde ventas por estos 8 detalles.»\nDesarrollo: enseña el checklist y marca 2-3 puntos en directo.\nCTA: «Comenta PERFIL y te paso el checklist completo.»",
  },
  {
    publish_date: "2026-08-24", category: "Reel", objective: "Alcance", product: "Contenido orgánico", status: S,
    content: "El error que mata tu alcance (teaser).",
    copy: "El 90% comete ESTE error al publicar… y el algoritmo te penaliza sin avisar. Te lo cuento en 20s. ⏱️",
    script: "Gancho: «Estás matando tu alcance con este error.»\nDesarrollo: el error (publicar y no responder los primeros 30 min) + qué hacer.\nCTA: «Sígueme para más trucos de alcance.»",
  },
  {
    publish_date: "2026-08-25", category: "Reel", objective: "Autoridad", product: "Contenido orgánico", status: S,
    content: "3 formas de monetizar con pocos seguidores.",
    copy: "No necesitas 100k para vivir de esto. 💸\n3 formas de monetizar con menos de 5k seguidores 👇",
    script: "Gancho: «Con 3.000 seguidores ya puedes facturar.»\nDesarrollo: 3 vías (servicios, afiliación, producto digital) con ejemplo.\nCTA: «Guarda y empieza por la 1.»",
  },
  {
    publish_date: "2026-08-26", category: "Carrusel", objective: "Autoridad", product: "Contenido orgánico", status: S,
    content: "El plan de contenido semanal que convierte.",
    copy: "Publicar por publicar no sirve. 📆\nAsí es la semana de contenido que convierte seguidores en clientes. Desliza 👉",
    script: "Slide 1: «Tu semana de contenido, ordenada».\nSlides: lun teaser, mar/mié valor, jue/sáb lead magnet, vie prueba social.\nCTA: «Guarda esta plantilla.»",
  },
  {
    publish_date: "2026-08-27", category: "Lead magnet", objective: "Captación", product: "Plantilla", status: S,
    content: "Lead magnet (jueves): Plantilla 'Calendario de contenido'. CTA comenta la palabra.",
    copy: "Deja de improvisar tus publicaciones. 🗓️\nPlantilla de calendario de contenido GRATIS.\nComenta «PLAN» y te la mando. 📩",
    script: "Gancho: «Planifica un mes de contenido en 1 hora.»\nDesarrollo: enseña la plantilla y cómo rellenarla.\nCTA: «Comenta PLAN y te la envío por DM.»",
  },
  {
    publish_date: "2026-08-28", category: "Behind the scenes", objective: "Cercanía", product: "Servicio Amplify", status: S,
    content: "Un día montando la estrategia de un cliente.",
    copy: "Entre bambalinas: así montamos la estrategia de RRSS de un cliente desde 0. 🎬\nSpoiler: no es magia, es sistema.",
    script: "Gancho: «Así trabajamos una cuenta desde cero.»\nDesarrollo: grabación del proceso (research, pilares, calendario).\nCTA: «¿Quieres esto para tu marca? Escríbenos.»",
  },
  {
    publish_date: "2026-08-29", category: "Lead magnet", objective: "Captación", product: "Guía algoritmo", status: S,
    content: "Lead magnet (sábado): Guía 'Cambios del algoritmo 2026'. CTA comenta la palabra.",
    copy: "El algoritmo ha cambiado (otra vez). 🔄\nGuía gratis con lo que SÍ funciona ahora.\nComenta «ALGO» y te la mando. 📩",
    script: "Gancho: «Lo que funcionaba en enero, hoy te hunde.»\nDesarrollo: 3 cambios clave del algoritmo y cómo adaptarte.\nCTA: «Comenta ALGO y te paso la guía.»",
  },
  {
    publish_date: "2026-08-31", category: "Reel", objective: "Alcance", product: "Contenido orgánico", status: S,
    content: "Teaser de septiembre.",
    copy: "Septiembre viene fuerte 🚀. Te adelanto lo que vamos a hacer para duplicar tu alcance. Sígueme para no perdértelo.",
    script: "Gancho: «Septiembre lo vamos a petar, y te llevo conmigo.»\nDesarrollo: adelanto de 2-3 temas del mes.\nCTA: «Dale a seguir para no perderte nada.»",
  },
];

// Borra las de agosto 2026 antes de recargar (evita duplicados)
await admin
  .from("social_posts")
  .delete()
  .gte("publish_date", "2026-08-01")
  .lte("publish_date", "2026-08-31");

const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} publicaciones de agosto (con guiones) cargadas`);
