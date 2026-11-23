// Reuniones que se añaden al panel (sección "Reuniones") junto con sus tareas.
// Cada una se importa una sola vez (queda anotada en state.importedMeetings), así que
// se pueden editar o borrar desde el panel sin que vuelvan a aparecer.
// Los responsables se indican por nombre de pila; "" = sin asignar (tarea de todo el equipo).

export type MeetingSeed = {
  id: string;
  title: string;
  date: string; // AAAA-MM-DD
  attendees: string[]; // nombres de pila
  url: string;
  summary: string;
  decisions: string[];
  points: { title: string; text: string }[];
  tasks: { title: string; desc: string; who: string; dept: string; priority: "alta" | "media" | "baja"; project?: string }[];
};

export const MEETINGS: MeetingSeed[] = [
  {
    id: "m-2026-11-23-wip",
    title: "Amplify ES · WIP",
    date: "2026-11-23",
    attendees: ["Alba", "Sid", "Sara", "Laura", "Alessio", "Zak", "Fernando"],
    url: "https://docs.google.com/document/d/1OP1eQtcy2PgPvYRLdEpnlwL9n23WMu3AV1Tv_x_76uA/edit?tab=t.ye2l1eo3u1xx",
    summary:
      "Debate sobre el precio y la estrategia del Intensivo, con cambio de calendario a enero y ajustes comerciales.\n\n" +
      "• Percepción del precio: se analizó el valor percibido y se descartó bajar el precio. El problema es de comunicación.\n" +
      "• Embudo: las fechas pasan a enero, se crea una lista de espera y se retiran los botones de pago.\n" +
      "• Ventas: el objetivo es conseguir casos de éxito; se prioriza el formato grupal frente a la atención individual.",
    decisions: [
      "Lista de espera para enero: se pospone el inicio del Intensivo a enero, se quitan los botones de pago actuales y se trabaja con una lista de espera.",
      "No se baja el precio (se habló de 49 €) para no perder valor ni autoridad.",
      "El primer mes del Intensivo busca casos de éxito sólidos más que ingresos inmediatos.",
      "No se abren plazas 1 a 1 para creación de contenido: las llamadas grupales semanales aportan más valor.",
    ],
    points: [
      {
        title: "Percepción del precio y propuesta de valor",
        text: "Sara y Alba plantean que los leads ven caro el Intensivo y que las llamadas les parecen poco para un producto de pago. Laura pregunta si en España se percibe caro frente a lo prometido; Alessio reconoce que, al ser la primera edición, faltaban expectativas claras. Se descarta bajarlo a 49 € para no perder valor ni autoridad.",
      },
      {
        title: "Falta de calentamiento y contenido previo",
        text: "Sara señala que faltó precalentamiento y que el precio salió con prisa, sin explicar antes el contenido y los resultados. Laura recomienda más historias y generar FOMO con expectativas y resultados. Alessio reconoce que 15 días de planificación fueron pocos y se compromete a aumentar la promoción.",
      },
      {
        title: "Confusión en la comunicación",
        text: "La oferta se presentó como dos llamadas en directo (9 y 10 de diciembre), lo que parece una masterclass normal y no una experiencia de comunidad de un mes. Laura y Fernando confirman que los leads creen que pagan solo por dos llamadas. Alessio aclara que el valor real incluye un mes de comunidad de WhatsApp con acompañamiento directo.",
      },
      {
        title: "Mercado y diciembre",
        text: "Alessio comenta la estrategia de otros creadores y que en Navidad la gente no invierte en programas nuevos hasta enero. Sara añade que tras el Black Friday hay que destacar mucho la promesa de valor. Alessio y Alba revisan el coste por lead y la saturación de ofertas.",
      },
      {
        title: "Nuevo calendario en enero",
        text: "Alessio propone mover el inicio de la comunidad del Intensivo a enero (del 10 de enero al 10 de febrero), cuando la gente se pone objetivos nuevos. Laura y Alba lo apoyan: se mantiene la captación ahora, pero orientada al acceso de enero.",
      },
      {
        title: "Lista de espera y cambios en los embudos",
        text: "Laura propone una lista de espera, en orgánico y en pago, hasta abrir plazas el 1 de enero; Alba y Alessio lo apoyan. Se nutrirá con recursos y contenido de valor por WhatsApp para mantener el interés.",
      },
      {
        title: "Copys, botones de pago y acciones inmediatas",
        text: "Alba propone quitar temporalmente los botones de pago y ajustar los copys al cambio de fechas y al enfoque «Intensivo Amplify». Laura pausará las campañas hasta actualizar creatividades y llamadas a la acción hacia la lista de espera.",
      },
      {
        title: "Resultados a largo plazo",
        text: "Alessio fija como objetivo del primer mes conseguir casos de éxito sólidos, no maximizar ingresos. Esos resultados servirán para vender más adelante y subir el precio del programa principal reduciendo el tamaño de los grupos.",
      },
      {
        title: "Tendencias y constancia en redes",
        text: "En la parte posterior con Alessio, Zak y Fernando se analiza el contenido de otros referentes y la importancia de publicar a diario. Alessio comparte cómo automatizar que las historias se republiquen como reels en Instagram.",
      },
      {
        title: "Cualificación de leads, presupuesto y urgencia",
        text: "Zak explica que cuesta cerrar por falta de presupuesto, prioridad o urgencia: hay leads que solo buscan métricas de vanidad sin intención de monetizar. Fernando comparte su enfoque: confrontar al lead con lo que de verdad quiere y romper sus propios bloqueos.",
      },
      {
        title: "Estructura del programa y exceso de información",
        text: "Alessio y Fernando hablan de lo abrumador que es para alguien nuevo la cantidad de información sobre marca personal. Fernando explica que en el onboarding comparte pantalla para ordenar el temario en fases claras.",
      },
      {
        title: "Programas grupales frente a 1 a 1",
        text: "Zak plantea la objeción de clientes que quieren atención individual. Alessio no quiere abrir plazas 1 a 1 de creación de contenido: por experiencia acaban siendo apoyo psicológico y motivación; las llamadas grupales semanales aportan más valor y eficiencia.",
      },
      {
        title: "Objeciones de venta y coordinación del equipo",
        text: "Zak cuenta el caso de un lead internacional con presupuesto que al final se echó atrás por falta de compromiso y de contenido preparado. Fernando y Alessio revisan cuántas llamadas de venta se esperan esta semana y acuerdan mantener reuniones periódicas del equipo comercial.",
      },
    ],
    tasks: [
      {
        title: "Arreglar el acceso de Sara Nieves a la comunidad de WhatsApp",
        desc: "Reparar el acceso a la comunidad de WhatsApp para Sara Nieves.",
        who: "Alessio",
        dept: "Comunidad",
        priority: "media",
        project: "Comunidad",
      },
      {
        title: "Cambiar las fechas del Intensivo a enero y quitar los botones de pago",
        desc: "Modificar el copy y las fechas para reprogramar el inicio del Intensivo a enero. Eliminar los botones de pago actuales de la web.",
        who: "",
        dept: "Funnels",
        priority: "alta",
        project: "Intensivo",
      },
      {
        title: "Crear la lista de espera del Intensivo",
        desc: "Montar una lista de espera y redirigir a los interesados a un grupo de WhatsApp dedicado, donde se les nutrirá con recursos y contenido hasta abrir plazas.",
        who: "",
        dept: "Funnels",
        priority: "alta",
        project: "Intensivo",
      },
      {
        title: "Automatizar la publicación de resultados de clientes en historias de Instagram",
        desc: "Implementar un sistema de automatización para publicar los resultados de clientes en las historias de Instagram (y republicar historias como reels).",
        who: "Alessio",
        dept: "Contenido",
        priority: "media",
        project: "Contenido orgánico",
      },
      {
        title: "Actualizar carruseles y anuncios hacia la lista de espera",
        desc: "Ajustar los carruseles y los anuncios para llevar a la nueva lista de espera. Las campañas actuales quedan en pausa hasta tener las creatividades nuevas.",
        who: "Laura",
        dept: "Ads",
        priority: "alta",
        project: "Intensivo",
      },
      {
        title: "Contactar con el lead italiano interesado en el banco de contenido",
        desc: "Contactar con el cliente italiano interesado en construir un banco de contenido.",
        who: "Zak",
        dept: "Ventas",
        priority: "media",
        project: "Ventas",
      },
      {
        title: "Compartir los resúmenes de llamadas de la semana y los puntos de dolor",
        desc: "Compartir en el grupo de WhatsApp los resúmenes de las llamadas de la semana y los puntos de dolor detectados, para que Alessio los use en su contenido.",
        who: "",
        dept: "Ventas",
        priority: "media",
        project: "Ventas",
      },
      {
        title: "Revisar con Sara la cualificación de leads del Typeform",
        desc: "Hablar con Sara sobre el proceso de cualificación de leads por Typeform para que el filtrado sea más efectivo.",
        who: "",
        dept: "Ventas",
        priority: "media",
        project: "Ventas",
      },
    ],
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
type State = Record<string, any> & { tasks: any[]; members: { id: string; name: string }[] };

const first = (s: string) =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().split(/\s+/)[0] || "";

// Añade al estado las reuniones (y sus tareas) que aún no se han importado.
export function importMeetings(state: State): { state: State; added: number } {
  const imported: string[] = Array.isArray(state.importedMeetings) ? state.importedMeetings : [];
  const pending = MEETINGS.filter((m) => !imported.includes(m.id));
  if (!pending.length) return { state, added: 0 };

  const next: State = {
    ...state,
    tasks: [...state.tasks],
    meetings: [...(state.meetings ?? [])],
    departments: [...(state.departments ?? [])],
    importedMeetings: [...imported],
  };
  const byName = (n: string) => next.members.find((m) => first(m.name) === first(n));
  const norm = (x: string) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const projectOf = (hint?: string) =>
    hint ? (next.projects ?? []).find((p: any) => norm(p.name).startsWith(norm(hint)))?.id ?? "" : "";
  let seq = Math.max(Number(next.seq) || 0, ...next.tasks.map((t) => Number(t.num) || 0));

  for (const m of pending) {
    if (!next.meetings.some((x: any) => x.id === m.id)) {
      next.meetings.push({
        id: m.id,
        title: m.title,
        date: m.date,
        attendees: m.attendees.map((n) => byName(n)?.id).filter(Boolean),
        summary: m.summary,
        decisions: m.decisions,
        points: m.points,
        notes: "",
        url: m.url,
        createdAt: Date.now(),
      });
    }
    m.tasks.forEach((t, i) => {
      if (t.dept && !next.departments.includes(t.dept)) next.departments.push(t.dept);
      const who = t.who ? byName(t.who)?.id : undefined;
      seq += 1;
      next.tasks.push({
        id: `${m.id}-t${i + 1}`,
        num: seq,
        title: t.title,
        desc: t.who ? t.desc : `${t.desc}\n\nResponsable en la reunión: todo el equipo.`,
        project: projectOf(t.project),
        dept: t.dept,
        assignees: who ? [who] : [],
        priority: t.priority,
        due: "",
        mode: "auto",
        done: false,
        createdAt: Date.now(),
        comments: [],
        subtasks: [],
        meeting: m.id,
      });
    });
    next.importedMeetings.push(m.id);
  }
  next.seq = seq;
  return { state: next, added: pending.length };
}
