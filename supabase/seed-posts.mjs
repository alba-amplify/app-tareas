// Sustituye el contenido del feed (publicaciones) por los 13 guiones de carrusel del doc.
// Ejecutar: node supabase/seed-posts.mjs
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

const P = (publish_date, category, copy, script, inspiration = "") => ({
  publish_date, category, copy, script, inspiration,
  kind: "publicacion", format: "Carrusel", status: "FALTA CONTENIDO",
  product: "Contenido orgánico", objective: category,
});

const posts = [
  P("2026-08-19","Mentalidad",
    "Lo que me dijeron que era el éxito vs. lo que quiero de verdad.",
    "FOTO 1 — Lo que me dijeron que era el éxito:\n1. conseguir 100k seguidores\n2. publicar todos los días sin falta\n3. crear contenido perfecto\nFOTO 2 — espera un segundo. eso tampoco es lo que quiero\nFOTO 3 — lo que quiero: publicar algo que cambie cómo piensa alguien, construir una audiencia que confíe en mí, vivir de lo que creo, no de lo que me piden.",
    "https://www.instagram.com/p/DXzQG9tgsou/"),
  P("2026-08-21","Mentalidad",
    "Publicar meses sin resultados no es fracaso, es el precio de entrada.",
    "FOTO 1 — no tengo miedo a decir que llevar meses publicando sin ver resultados destroza la motivación\nFOTO 2 — hasta que entiendes que los primeros 30 videos son el precio de entrada, no el fracaso\nFOTO 3 — hasta que te das cuenta de que todo el mundo parece un idiota hablando a 100 seguidores\nFOTO 4 — hasta que ese contenido que publicaste sin esperar nada le cambia el día a alguien\nFOTO 5 — hasta que ves los resultados de seguir cuando todos los demás pararon\nFOTO 6 — hasta que entiendes que no ibas tarde, solo estabas empezando\nFOTO 7 — y que todo el contenido que hiciste en silencio siempre se va a sentir que valió la pena\nFOTO 8 — los que te juzgan por no crecer rápido serán los mismos que luego te preguntarán cómo lo hiciste",
    "https://www.instagram.com/p/DXmgraTjJoK/"),
  P("2026-08-26","Mentalidad",
    "No necesitas tenerlo todo listo. Empieza publicando.",
    "FOTO 1 — la mayoría espera tener todo listo para empezar a publicar\nFOTO 2 — el nicho perfecto no llega pensando, llega publicando\nFOTO 3 — el video que más miedo te da publicar suele ser el que más conecta\nFOTO 4 — no necesitas más seguidores, necesitas los seguidores correctos\nFOTO 5 — puedes cambiar de enfoque sin traicionar lo que construiste, eso es evolucionar\nFOTO 6 — empieza ahora"),
  P("2026-08-28","Conversión",
    "10.000 seguidores no pagan facturas. La confianza sí.",
    "FOTO 1 — lo que creía que pasaría cuando llegara a 10.000 seguidores:\n1. los clientes llegarían solos\n2. las marcas me escribirían\n3. el dinero aparecería\nFOTO 2 — espera un segundo, nada de eso pasó\nFOTO 3 — lo que aprendí: Instagram no paga facturas, la confianza sí, y la confianza se construye antes de los 10K"),
  P("2026-09-02","Autoridad",
    "Nunca más te quedarás sin ideas.",
    "FOTO 1 — no tengo miedo a decir que hay días que no sé de qué publicar\nFOTO 2 — hasta que recuerdas que tu vida entera es contenido que alguien necesita ver\nFOTO 3 — hasta que ves que la pregunta que te hicieron en comentarios es tu próximo video\nFOTO 4 — hasta que entiendes que documentar es más poderoso que enseñar\nFOTO 5 — hasta que publicas algo de tu proceso y alguien te escribe «yo también estoy ahí»\nFOTO 6 — hasta que te das cuenta de que nunca más te quedarás sin ideas\nFOTO 7 — la inspiración no llega esperándola, llega publicando"),
  P("2026-09-04","Mentalidad",
    "Crecer despacio no es fracaso, es construir.",
    "FOTO 1 — si llevas meses creciendo 5 seguidores al día, eso no es fracaso, es construir\nFOTO 2 — el que publica cuando tiene ganas nunca llega a ningún lado\nFOTO 3 — el que publica aunque no tenga ganas construye algo que dura\nFOTO 4 — tus primeros 100 videos no son para el algoritmo, son para ti\nFOTO 5 — el día que dejes de comparar tu capítulo 1 con el capítulo 10 de otro, todo cambia\nFOTO 6 — sigue"),
  P("2026-09-09","Mentalidad",
    "El miedo a la cámara no desaparece; deja de importar.",
    "FOTO 1 — no tengo miedo a decir que tener miedo a salir en cámara es completamente normal\nFOTO 2 — hasta que te das cuenta de que todo el mundo parecía un idiota al principio\nFOTO 3 — hasta que publicas el primer video y ves que el mundo no se acaba\nFOTO 4 — hasta que alguien te escribe «gracias por esto»\nFOTO 5 — hasta que entiendes que la cámara no te juzga, la gente tampoco\nFOTO 6 — hasta que publicar en cámara se vuelve lo más normal del mundo\nFOTO 7 — el miedo a la cámara no desaparece, simplemente deja de importar"),
  P("2026-09-11","Mentalidad",
    "Lo que creía que necesitaba vs. lo que necesitaba de verdad.",
    "FOTO 1 — lo que pensaba que necesitaba para empezar a crear contenido:\n1. un setup profesional\n2. miles de seguidores de partida\n3. saber exactamente qué decir\nFOTO 2 — lo que necesitaba en realidad: un móvil, algo que contar, empezar"),
  P("2026-09-16","Lifestyle",
    "Eres lo que consumes.",
    "FOTO 1 — el scroll te cambia sin que te des cuenta\nFOTO 2 — no recuerdas el video que viste hace 5 minutos, pero sí te queda lo que empezó a parecerte normal\nFOTO 3 — la casa, el cuerpo, el dinero, el estilo de vida, las opiniones\nFOTO 4 — cuida lo que consumes, se convierte en lo que deseas\nFOTO 5 — y ten cuidado con a quién sigues, te conviertes en el promedio de lo que ves\nFOTO 6 — no eres lo que comes, eres lo que consumes"),
  P("2026-09-18","Conversión",
    "Los seguidores no son el negocio. La confianza sí.",
    "FOTO 1 — no tengo miedo a decir que monetizar en redes es más difícil de lo que parece desde fuera\nFOTO 2 — hasta que entiendes que los seguidores no son el negocio, la confianza es el negocio\nFOTO 3 — hasta que ves que 1.000 personas comprometidas valen más que 100.000 que te ignoran\nFOTO 4 — hasta que dejas de intentar vender y empiezas a intentar ayudar\nFOTO 5 — hasta que tu primer cliente llega no de un anuncio, de 30 días de contenido consistente\nFOTO 6 — hasta que te das cuenta de que construir una marca personal era construir un negocio\nFOTO 7 — vender no es manipular, es conectar a alguien con la solución que ya está buscando"),
  P("2026-09-23","Autoridad",
    "Tu proceso es suficiente. Empieza a contarlo.",
    "FOTO 1 — el experto tiene autoridad, el principiante tiene historias\nFOTO 2 — no necesitas ser el mejor del mundo en algo para empezar a crear contenido sobre ello\nFOTO 3 — solo necesitas estar un paso más adelante que la persona a la que quieres ayudar\nFOTO 4 — si todavía estás construyendo → documenta; si ya tienes resultados → enseña; los dos funcionan\nFOTO 5 — lo que no funciona es fingir ser experto cuando estás empezando\nFOTO 6 — tu proceso es suficiente, empieza a contarlo"),
  P("2026-09-25","Autoridad",
    "Marca personal no es un logo. Es por qué te eligen a ti.",
    "FOTO 1 — lo que creía que era una marca personal:\n1. un logo bonito\n2. un feed estético\n3. miles de seguidores\nFOTO 2 — lo que es en realidad: la razón por la que alguien elegiría escucharte a ti y no a cualquier otro\nFOTO 3 — eso no se construye con diseño, se construye con consistencia, con autenticidad, con tiempo"),
  P("2026-09-30","Autoridad",
    "Nadie puede copiarte la vida. Úsala.",
    "FOTO 1 — no tengo miedo a decir que al principio no sabía qué me hacía diferente a los demás\nFOTO 2 — hasta que entendí que nadie tiene mi combinación exacta de historia, experiencia y perspectiva\nFOTO 3 — hasta que dejé de intentar parecerme a los creadores que admiraba\nFOTO 4 — hasta que empecé a contar lo que yo había vivido de verdad\nFOTO 5 — hasta que alguien me dijo «nunca había visto esto explicado así»\nFOTO 6 — hasta que entendí que mi mayor ventaja competitiva era ser yo\nFOTO 7 — nadie puede copiarte la vida, úsala"),
];

await admin.from("social_posts").delete()
  .eq("kind", "publicacion").gte("publish_date", "2026-08-01").lte("publish_date", "2026-09-30");
const { error } = await admin.from("social_posts").insert(posts);
if (error) console.error("✗", error.message);
else console.log(`✓ ${posts.length} carruseles del feed cargados (según el doc)`);
