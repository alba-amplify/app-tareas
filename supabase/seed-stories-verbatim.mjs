// Vuelca el contenido LITERAL del documento de Stories, por fecha.
// Ejecutar: node supabase/seed-stories-verbatim.mjs
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

const PDF_CRECER = `PDF — "POR QUÉ TUS VÍDEOS VIRALES NO TE HACEN CRECER"
Slide 1 — Portada: "POR QUÉ TUS VÍDEOS VIRALES NO TE HACEN CRECER — Cómo convertir vistas en seguidores de verdad." (misma prueba social de siempre: tu perfil + colabs de marca)
Slide 2 — Reencuadre: "Una vista no es un seguidor. Ni un millón de vistas las convierte en comunidad." La vista es solo la puerta; la relación todavía no ha empezado. → "El vídeo que más gente ve no siempre es el que más te acerca a tu audiencia real."
Slide 3 — Framework (3 palancas): CURIOSIDAD RESUELTA (el vídeo respondió algo concreto) · IDENTIDAD RECONOCIBLE (¿queda claro quién eres, o solo se recuerda el clip?) · RAZÓN PARA VOLVER (¿por qué quedarse a ver más?). → "Si te falta una, el vídeo entretiene pero no construye nada."
Slide 4 — Diagnóstico: "Mucha gente cree que su problema es de alcance. Tiene un problema de conversión de espectador a seguidor: te ven → no saben quién eres → se van. Y eso pasa aunque el vídeo llegue a millones."
Slide 5 — Viral vs. storytelling: Un vídeo de trend trae gente que busca el trend, no a ti — se va igual de rápido. Un vídeo de storytelling personal trae menos vistas, pero gente que se queda porque conectó contigo.
Slide 6 — 3 señales de que tu perfil no retiene: bio que no dice quién eres · sin "siguiente paso" claro (destacadas, posts fijados) · el resto del feed no se parece al vídeo que los trajo.
Slide 7 — Objeción emocional: dejar de perseguir solo el pico de vistas da miedo, parece "quedarse atrás". Realidad: un pico viral sin identidad clara se pierde en cuanto baja el algoritmo — la identidad es lo único que no depende de un golpe de suerte.
Slide 8 — El ciclo: publicar contenido con identidad clara → medir seguidores ganados (no solo vistas) → ajustar el mensaje → repetir.
Slide 9 — Consistencia como sistema: la relación se construye con exposición repetida a la misma persona y mensaje, no con un vídeo grande suelto.
Slide 10 — Advertencia: perseguir tendencias sin conexión real con tu mensaje = "vídeo random que no dice nada de ti".
Slide 11 — Checklist: ¿Mi vídeo deja claro quién soy, no solo qué pasó? / ¿Alguien nuevo entendería mi perfil en 5 segundos? / ¿Estoy documentando algo repetible, no cazando un pico? / ¿Mido seguidores ganados, no solo vistas?
Slide 12 — CTA: "¿Quieres construir una marca personal que no dependa de un solo vídeo viral? He preparado un vídeo donde te explico cómo trabajamos esto dentro de Amplify. Pulsa aquí para verlo."`;

const PDF_PRODUCTO = `PDF — "CÓMO MONETIZAR TU MARCA PERSONAL CON UN PRODUCTO DIGITAL"
Slide 1 — Portada: "CÓMO MONETIZAR TU MARCA PERSONAL CON UN PRODUCTO DIGITAL — Sin depender de marcas, colaboraciones ni audiencias gigantes." (misma prueba social de siempre)
Slide 2 — Reencuadre: "No hace falta 100.000 seguidores para monetizar. Hace falta algo concreto que tu audiencia pueda comprar." → "La audiencia sin oferta no genera ingresos, por grande que sea."
Slide 3 — Framework (3 pilares): CLARIDAD DE LA OFERTA (qué resuelve exactamente, para quién) · ACCESIBILIDAD (que se pueda comprar sin fricción: precio y formato simples) · CONFIANZA PREVIA (que tu contenido ya haya demostrado que sabes del tema). → "Si te falta una, por mucha audiencia que tengas, no vas a vender."
Slide 4 — Diagnóstico: "Mucha gente cree que su problema es 'tener pocos seguidores'. El problema real es no tener nada que vender todavía, o tenerlo y no comunicarlo con claridad."
Slide 5 — Qué es un producto digital: un ebook/guía, una plantilla, un mini-curso, un checklist o framework, una comunidad de pago — algo que se entrega sin tu tiempo 1:1.
Slide 6 — Cómo elegir qué crear primero: a partir de la pregunta que más se repite en tus DMs y comentarios — no inventar un tema aparte de lo que tu audiencia ya te pregunta.
Slide 7 — Objeción emocional: vender se siente forzado o incómodo. Reencuadre: vender es ofrecer una solución a alguien que ya tiene el problema — lo incómodo no es vender, es vender sin haber generado antes suficiente confianza.
Slide 8 — El ciclo: contenido de valor gratis sobre el tema → detectar quién pregunta por más → ofrecer el producto como el siguiente paso natural → repetir.
Slide 9 — Consistencia como sistema: un producto digital no se vende con un solo post — se vende con exposición repetida a la misma oferta, en distintos formatos.
Slide 10 — Advertencia de nicho: no crear un producto "para todo el mundo" — cuanto más específico el problema que resuelve, más fácil de vender aunque la audiencia sea pequeña.
Slide 11 — Checklist: ¿Tengo claro qué problema resuelve mi producto? / ¿Es fácil de comprar? / ¿Mi contenido ya generó confianza sobre esto? / ¿Lo estoy ofreciendo de forma repetida, no solo una vez?
Slide 12 — CTA: "¿Quieres construir una oferta que puedas vender desde tu marca personal? He preparado un vídeo donde te explico cómo trabajamos esto dentro de Amplify. Pulsa aquí para verlo."`;

const updates = [
  {
    date: "2026-08-29",
    script: `SÁBADO — RESULTADOS / WINS
PILAR: Autoridad
FORMATO: variante 3 (un resultado por story, casos_reales.md)

STORY 1: Hook relajado — "Así de contento estoy viendo los resultados de esta semana de los alumnos de Amplify"
STORY 2: "Irantzu volvió a subir contenido después de meses de pausa (cosa que no recomiendo)... y de sus últimos 6 reels, más de la mitad se han vuelto virales" — captura de su post: https://amplify-spanish.circle.so/c/resultados/reels-de-prueba-3m-views-y-1-213-seguidores
STORY 3: "Pablo consiguió su primer vídeo con 100.000 views — ni él se lo esperaba" — captura de su post: https://amplify-spanish.circle.so/c/resultados
STORY 4: "Yohany lleva 1 año en Amplify creando sobre danza folclórica, y esta semana llegó a más de 1 millón de views y 900 seguidores nuevos con carruseles" — captura de su post: https://amplify-spanish.circle.so/c/resultados
STORY 5: "Kiara cerró su primera venta de 1.500€ esta semana, y está a punto de llegar a los 11.000 en Instagram ganando 100 seguidores al día. Hace unos meses estaba perdida sin rumbo en redes — mirad ahora" — captura de su post: https://amplify-spanish.circle.so/c/resultados
STORY 6: "Y esta es de las que más me ha gustado: Angel Luis vio un formato que le había funcionado a otro alumno del grupo, lo copió, y en un solo día consiguió 200 seguidores nuevos y más de 10 ventas de su producto" — captura de su post: https://amplify-spanish.circle.so/c/resultados
STORY 7: Cierre + CTA — "La única diferencia entre ellos y tú es que tomaron acción. Si quieres conseguir este tipo de resultados escríbeme la palabra AMPLIFY."
o (vídeo hablando): "Así que si llevas tiempo dándole vueltas a esto pero nunca acabas de dar el paso, quiero que sepas algo: ninguno de ellos empezó sabiendo exactamente qué decir, cómo grabar o qué iba a funcionar. Lo fueron descubriendo por el camino, con un grupo al lado que va en la misma dirección y un sistema que los fue guiando paso a paso. Así que si esto es algo que llevas queriendo hacer, deja de esperar al momento perfecto: escríbeme la palabra AMPLIFY y te cuento exactamente cómo funciona por dentro, sin compromiso ninguno" — https://f.io/PWvxwzpn

CTA FINAL: palabra clave AMPLIFY (venta directa al programa)
RECURSO NECESARIO: ninguno — capturas reales de cada post ya disponibles en Circle`,
  },
  {
    date: "2026-08-31",
    script: `LUNES — CALENTAMIENTO
PILAR: Nicho
DOLOR/IDEA TRABAJADA: dolores_alumnos.md #3 — "vistas altas que no se traducen en seguidores nuevos"

STORY 1: Hook de observación — "Llevo tiempo viendo un patrón raro en las cuentas de Amplify..."
STORY 2: Nombra el problema — "Hay gente con vídeos de millones de vistas que apenas ganan seguidores. Y gente con vistas normales que crece muchísimo." — foto/texto
STORY 3: La causa real — "Las vistas dependen del algoritmo probando tu vídeo con desconocidos. Los seguidores dependen de si esa persona decide quedarse." — foto/texto
STORY 4: Reencuadre — "Por eso un vídeo viral no es el objetivo. El objetivo es que la persona sienta que quiere ver el siguiente." — foto/texto
STORY 5: Teaser del jueves — "Esta semana os voy a enseñar exactamente qué hace que alguien decida seguirte después de ver un solo vídeo." — selfie

CTA FINAL: ninguno (cierra en intriga, no en venta)`,
  },
  {
    date: "2026-09-03",
    script: `JUEVES 3 — CTA / REGALO
PILAR: Venta
DOLOR/IDEA TRABAJADA: mismo dolor #3, resuelto

STORY 1: Hook de intriga/travesura (plantilla confirmada): "Mi equipo me va a matar por hacer esto pero me da igual"
STORY 2: Presentación del PDF ligado al dolor: "He preparado un PDF en el que explico por qué tus vídeos más vistos no son los que más te hacen crecer, y qué hacer en su lugar"
STORY 3: preview de la foto del PDF (tarjeta AMPLIFY2.0 + dato de transformación visual si hay uno real disponible)
STORY 4: CTA a DM con palabra clave: "Escríbeme la palabra CRECER y te lo envío por privado"

CTA FINAL: palabra clave CRECER
RECURSO NECESARIO: PDF nuevo`,
    content: PDF_CRECER,
  },
  {
    date: "2026-09-05",
    script: `SÁBADO 5 — A LA ESPERA DE NUEVOS RESULTADOS`,
  },
  {
    date: "2026-09-07",
    script: `LUNES 7 — CALENTAMIENTO
PILAR: Nicho
DOLOR/IDEA TRABAJADA: dolores_alumnos.md #7 — "creer que hace falta muchísima audiencia para monetizar"

STORY 1: Hook (talking head) — "Hay una creencia que frena a más gente de la que os imagináis a la hora de lanzarse a esto."
STORY 2: Nombra la creencia — "Piensan que necesitan 200.000 seguidores, o un vídeo que lo cambie todo de golpe, para poder vivir de esto." — foto/texto
STORY 3: Contraste real (frase reutilizable de la propia comunidad) — "Y la realidad es que conozco gente con 5.000 seguidores viviendo de las redes, y creadores con 150.000 que todavía no lo consiguen." — foto/texto
STORY 4: La causa real — "La diferencia no es el tamaño de la audiencia. Es si esa audiencia sabe qué le estás ofreciendo y cómo comprarlo." — foto/texto
STORY 5: Teaser del jueves — "Esta semana os enseño exactamente cómo montar eso, aunque tu cuenta sea pequeña todavía." — selfie

CTA FINAL: ninguno
RECURSO NECESARIO: ninguno todavía`,
  },
  {
    date: "2026-09-10",
    script: `JUEVES 10 — CTA PDF
PILAR: Venta

STORY 1 (hook, variando): "Llevaba semanas queriendo hacer esto y hoy por fin me he puesto."
STORY 2: "He preparado un PDF en el que aprenderás a monetizar tu Marca Personal sin depender de marcas, colaboraciones ni nada de eso"
STORY 3: Autoridad + preview visual del PDF (tarjeta AMPLIFY2.0 ya existente)
STORY 4: "Escríbeme la palabra PRODUCTO y te lo envío por privado"

CTA FINAL: palabra clave PRODUCTO
RECURSO NECESARIO: PDF`,
    content: PDF_PRODUCTO,
  },
  {
    date: "2026-09-12",
    script: `SÁBADO 12 — RESULTADOS / WINS
PILAR: Autoridad
FORMATO: variante 3 (un resultado por story) — casos de monetización con audiencias que no eran gigantes

STORY 1: Hook relajado — "Esta semana os traigo resultados que tienen algo en común: ninguno tenía una audiencia enorme cuando esto pasó"
STORY 2: "Borja empezó de cero — cero seguidores, nunca había hablado a cámara. Meses después: casi 30.000 seguidores y casi 30.000€ facturados"
STORY 3: "Rocío en 16 días hizo 8.000€ de facturación — fue su primer mes viviendo al 100% de su marca personal"
STORY 4: "Nacho, a los 2 meses en Amplify, ya tenía su primera charla remunerada y dos infoproductos propios en marcha"
STORY 5: "Y Claudia hoy vive de su marca personal — más de 22 clientes en su programa, colaboraciones con Dr. Franklin, Fila y una marca de matcha"
STORY 6 (talking head, cierre): "Ninguno de ellos esperó a tener 100.000 seguidores para monetizar. Empezaron con lo que tenían y construyeron el sistema por el camino. Si quieres hacer lo mismo, escríbeme la palabra AMPLIFY y te cuento cómo funciona por dentro."

CTA FINAL: palabra clave AMPLIFY
RECURSO NECESARIO: ninguno — casos ya en casos_reales.md`,
  },
];

let n = 0;
for (const u of updates) {
  const patch = { script: u.script };
  if (u.content) patch.content = u.content;
  const { error } = await admin
    .from("social_posts")
    .update(patch)
    .eq("kind", "story")
    .eq("publish_date", u.date);
  if (error) console.error(u.date, error.message);
  else n++;
}
console.log(`✓ ${n} stories volcadas literalmente`);
