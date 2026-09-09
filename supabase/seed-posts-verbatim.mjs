// Vuelca el texto LITERAL del Word de posts (guion foto a foto) por fecha.
// Ejecutar: node supabase/seed-posts-verbatim.mjs
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

const G = {
  "2026-08-19": `DUPLICADO 1
inspiracion https://www.instagram.com/p/DXzQG9tgsou/?igsi=eDQ5aTNheTdwNzli
FOTO 1 lo que me dijeron que era el éxito:
1. conseguir 100k seguidores
2. publicar todos los días sin falta
3. crear contenido perfecto
FOTO 2 espera un segundo. eso tampoco es lo que quiero
FOTO 3 lo que quiero:
publicar algo que cambie cómo piensa alguien construir una audiencia que confíe en mí vivir de lo que creo. no de lo que me piden`,
  "2026-08-21": `DUPLICADO 2
inspo https://www.instagram.com/p/DXmgraTjJoK/?igsi=OHo4dGI0YW0yNm11
FOTO 1 no tengo miedo a decir que llevar meses publicando sin ver resultados destroza la motivación
FOTO 2 hasta que entiendes que los primeros 30 videos son el precio de entrada. no el fracaso
FOTO 3 hasta que te das cuenta de que todo el mundo parece un idiota hablando a 100 seguidores
FOTO 4 hasta que ese contenido que publicaste sin esperar nada le cambia el día a alguien
FOTO 5 hasta que ves los resultados de seguir cuando todos los demás pararon
FOTO 6 hasta que entiendes que no ibas tarde. solo estabas empezando
FOTO 7 y que todo el contenido que hiciste en silencio siempre se va a sentir que valió la pena
FOTO 8 los que te juzgan por no crecer rápido serán los mismos que luego te preguntarán cómo lo hiciste`,
  "2026-08-26": `DUPLICADO 3
FOTO 1 la mayoría espera tener todo listo para empezar a publicar
FOTO 2 el nicho perfecto no llega pensando. llega publicando
FOTO 3 el video que más miedo te da publicar suele ser el que más conecta
FOTO 4 no necesitas más seguidores. necesitas los seguidores correctos
FOTO 5 puedes cambiar de enfoque sin traicionar lo que construiste. eso es evolucionar
FOTO 6 empieza ahora`,
  "2026-08-28": `GUIÓN 1 — FORMATO CONTRASTE (nuevo tema: tener viralidad pero sin clientes)
FOTO 1
lo que creía que pasaría cuando llegara a 10.000 seguidores:
1. los clientes llegarían solos
2. las marcas me escribirían
3. el dinero aparecería
FOTO 2 espera un segundo. nada de eso pasó
FOTO 3 lo que aprendí:
Instagram no pagan facturas la confianza sí y la confianza se construye antes de los 10K`,
  "2026-09-02": `GUIÓN 2 — FORMATO HASTA QUE
FOTO 1 no tengo miedo a decir que hay días que no sé de qué publicar
FOTO 2 hasta que recuerdas que tu vida entera es contenido que alguien necesita ver
FOTO 3 hasta que ves que la pregunta que te hicieron en comentarios es tu próximo video
FOTO 4 hasta que entiendes que documentar es más poderoso que enseñar
FOTO 5 hasta que publicas algo de tu proceso y alguien te escribe "yo también estoy ahí"
FOTO 6 hasta que te das cuenta de que nunca más te quedarás sin ideas
FOTO 7 la inspiración no llega esperándola. llega publicando`,
  "2026-09-04": `GUIÓN 3 — FORMATO FRASES SUELTAS
FOTO 1 si llevas meses creciendo 5 seguidores al día. eso no es fracaso en cambio es construir
FOTO 2 el que publica cuando tiene ganas nunca llega a ningún lado
FOTO 3 el que publica aunque no tenga ganas construye algo que dura
FOTO 4 tus primeros 100 videos no son para el algoritmo. son para ti
FOTO 5 el día que dejes de comparar tu capítulo 1 con el capítulo 10 de otro, todo cambia
FOTO 6 sigue`,
  "2026-09-09": `GUIÓN 4 — FORMATO HASTA QUE
FOTO 1 no tengo miedo a decir que tener miedo a salir en cámara es completamente normal
FOTO 2 hasta que te das cuenta de que todo el mundo parecía un idiota al principio
FOTO 3 hasta que publicas el primer video y ves que el mundo no se acaba
FOTO 4 hasta que alguien te escribe "gracias por esto"
FOTO 5 hasta que entiendes que la cámara no te juzga. la gente tampoco
FOTO 6 hasta que publicar en cámara se vuelve lo más normal del mundo
FOTO 7 el miedo a la cámara no desaparece. simplemente deja de importar`,
  "2026-09-11": `GUIÓN 5 — FORMATO CONTRASTE
FOTO 1 lo que pensaba que necesitaba para empezar a crear contenido:
1. un setup profesional
2. miles de seguidores de partida
3. saber exactamente qué decir
FOTO 2 lo que necesitaba en realidad:
un móvil algo que contar empezar`,
  "2026-09-16": `GUIÓN 6 — FORMATO FRASES SUELTAS
FOTO 1 el scroll te cambia sin que te des cuenta
FOTO 2 no recuerdas el video que viste hace 5 minutos. pero sí te queda lo que empezó a parecerte normal
FOTO 3 la casa. el cuerpo. el dinero. el estilo de vida. las opiniones
FOTO 4 cuida lo que consumes. se convierte en lo que deseas
FOTO 5 y ten cuidado con a quién sigues. te conviertes en el promedio de lo que ves
FOTO 6 no eres lo que comes. eres lo que consumes`,
  "2026-09-18": `GUIÓN 7 — FORMATO HASTA QUE
FOTO 1 no tengo miedo a decir que monetizar en redes es más difícil de lo que parece desde fuera
FOTO 2 hasta que entiendes que los seguidores no son el negocio. la confianza es el negocio
FOTO 3 hasta que ves que 1.000 personas comprometidas valen más que 100.000 que te ignoran
FOTO 4 hasta que dejas de intentar vender y empiezas a intentar ayudar
FOTO 5 hasta que tu primer cliente llega no de un anuncio. de 30 días de contenido consistente
FOTO 6 hasta que te das cuenta de que construir una marca personal era construir un negocio
FOTO 7 vender no es manipular. es conectar a alguien con la solución que ya está buscando`,
  "2026-09-23": `GUIÓN 8 — FORMATO FRASES SUELTAS
FOTO 1 el experto tiene autoridad. el principiante tiene historias
FOTO 2 no necesitas ser el mejor del mundo en algo para empezar a crear contenido sobre ello
FOTO 3 solo necesitas estar un paso más adelante que la persona a la que quieres ayudar
FOTO 4 si todavía estás construyendo → documenta. si ya tienes resultados → enseña. los dos funcionan
FOTO 5 lo que no funciona es fingir ser experto cuando estás empezando
FOTO 6 tu proceso es suficiente. empieza a contarlo`,
  "2026-09-25": `GUIÓN 9 — FORMATO CONTRASTE
FOTO 1 lo que creía que era una marca personal:
1. un logo bonito
2. un feed estético
3. miles de seguidores
FOTO 2 lo que es en realidad:
la razón por la que alguien elegiría escucharte a ti y no a cualquier otro
FOTO 3 eso no se construye con diseño. se construye con consistencia. con autenticidad. con tiempo`,
  "2026-09-30": `GUIÓN 10 — FORMATO HASTA QUE
FOTO 1 no tengo miedo a decir que al principio no sabía qué me hacía diferente a los demás
FOTO 2 hasta que entendí que nadie tiene mi combinación exacta de historia experiencia y perspectiva
FOTO 3 hasta que dejé de intentar parecerme a los creadores que admiraba
FOTO 4 hasta que empecé a contar lo que yo había vivido de verdad
FOTO 5 hasta que alguien me dijo "nunca había visto esto explicado así"
FOTO 6 hasta que entendí que mi mayor ventaja competitiva era ser yo
FOTO 7 nadie puede copiarte la vida. úsala`,
};

let n = 0;
for (const [date, script] of Object.entries(G)) {
  const { error } = await admin
    .from("social_posts")
    .update({ script })
    .eq("kind", "publicacion")
    .eq("publish_date", date);
  if (error) console.error(date, error.message);
  else n++;
}
console.log(`✓ ${n} guiones de posts volcados literalmente`);
