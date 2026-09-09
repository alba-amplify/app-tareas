// Estrategia de Stories (misma estructura del doc) para resto de septiembre (desde 14) y octubre.
// Contenido en el campo "content" (no en script). Ejecutar: node supabase/seed-stories-oct.mjs
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

// --- Generadores con la estructura del SOP ---
const cal = (dolor, hook, problema, causa, reencuadre, teaser) =>
`LUNES — CALENTAMIENTO
PILAR: Nicho
DOLOR/IDEA TRABAJADA: ${dolor}

STORY 1: Hook de observación — "${hook}"
STORY 2: Nombra el problema — "${problema}"
STORY 3: La causa real — "${causa}"
STORY 4: Reencuadre — "${reencuadre}"
STORY 5: Teaser del jueves — "${teaser}"

CTA FINAL: ninguno (cierra en intriga, no en venta)`;

const pdf = (title, reencuadre, p1, p2, p3, diag, checklist, cta) =>
`PDF — "${title}"
Slide 1 — Portada: "${title}" (misma prueba social de siempre: tu perfil + colabs de marca)
Slide 2 — Reencuadre: ${reencuadre}
Slide 3 — Framework (3 palancas): ${p1} · ${p2} · ${p3}
Slide 4 — Diagnóstico: ${diag}
Slide 5 — Ejemplo/contraste del error frente al enfoque correcto
Slide 6 — 3 señales de que lo estás haciendo mal
Slide 7 — Objeción emocional (por qué cuesta cambiarlo) y su reencuadre
Slide 8 — El ciclo/sistema paso a paso para aplicarlo
Slide 9 — Consistencia como sistema (se construye con repetición, no de golpe)
Slide 10 — Advertencia de nicho / error común a evitar
Slide 11 — Checklist: ${checklist}
Slide 12 — CTA: "${cta}"`;

const cta = (title, palabra, pdfBody) =>
`JUEVES — CTA / REGALO
PILAR: Venta

STORY 1: Hook de intriga/travesura — "Mi equipo me va a matar por hacer esto pero me da igual"
STORY 2: Presentación del PDF ligado al dolor de la semana — "He preparado un PDF: ${title}"
STORY 3: preview de la foto del PDF (tarjeta AMPLIFY2.0)
STORY 4: CTA a DM con palabra clave — "Escríbeme la palabra ${palabra} y te lo envío por privado"

CTA FINAL: palabra clave ${palabra}
RECURSO NECESARIO: PDF nuevo

${pdfBody}`;

const win = () =>
`SÁBADO — RESULTADOS / WINS
PILAR: Autoridad
FORMATO: variante 3 (un resultado por story, casos_reales.md)

STORY 1: Hook relajado — "Os traigo los resultados de esta semana de los alumnos de Amplify"
STORY 2-6: un resultado real por story — rellenar con casos de casos_reales.md + captura de Circle (un caso por story)
STORY final: Cierre + CTA — "La única diferencia entre ellos y tú es que tomaron acción. Escríbeme la palabra AMPLIFY."

CTA FINAL: palabra clave AMPLIFY
RECURSO NECESARIO: capturas reales de los posts de Circle`;

// --- Contenidos por fecha ---
const CAL_14 = cal(
  'publicar sin estrategia, "a lo loco"',
  "Llevo tiempo viendo un patrón en las cuentas que no despegan...",
  "Publican mucho pero sin un plan; cada semana es empezar de cero.",
  "Sin estructura, el algoritmo no entiende a quién mostrarte ni la audiencia sabe qué esperar de ti.",
  "No necesitas publicar más, necesitas publicar con un plan que se repita.",
  "Esta semana os enseño el plan de contenido semanal que sí convierte.",
);
const CTA_17 = cta(
  "Tu plan de contenido semanal que sí convierte", "PLAN",
  pdf(
    "Tu plan de contenido semanal que sí convierte",
    "publicar por publicar no crece; un plan repetible sí.",
    "PILAR CLARO (de qué hablas)", "FORMATO FIJO (cómo lo cuentas)", "CADENCIA (cuándo)",
    "el problema no es falta de ideas, es falta de sistema.",
    "¿tengo un pilar claro? / ¿un formato fijo? / ¿una cadencia realista? / ¿mido lo que funciona?",
    "¿Quieres el plan que usamos en Amplify? Pulsa aquí para ver cómo lo trabajamos.",
  ),
);
const CAL_21 = cal(
  "tener audiencia pero nada que vender",
  "Veo cuentas con miles de seguidores y cero ingresos...",
  "Han crecido, pero no tienen nada concreto que ofrecer.",
  "La audiencia sin oferta no genera ingresos, por grande que sea.",
  "El objetivo no es más seguidores, es tener algo que puedan comprarte.",
  "Esta semana os enseño cómo crear tu primera oferta digital.",
);
const CTA_24 = cta(
  "Cómo crear tu primera oferta digital", "OFERTA",
  pdf(
    "Cómo crear tu primera oferta digital",
    "no hace falta gran audiencia; hace falta algo concreto que vender.",
    "CLARIDAD (qué resuelve)", "ACCESIBILIDAD (fácil de comprar)", "CONFIANZA PREVIA",
    "el problema no es 'pocos seguidores', es no tener oferta clara.",
    "¿sé qué problema resuelve? / ¿es fácil de comprar? / ¿generé confianza antes? / ¿la ofrezco repetido?",
    "¿Quieres crear tu primera oferta con nosotros? Pulsa aquí.",
  ),
);
const CAL_28 = cal(
  "vergüenza a venderse",
  "Hay algo que frena a mucha gente con talento...",
  "Les da vergüenza vender, así que nunca ofrecen nada.",
  "Vender no es molestar: es conectar a alguien con la solución que ya busca.",
  "Si ayudas de verdad, ofrecer tu solución es un favor, no una molestia.",
  "El jueves os enseño a vender sin sonar a vendehumos.",
);

const OCT = {
  "2026-10-01": ["Venta","CTA / Regalo (Jueves)", cta(
    "Vender sin sonar a vendehumos", "VENDER",
    pdf("Vender sin sonar a vendehumos",
      "vender no es manipular, es ofrecer una solución.",
      "HISTORIA REAL", "PRUEBA", "OFERTA CLARA",
      "el rechazo a vender viene de no haber generado confianza antes.",
      "¿cuento mi historia? / ¿muestro prueba? / ¿mi oferta es clara? / ¿ofrezco con naturalidad?",
      "¿Quieres vender con naturalidad? Pulsa aquí para ver cómo lo hacemos en Amplify.")) ],
  "2026-10-03": ["Autoridad","Resultados / Wins (Sábado)", win()],
  "2026-10-05": ["Nicho","Calentamiento (Lunes)", cal(
    "sentirte uno más, no destacar",
    "Veo muchísimas cuentas que parecen la misma...",
    "Copian formatos y suenan iguales; nadie las recuerda.",
    "Sin un ángulo propio, eres intercambiable y el algoritmo no te prioriza.",
    "Lo que te hace destacar no es el formato, es tu ángulo único.",
    "Esta semana os enseño a encontrar vuestro ángulo único.")],
  "2026-10-08": ["Venta","CTA / Regalo (Jueves)", cta(
    "Encuentra tu ángulo único", "ANGULO",
    pdf("Encuentra tu ángulo único",
      "nadie tiene tu combinación exacta de historia, experiencia y perspectiva.",
      "HISTORIA", "EXPERIENCIA", "PERSPECTIVA",
      "el problema no es falta de talento, es intentar parecerte a otros.",
      "¿sueno como yo? / ¿cuento lo que viví? / ¿tengo un enemigo claro? / ¿soy reconocible?",
      "¿Quieres definir tu ángulo con nosotros? Pulsa aquí.")) ],
  "2026-10-10": ["Autoridad","Resultados / Wins (Sábado)", win()],
  "2026-10-12": ["Nicho","Calentamiento (Lunes)", cal(
    "quemarse creando contenido",
    "Veo a mucha gente empezar con fuerza y desaparecer en 2 meses...",
    "Se queman porque crean cada pieza desde cero, sin sistema.",
    "El agotamiento no es falta de ganas, es falta de proceso.",
    "Con un sistema de producción, publicar deja de agotarte.",
    "Esta semana os enseño a crear contenido en 2h a la semana.")],
  "2026-10-15": ["Venta","CTA / Regalo (Jueves)", cta(
    "Crea contenido en 2h a la semana", "SISTEMA",
    pdf("Crea contenido en 2h a la semana",
      "no necesitas más horas, necesitas un sistema de producción.",
      "BATCHING (grabar en bloque)", "PLANTILLAS", "REPURPOSING",
      "el problema no es falta de tiempo, es improvisar cada día.",
      "¿grabo en bloque? / ¿uso plantillas? / ¿reutilizo cada pieza? / ¿tengo banco de ideas?",
      "¿Quieres nuestro sistema de producción? Pulsa aquí.")) ],
  "2026-10-17": ["Autoridad","Resultados / Wins (Sábado)", win()],
  "2026-10-19": ["Nicho","Calentamiento (Lunes)", cal(
    "estancamiento, no crecer",
    "Veo cuentas atascadas meses en el mismo número...",
    "Siguen haciendo lo mismo esperando un resultado distinto.",
    "El estancamiento casi siempre es un mensaje que ya no conecta o un formato agotado.",
    "Desbloquear el crecimiento es ajustar el mensaje, no publicar más.",
    "Esta semana os enseño a desbloquear un crecimiento estancado.")],
  "2026-10-22": ["Venta","CTA / Regalo (Jueves)", cta(
    "Desbloquea tu crecimiento estancado", "CRECIMIENTO",
    pdf("Desbloquea tu crecimiento estancado",
      "si llevas meses igual, el problema es el mensaje, no el esfuerzo.",
      "MENSAJE", "FORMATO", "GANCHO",
      "hacer más de lo mismo no rompe el estancamiento.",
      "¿mi mensaje sigue conectando? / ¿mis ganchos funcionan? / ¿pruebo formatos nuevos? / ¿mido bien?",
      "¿Quieres que revisemos tu cuenta? Pulsa aquí.")) ],
  "2026-10-24": ["Autoridad","Resultados / Wins (Sábado)", win()],
  "2026-10-26": ["Nicho","Calentamiento (Lunes)", cal(
    "seguidores que no interactúan",
    "Veo cuentas con seguidores pero comentarios a cero...",
    "Tienen público, pero no comunidad.",
    "La interacción baja cuando hablas a todos y no a alguien concreto.",
    "Una comunidad se construye hablando a una persona, no a una masa.",
    "Esta semana os enseño a fidelizar y activar a vuestra audiencia.")],
  "2026-10-29": ["Venta","CTA / Regalo (Jueves)", cta(
    "Cómo convertir seguidores en comunidad", "COMUNIDAD",
    pdf("Cómo convertir seguidores en comunidad",
      "una comunidad activa vale más que un número grande y frío.",
      "CONVERSACIÓN", "PERTENENCIA", "CONSTANCIA",
      "el problema no es el alcance, es que no generas conversación.",
      "¿hago preguntas? / ¿respondo? / ¿creo pertenencia? / ¿aparezco constante?",
      "¿Quieres construir comunidad con nosotros? Pulsa aquí.")) ],
  "2026-10-31": ["Autoridad","Resultados / Wins (Sábado)", win()],
};

// Actualizar septiembre (rows existentes)
const sep = [
  ["2026-09-14","Nicho","Calentamiento (Lunes)",CAL_14],
  ["2026-09-17","Venta","CTA / Regalo (Jueves)",CTA_17],
  ["2026-09-19","Autoridad","Resultados / Wins (Sábado)",win()],
  ["2026-09-21","Nicho","Calentamiento (Lunes)",CAL_21],
  ["2026-09-24","Venta","CTA / Regalo (Jueves)",CTA_24],
  ["2026-09-26","Autoridad","Resultados / Wins (Sábado)",win()],
  ["2026-09-28","Nicho","Calentamiento (Lunes)",CAL_28],
];
let n = 0;
for (const [date, category, objective, content] of sep) {
  const { error } = await admin.from("social_posts")
    .update({ category, objective, content, script: null })
    .eq("kind", "story").eq("publish_date", date);
  if (error) console.error(date, error.message); else n++;
}

// Insertar octubre (rows nuevas)
const octRows = Object.entries(OCT).map(([publish_date, [category, objective, content]]) => ({
  publish_date, category, objective, content,
  kind: "story", status: "FALTA CONTENIDO", product: "Servicio Amplify",
}));
await admin.from("social_posts").delete()
  .eq("kind","story").gte("publish_date","2026-10-01").lte("publish_date","2026-10-31");
const { error: e2 } = await admin.from("social_posts").insert(octRows);
if (e2) console.error("octubre:", e2.message);
console.log(`✓ septiembre actualizado: ${n} · octubre insertado: ${octRows.length}`);
