/* Amplify · traducción de la interfaz (español → inglés) y selector de idioma.
   El idioma se guarda en la cookie "amplify_lang" (es | en) para toda la app,
   incluidas las secciones que el panel abre dentro de un iframe.
   Solo se traducen los textos de la interfaz (diccionario exacto + patrones);
   el contenido que escribe el equipo (tareas, notas, comentarios) no se toca. */
(function () {
  "use strict";
  var COOKIE = "amplify_lang";
  function getLang() {
    var m = document.cookie.match(/(?:^|;\s*)amplify_lang=(es|en)/);
    return m ? m[1] : "es";
  }
  function setLang(l) {
    document.cookie = COOKIE + "=" + l + ";path=/;max-age=31536000;samesite=lax";
    try { (window.top || window).location.reload(); } catch (e) { location.reload(); }
  }
  var LANG = getLang();

  /* ---------- selector ES / EN ---------- */
  var SW_CSS =
    ".lang-sw{display:inline-flex;gap:2px;padding:2px;border:1px solid rgba(0,0,0,.1);border-radius:8px;background:rgba(255,255,255,.7);font:500 12px/1 Geist,Inter,system-ui,sans-serif}" +
    ".lang-sw button{border:0;background:none;padding:5px 8px;border-radius:6px;cursor:pointer;color:#6b6b70;font:inherit;letter-spacing:.02em}" +
    ".lang-sw button:hover{color:#18181b}" +
    ".lang-sw button.on{background:#18181b;color:#fff}";
  function mountSwitches(root) {
    var els = (root || document).querySelectorAll ? (root || document).querySelectorAll("[data-lang-switch]") : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.querySelector(".lang-sw")) continue;
      var w = document.createElement("span");
      w.className = "lang-sw";
      w.setAttribute("data-noi18n", "");
      w.setAttribute("role", "group");
      w.setAttribute("aria-label", LANG === "en" ? "Language" : "Idioma");
      ["es", "en"].forEach(function (l) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = l.toUpperCase();
        b.title = l === "es" ? "Español" : "English";
        if (l === LANG) b.className = "on";
        b.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (l !== LANG) setLang(l);
        });
        w.appendChild(b);
      });
      el.appendChild(w);
    }
  }
  window.amplifyI18n = { lang: LANG, set: setLang, mount: mountSwitches };

  function addStyle() {
    if (document.getElementById("lang-sw-css")) return;
    var s = document.createElement("style");
    s.id = "lang-sw-css";
    s.textContent = SW_CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- diccionario ---------- */
  var D = {
    // General / navegación
    "Tareas": "Tasks", "Tablero": "Board", "Lista": "List", "Kanban": "Kanban", "Proyectos": "Projects", "Proyecto": "Project",
    "Contenido": "Content", "Accesos": "Access", "Updates": "Updates", "RRSS": "Social", "Informes": "Reports",
    "Contraseñas y accesos": "Passwords & access", "Recursos y landings": "Resources & landing pages",
    "Más de Amplify": "More from Amplify", "Tablero anterior": "Previous board", "Mi cuenta": "My account", "Salir": "Log out",
    "General": "General", "Equipo": "Team", "Interno": "Internal", "Por confirmar": "To be confirmed", "Panel /": "Panel /", "Panel": "Panel",
    "Panel de tareas": "Task panel", "Panel de Tareas": "Task Panel", "Has entrado como": "Signed in as", "Buscar tareas": "Search tasks",
    "Nuevo proyecto": "New project", "Ver las tareas de": "See tasks of", "Alguien": "Someone", "Amplify": "Amplify",
    "Conectando…": "Connecting…", "Guardando…": "Saving…", "Guardado": "Saved", "Solo lectura": "Read only", "Error al guardar": "Error saving",
    "No se pudo guardar": "Couldn't save", "Cerrar": "Close", "Cancelar": "Cancel", "Guardar": "Save", "Guardar cambios": "Save changes",
    "Editar": "Edit", "Borrar": "Delete", "Duplicar": "Duplicate", "Quitar": "Remove", "Añadir": "Add", "Crear": "Create", "Enviar": "Send",
    "Nombre": "Name", "Descripción": "Description", "Título": "Title", "Tipo": "Type", "Estado": "Status", "Enlace": "Link", "Fecha": "Date",
    "Prioridad": "Priority", "Alta": "High", "Media": "Medium", "Baja": "Low", "Departamento": "Department", "Departamentos": "Departments",
    "Fecha límite": "Due date", "Responsables": "Assignees", "Responsable": "Assignee", "Tarea": "Task", "Cliente": "Client", "Total": "Total",
    "Ficha": "Profile", "Resumen": "Summary", "Repetición": "Repeat", "Subtareas": "Subtasks", "Comentarios": "Comments", "Ajustes": "Settings",
    "Hoy": "Today", "Ventas": "Sales", "Marketing": "Marketing", "Administración": "Administration", "Web": "Web", "Ver": "View",
    "(copia)": "(copy)", "Sin departamento": "No department", "Sin tareas": "No tasks", "Sin asignar": "Unassigned", "Sin fecha": "No date",
    "Sin proyecto": "No project", "Sin responsables": "No assignees", "Sin descripción.": "No description.", "Todas": "All", "Todos": "All", "Todo": "All",
    "Por estado": "By status", "Por departamento": "By department", "Por proyecto": "By project", "Por persona": "By person", "Agrupar": "Group",
    // Estados y columnas
    "Retrasadas": "Overdue", "Para hoy": "Due today", "Para mañana": "Due tomorrow", "Para pasado mañana": "Due in 2 days", "Para +3 días": "Due in 3+ days",
    "Finalizadas": "Done", "A la espera": "On hold", "Update": "Update",
    // Tablero del panel
    "Editar tarea": "Edit task", "Nueva tarea": "New task", "Crear tarea": "Create task", "+ Nueva tarea": "+ New task",
    "Las tareas se colocan solas según su fecha límite. Arrástralas entre columnas para cambiarlas.": "Tasks sort themselves by due date. Drag them between columns to change them.",
    "Las tareas se colocan solas según su fecha límite.": "Tasks sort themselves by due date.",
    "Dales fecha nueva, márcalas como hechas o pásalas a «A la espera».": "Give them a new date, mark them as done or move them to «On hold».",
    "Ver en lista": "View as list", "Tareas activas": "Active tasks", "Completadas": "Completed", "Ver tareas:": "Show tasks:",
    "Todos los proyectos": "All projects", "Todos los departamentos": "All departments", "General (sin departamento)": "General (no department)",
    "Todas las prioridades": "All priorities", "Prioridad alta": "High priority", "Prioridad media": "Medium priority", "Prioridad baja": "Low priority",
    "Ver finalizadas": "Show completed", "Reabrir": "Reopen", "Hecha": "Done", "Añadir tarea aquí": "Add task here", "Añadir tarea": "Add task",
    "No hay tareas con estos filtros.": "No tasks match these filters.",
    "Aún no hay proyectos. Crea el primero con «Nuevo proyecto».": "No projects yet. Create the first one with «New project».",
    "Tareas de este proyecto.": "Tasks in this project.", "Ver ficha del proyecto": "View project profile", "Ficha del proyecto": "Project profile",
    "Mes anterior": "Previous month", "Mes siguiente": "Next month",
    "Ningún cliente tiene servicios asignados todavía. Ábrelos desde su ficha.": "No client has services assigned yet. Open them from their profile.",
    "solo este cliente": "this client only", "Convertir en tarea del tablero": "Turn into a board task", "+ Subtarea solo para este cliente": "+ Subtask for this client only",
    "Proyecto interno": "Internal project", "No hay tareas activas.": "No active tasks.",
    "Los enlaces se escriben como [texto](https://…) o pegando la URL tal cual.": "Write links as [text](https://…) or paste the URL as is.",
    "para este proyecto.": "for this project.", "Sin tareas activas de este departamento.": "No active tasks in this department.",
    "Borrar proyecto": "Delete project", "Guardar notas": "Save notes", "Editar notas": "Edit notes", "Ficha guardada": "Profile saved", "Notas guardadas": "Notes saved",
    "Sus tareas se quedarán sin proyecto. Esta acción no se puede deshacer.": "Its tasks will be left without a project. This can't be undone.",
    "Proyecto borrado": "Project deleted", "Abrir ficha": "Open profile", "Este proyecto aún no tiene notas.": "This project has no notes yet.",
    "+ Añadir subtarea": "+ Add subtask", "Escribe un comentario…": "Write a comment…", "¿Qué hay que hacer?": "What needs to be done?",
    "Detalles, enlaces, contexto…": "Details, links, context…", "Automático (según fecha)": "Automatic (by date)",
    "Añade personas al equipo desde ajustes.": "Add people to the team from settings.", "Tarea creada": "Task created", "Cambios guardados": "Changes saved",
    "Ajustes del panel": "Panel settings", "Equipo, proyectos y departamentos": "Team, projects and departments", "Añadir persona": "Add person",
    "Las notas y datos de cada proyecto se editan desde su ficha.": "Each project's notes and details are edited from its profile.",
    "Añadir departamento": "Add department",
    "Lista de subtareas mensuales que conlleva cada servicio, para todos los clientes que lo tienen. Una por línea.": "Monthly subtasks that each service involves, for every client that has it. One per line.",
    "Ajustes guardados": "Settings saved", "Subtarea añadida": "Subtask added", "Semanal": "Weekly",
    "Alguien guardó a la vez: se ha cargado su versión.": "Someone saved at the same time: their version has been loaded.",
    "Solo tienes permiso de lectura": "You only have read access", "Para marcarla como retrasada, pon una fecha pasada": "To mark it as overdue, set a past date",
    "Tarea reabierta": "Task reopened", "¡Hecha! ✓ Creada la siguiente": "Done! ✓ Next one created", "¡Hecha! ✓": "Done! ✓", "Tarea duplicada": "Task duplicated",
    "Esta acción no se puede deshacer.": "This can't be undone.", "Tarea borrada": "Task deleted",
    // Recursos y landings
    "Todo el contenido del proyecto en un sitio: landings, documentos, datos y herramientas. Para textos, guiones y copys está la sección Contenido.": "All of the project's material in one place: landing pages, documents, data and tools. For texts, scripts and copy, use the Content section.",
    "Buscar recurso…": "Search resources…", "Añadir recurso": "Add resource", "Ningún recurso coincide con la búsqueda.": "No resource matches your search.",
    "Aún no hay recursos. Añade el primero.": "No resources yet. Add the first one.", "Nuevo recurso": "New resource", "Editar recurso": "Edit resource",
    "Para qué sirve, estado…": "What it's for, status…", "Recurso añadido": "Resource added", "Recurso guardado": "Resource saved", "Recurso borrado": "Resource deleted",
    "Se quita del bloque de recursos. La página enlazada no se toca.": "It's removed from resources. The linked page isn't touched.",
    "Landings": "Landing pages", "Estrategia y documentos": "Strategy & documents", "Comunidad y producto": "Community & product", "Datos y CRM": "Data & CRM", "Herramientas": "Tools",
    // Meses y días
    "Enero": "January", "Febrero": "February", "Marzo": "March", "Abril": "April", "Mayo": "May", "Junio": "June", "Julio": "July", "Agosto": "August",
    "Septiembre": "September", "Octubre": "October", "Noviembre": "November", "Diciembre": "December",
    "enero": "January", "febrero": "February", "marzo": "March", "abril": "April", "mayo": "May", "junio": "June", "julio": "July", "agosto": "August",
    "septiembre": "September", "octubre": "October", "noviembre": "November", "diciembre": "December",
    "Lun": "Mon", "Mar": "Tue", "Mié": "Wed", "Jue": "Thu", "Vie": "Fri", "Sáb": "Sat", "Dom": "Sun",
    "lunes": "Monday", "martes": "Tuesday", "miércoles": "Wednesday", "jueves": "Thursday", "viernes": "Friday", "sábado": "Saturday", "domingo": "Sunday",
    // Login y cuenta
    "Esa cuenta de Google no está en el equipo de Amplify. Entra con el email que tienes dado de alta o avisa a Alba.": "That Google account isn't on the Amplify team. Sign in with your registered email or let Alba know.",
    "No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.": "Google sign-in couldn't be completed. Please try again.",
    "No se pudo iniciar sesión.": "Couldn't sign in.", "Email o contraseña incorrectos.": "Wrong email or password.",
    "Entra con tu cuenta de Google del equipo": "Sign in with your team Google account", "Entrar con Google": "Sign in with Google", "Ocultar": "Hide",
    "Entrar con email y contraseña": "Sign in with email and password", "Email": "Email", "Contraseña": "Password", "Entrando…": "Signing in…", "Entrar": "Sign in",
    "tu@amplifyesp.com": "you@amplifyesp.com", "Accede con tu email de equipo": "Sign in with your team email",
    "La contraseña debe tener al menos 6 caracteres.": "The password must be at least 6 characters.", "Las contraseñas no coinciden.": "Passwords don't match.",
    "No se pudo cambiar:": "Couldn't change it:", "✓ Contraseña actualizada correctamente.": "✓ Password updated.", "Cambiar contraseña": "Change password",
    "Cambia tu contraseña inicial por una tuya.": "Replace your initial password with your own.", "Nueva contraseña": "New password", "Repite la contraseña": "Repeat password",
    "Tu usuario existe pero no tiene perfil. Avisa al admin.": "Your user exists but has no profile. Tell the admin.", "Tablero de tareas": "Task board",
    "No autenticado": "Not signed in", "Tarjeta no encontrada": "Card not found", "Tarea no encontrada": "Task not found", "Columna desconocida": "Unknown column",
    "Mi perfil": "My profile", "Rol": "Role", "Equipo / departamento": "Team / department", "Administrador": "Administrator",
    // Tablero anterior
    "Solo las mías": "Only mine", "Ver tareas finalizadas": "Show completed tasks", "vencida hace": "overdue by", "💬 Abrir": "💬 Open", "↩︎ Reabrir": "↩︎ Reopen",
    "✓ Hecha": "✓ Done", "✎ Editar": "✎ Edit", "⧉ Duplicar": "⧉ Duplicate", "Título de la tarea": "Task title", "— Sin asignar —": "— Unassigned —",
    "— Sin departamento —": "— No department —", "Sugerencia de próxima acción": "Suggested next action", "Guardado ✓": "Saved ✓", "Emojis": "Emojis",
    "Ej. Planificación estrategia": "E.g. Strategy planning",
    "Dirección": "Management", "Estrategia": "Strategy", "Equipo Comercial": "Sales team", "Equipo Publicidad": "Advertising team",
    "Equipo Diseño": "Design team", "Equipo Desarrollo": "Development team", "Equipo Contenidos": "Content team",
    // Notificaciones
    "Notificaciones": "Notifications", "Marcar todas": "Mark all as read", "No tienes notificaciones": "You have no notifications",
    "te asignó la tarea": "assigned you the task", "te mencionó en": "mentioned you in", "una publicación": "a post", "una tarea": "a task",
    // Contenido / Accesos / Updates (tarjetas)
    "Comercial": "Sales", "Contenido audiovisual": "Video content", "Producto Amplify": "Amplify product", "Links y UTMs": "Links & UTMs", "Desarrollo": "Development",
    "Contenidos": "Content", "Enlaces del embudo, contenidos y materiales del proyecto.": "Funnel links, content and project materials.",
    "Enlaces de acceso a las herramientas y paneles del proyecto.": "Access links to the project's tools and dashboards.",
    "Novedades, notas y actualizaciones del proyecto.": "News, notes and project updates.", "+ Nueva tarjeta": "+ New card",
    "Aún no hay tarjetas. Crea la primera con “+ Nueva tarjeta”.": "No cards yet. Create the first one with “+ New card”.", "Sin contenido": "No content",
    "Enlaces": "Links", "Tabla": "Table", "Esta tarjeta no tiene contenido todavía.": "This card has no content yet.", "No se pudo subir la imagen:": "Couldn't upload the image:",
    "Columna 1": "Column 1", "Columna 2": "Column 2", "Columna": "Column", "El título es obligatorio.": "A title is required.", "Editar tarjeta": "Edit card",
    "Nueva tarjeta": "New card", "Título *": "Title *", "Ej. Embudo de ventas": "E.g. Sales funnel", "Ej. Meta Ads": "E.g. Meta Ads", "Ej. Novedad de la semana": "E.g. This week's news",
    "Categoría": "Category", "— Sin categoría —": "— No category —", "Imagen": "Image", "Quitar imagen": "Remove image", "Subiendo…": "Uploading…", "📷 Subir imagen": "📷 Upload image",
    "Nombre (ej. Landing)": "Name (e.g. Landing)", "Quitar enlace": "Remove link", "+ Añadir enlace": "+ Add link", "Quitar tabla": "Remove table", "+ Añadir tabla": "+ Add table",
    "Quitar columna": "Remove column", "+ col": "+ col", "Quitar fila": "Remove row", "+ Añadir fila": "+ Add row", "Crear tarjeta": "Create card",
    // RRSS
    "FALTA CONTENIDO": "CONTENT MISSING", "FALTA COPY": "COPY MISSING", "POR REVISAR": "TO REVIEW", "POR CORREGIR": "TO FIX", "REVISADO": "REVIEWED",
    "PROGRAMADO": "SCHEDULED", "PUBLICADO": "PUBLISHED", "POSPUESTO": "POSTPONED", "CANCELADO": "CANCELLED",
    "Atracción": "Attraction", "Mentalidad": "Mindset", "Nutrición": "Nurture", "Autoridad": "Authority", "Prueba Social": "Social proof",
    "Conversión": "Conversion", "Conexión": "Connection", "Nicho": "Niche", "Venta": "Sale", "Carrusel": "Carousel",
    "Calendario RRSS": "Social media calendar", "Planificación mensual del contenido de redes sociales.": "Monthly social media content planning.",
    "Calendario": "Calendar", "+ Publicación": "+ Post", "Añadir publicación": "Add post", "Por días": "By day", "Publicación": "Post", "sin fecha": "no date",
    "¿Borrar esta publicación?": "Delete this post?", "Editar publicación": "Edit post", "Nueva publicación": "New post", "✓ Copiado": "✓ Copied", "🔗 Enlace": "🔗 Link",
    "Formato": "Format", "Fecha de publicación": "Publish date", "Pilar de contenido": "Content pillar", "— Pilar —": "— Pillar —", "Producto / Servicio": "Product / Service",
    "Objetivo": "Goal", "Newsletter (versión email del contenido)": "Newsletter (email version of the content)",
    "Adaptación del contenido para enviar por email": "Content adapted for email", "Guion (para grabar Alessio)": "Script (for Alessio to record)",
    "Gancho (0-3s) · Desarrollo · CTA": "Hook (0-3s) · Body · CTA", "Contenido en bruto": "Raw footage", "Enlace o notas del material grabado sin editar": "Link or notes for the unedited footage",
    "Contenido editado": "Edited content", "Enlace al contenido final editado": "Link to the final edited content", "Inspiración (links)": "Inspiration (links)",
    "Pega aquí links de referencia / inspiración": "Paste reference / inspiration links here", "Todavía no hay comentarios": "No comments yet", "Usuario": "User",
    "Comentario… (@ para mencionar · Cmd/Ctrl+Enter enviar)": "Comment… (@ to mention · Cmd/Ctrl+Enter to send)",
    // Informes
    "Sin país": "No country", "ahora mismo": "just now", "hace 1 min": "1 min ago", "Mujeres": "Women", "Hombres": "Men", "Sin dato": "Unknown",
    "Aún no hay datos en este rango.": "No data in this range yet.", "Registros": "Sign-ups", "Coste por registro": "Cost per sign-up", "por registro": "per sign-up",
    "Visitas": "Visits", "Registro": "Sign-up", "Asistió": "Attended", "Cita": "Call", "Compra": "Purchase", "Citas": "Calls", "Ventas ": "Sales",
    "landing_page_view (píxel)": "landing_page_view (pixel)", "etiqueta de registro (GHL)": "sign-up tag (GHL)", "leads de Meta": "Meta leads",
    "etiqueta de asistencia": "attendance tag", "etiqueta de cita": "call tag", "etiqueta de compra": "purchase tag", "del paso anterior": "of the previous step",
    "Sin datos de audiencia.": "No audience data.", "Gasto": "Spend", "Ajustes de los informes": "Report settings",
    "Cada funnel se reconoce por el nombre de sus campañas en Meta y por las etiquetas que GHL pone a cada contacto en cada paso.": "Each funnel is recognised by its Meta campaign names and by the tags GHL gives each contact at every step.",
    "Meta Ads aún no está conectado.": "Meta Ads isn't connected yet.", "GoHighLevel aún no está conectado.": "GoHighLevel isn't connected yet.",
    "Cuando lo esté, aquí podrás elegir entre tus etiquetas, pipelines y campañas reales.": "Once it is, you'll be able to pick your real tags, pipelines and campaigns here.",
    "Campañas de Meta que contienen (separa con comas)": "Meta campaigns containing (comma-separated)", "Coinciden:": "Matching:", "Pipeline GHL": "GHL pipeline",
    "— Sin pipeline —": "— No pipeline —", "Precio de venta (€)": "Sale price (€)", "Solo se usa si las oportunidades ganadas de GHL no traen importe.": "Only used if won GHL opportunities have no value.",
    "Guardar ajustes": "Save settings", "Menciones": "Mentions", "Emojis": "Emojis", "Mencionar a alguien": "Mention someone", "Reaccionar": "React", "Escribe un comentario… Usa @ para mencionar": "Write a comment… Use @ to mention", "Copiar enlace": "Copy link", "Enlace copiado": "Link copied", "Hacer con Claude": "Do with Claude", "Claude comprueba primero si puede hacerla": "Claude first checks whether it can do it", "Así funciona": "How it works", "Se abre Claude con esta tarea ya escrita. Revísala y envíala.": "Claude opens with this task already written. Review it and send it.", "Claude comprueba primero si puede hacerla con sus herramientas y accesos, y te da su veredicto: ✅ puedo · ⚠️ solo una parte · ❌ no puedo, con lo que le falta.": "Claude first checks whether it can do it with its tools and access, and gives you a verdict: ✅ can · ⚠️ only part · ❌ can't, with what it's missing.", "Solo empieza cuando se lo confirmes, y te pide permiso antes de enviar, publicar, borrar o pagar.": "It only starts once you confirm, and asks before sending, publishing, deleting or paying.", "Al acabar, pega aquí su resumen para guardarlo en la tarea.": "When it's done, paste its summary here to save it on the task.", "Lo que recibe Claude": "What Claude receives", "Abrir en Claude": "Open in Claude", "Abrir en la app de escritorio": "Open in the desktop app", "Copiar": "Copy", "Copiado": "Copied", "Resultado de Claude": "Claude's result", "Pega aquí el resumen que te dé Claude al terminar": "Paste the summary Claude gives you when it's done", "Guardar como comentario": "Save as comment", "Resultado guardado en la tarea": "Result saved on the task", "Enviada a Claude": "Sent to Claude", "Claude": "Claude", "Reuniones": "Meetings", "Nueva reunión": "New meeting", "Editar reunión": "Edit meeting", "Crear reunión": "Create meeting", "Reunión creada": "Meeting created", "Reunión guardada": "Meeting saved", "Reunión borrada": "Meeting deleted", "Borrar reunión": "Delete meeting", "Resumen de lo que se habla en cada reunión, las decisiones y las tareas que salen de ella.": "Summary of what's discussed in each meeting, the decisions and the tasks that come out of it.", "Aún no hay reuniones. Añade la primera con «Nueva reunión».": "No meetings yet. Add the first one with «New meeting».", "Notas originales": "Original notes", "Decisiones": "Decisions", "Tareas de la reunión": "Meeting tasks", "Sin tareas todavía.": "No tasks yet.", "Puntos tratados": "Topics discussed", "Notas": "Notes", "Asistentes": "Attendees", "Decisiones (una por línea)": "Decisions (one per line)", "Puntos tratados («Título: texto», separados por una línea en blanco)": "Topics («Title: text», separated by a blank line)", "Enlace a las notas originales": "Link to the original notes", "De qué se habló y con qué se quedó el equipo": "What was discussed and what the team took away", "Reunión de equipo": "Team meeting", "Se borra el resumen de la reunión. Sus tareas se quedan en el tablero.": "The meeting summary is deleted. Its tasks stay on the board.", "De pago": "Paid", "Orgánico": "Organic", "De pago (Meta Ads)": "Paid (Meta Ads)", "Sin clasificar": "Unclassified", "Origen": "Origin", "De pago y orgánico": "Paid and organic", "Etiquetas origen-paid / origen-organico de GHL": "GHL tags origen-paid / origen-organico", "Registro → venta": "Sign-up → sale", "CPL": "CPL", "Solo orgánico": "Organic only", "Leads con la etiqueta origen-organico en GHL. No tienen gasto en anuncios, así que no se muestran los datos de Meta.": "Leads tagged origen-organico in GHL. They have no ad spend, so Meta data isn't shown.", "Pulsa «De pago» u «Orgánico» para ver todo el informe solo con ese origen. El CPL de pago es el gasto de Meta entre los registros de pago.": "Click «Paid» or «Organic» to see the whole report for that origin only. Paid CPL is Meta spend divided by paid sign-ups.", "Etapa de compra": "Purchase stage", "Esta etapa y las siguientes cuentan como venta.": "This stage and the following ones count as a sale.", "Cada funnel se reconoce por el nombre de sus campañas en Meta y por su pipeline de GHL (o, si no tiene, por las etiquetas de cada paso).": "Each funnel is recognised by its Meta campaign names and its GHL pipeline (or, if it has none, by each step's tags).", "Falta la clave del puente con amplify-web (": "The bridge key to amplify-web is missing (", ") en Vercel. Mientras tanto puedes ver cómo quedará con datos de ejemplo.": ") in Vercel. Meanwhile you can preview it with sample data.", "No se pudo cargar el informe": "Couldn't load the report", "Informes · Meta Ads + GoHighLevel": "Reports · Meta Ads + GoHighLevel",
    "Informes de funnels": "Funnel reports", "Datos de ejemplo": "Sample data", "Actualizando…": "Updating…", "Actualizar": "Refresh",
    "Falta conectar Meta Ads y GoHighLevel": "Meta Ads and GoHighLevel aren't connected yet", "Añade en Vercel (Settings → Environment Variables)": "Add in Vercel (Settings → Environment Variables)",
    ", y vuelve a publicar. Mientras tanto puedes ver cómo quedará con datos de ejemplo.": ", then redeploy. Meanwhile you can preview it with sample data.", "y": "and",
    "Ver con datos de ejemplo": "View with sample data", "Estás viendo datos de ejemplo": "You're viewing sample data",
    "Las cifras son inventadas para enseñar la vista. No son de tus campañas.": "These figures are made up to show the view. They're not from your campaigns.",
    "Ver datos reales": "View real data", "No se pudo leer Meta Ads:": "Couldn't read Meta Ads:", "No se pudo leer GoHighLevel:": "Couldn't read GoHighLevel:", "Cargando…": "Loading…",
    "Gasto en Meta": "Meta spend", "CPL real": "Real CPL", "Cómo va el día": "How today is going", "Registros y coste por registro": "Sign-ups and cost per sign-up",
    "Evolución diaria": "Daily trend", "Embudo de conversión": "Conversion funnel", "De la landing a la venta": "From landing page to sale", "Rentabilidad": "Profitability",
    "Lo que cuesta y lo que deja": "What it costs and what it brings in", "gasto de Meta ÷ registros en GHL": "Meta spend ÷ GHL sign-ups", "Coste por cita": "Cost per call",
    "gasto ÷ citas reservadas": "spend ÷ booked calls", "gasto ÷ ventas": "spend ÷ sales", "Ingresos": "Revenue", "oportunidades ganadas en GHL": "won GHL opportunities",
    "ingresos ÷ gasto": "revenue ÷ spend", "gasto ÷ leads que cuenta Meta": "spend ÷ leads counted by Meta", "Estado de los leads": "Lead status",
    "Dónde está cada registro": "Where each sign-up is", "Solo registrado": "Signed up only", "Cita reservada": "Call booked", "Compró": "Purchased",
    "Se rellena con las etiquetas de GHL de cada paso.": "Filled from each step's GHL tags.", "Pipeline comercial": "Sales pipeline", "Embudo GHL": "GHL funnel",
    "Elige el pipeline de GHL de este funnel en Ajustes.": "Choose this funnel's GHL pipeline in Settings.", "Nivel anuncio": "Ad level", "Anuncios": "Ads",
    "Activos": "Active", "Anuncio": "Ad", "Impr.": "Impr.", "Activo": "Active", "No hay anuncios con gasto en este rango.": "No ads with spend in this range.",
    "Geografía": "Geography", "Leads por país": "Leads by country", "País": "Country", "Clics": "Clicks", "Inscritos GHL": "GHL sign-ups", "% inscritos": "% sign-ups",
    "Sin datos por país.": "No country data.", "Los inscritos de GHL se asignan por el prefijo del teléfono: solo cuentan los registros con teléfono.": "GHL sign-ups are assigned by phone prefix: only sign-ups with a phone number count.",
    "Segmentación Meta": "Meta targeting", "Audiencia por edad y género": "Audience by age and gender", "Tráfico": "Traffic", "Impresiones": "Impressions", "Alcance": "Reach",
    "Clics en el enlace": "Link clicks", "Campañas Meta": "Meta campaigns", "Campaña": "Campaign", "Detalle": "Detail",
    "No hay campañas que coincidan con este funnel. Revisa las palabras clave en Ajustes.": "No campaigns match this funnel. Check the keywords in Settings.",
    "Amplify · Datos de GoHighLevel y Meta Ads · Se actualizan cada 5 minutos · Sin datos personales": "Amplify · Data from GoHighLevel and Meta Ads · Updated every 5 minutes · No personal data",
    "Landing": "Landing page", "Ventas en Meta": "Meta sales", "Leads Meta": "Meta leads", "Ajustes de informes": "Report settings", 
    "Panel de tareas · Amplify": "Task panel · Amplify", "registro": "sign-up", "registros": "sign-ups", "gasto": "spend", "ninguna": "none", "asistió": "attended", "cita": "call", "compra": "purchase", "Amplify Tareas": "Amplify Tasks", "Hola": "Hi",
    "7 d": "7 d", "14 d": "14 d", "30 d": "30 d", "Idioma": "Language"
  };
  // Textos que empiezan o acaban igual pero llevan un dato (nombre, número…)
  var PRE = [
    ["¿Borrar «", "Delete «"], ["Borrar «", "Delete «"], ["Movida a «", "Moved to «"], ["Hola, ", "Hi, "], ["Tareas activas (", "Active tasks ("],
    ["Comentarios (", "Comments ("], ["Comentario enviado · avisado ", "Comment sent · notified "], ["Nadie te ha mencionado todavía. Cuando alguien escriba @", "Nobody has mentioned you yet. When someone writes @"], ["No encuentro la tarea ", "Can't find task "], ["Enlace de ", "Link to "], ["Enviada a Claude ", "Sent to Claude "], ["Ver las tareas de ", "See tasks of "], ["Tareas de ", "Tasks of "], ["Nueva tarea de ", "New task for "],
    ["Aún no hay notas de ", "No notes from "], ["Subtareas del servicio · ", "Service subtasks · "], ["Mañana · ", "Tomorrow · "],
    ["Mensual · semana ", "Monthly · week "], ["Mensual · S", "Monthly · W"], ["Embudo GHL · ", "GHL funnel · "], ["Etiqueta GHL · ", "GHL tag · "],
    ["Actualizado ", "Updated "], ["Coinciden: ", "Matching: "],
    ["Cada servicio contratado tiene su lista de subtareas del mes. Márcalas al hacerlas; al cambiar de mes empiezan de cero. Progreso total de ", "Each contracted service has its monthly subtask list. Tick them off as you go; they reset every month. Overall progress for "]
  ];
  var MON = { ene: "Jan", feb: "Feb", mar: "Mar", abr: "Apr", may: "May", jun: "Jun", jul: "Jul", ago: "Aug", sep: "Sep", sept: "Sep", oct: "Oct", nov: "Nov", dic: "Dec" };
  var DOW = { lunes: "Monday", martes: "Tuesday", "miércoles": "Wednesday", jueves: "Thursday", viernes: "Friday", "sábado": "Saturday", domingo: "Sunday" };
  var PAT = [
    [/^(\d+) tareas? retrasadas?\.$/, function (m, n) { return n + (n === "1" ? " overdue task." : " overdue tasks."); }],
    [/^hace (\d+) min$/, "$1 min ago"],
    [/^vencida hace (\d+)d$/, "overdue by $1d"],
    [/^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre) (\d{4})$/i, function (m, mo, y) { return (D[mo] || D[mo.toLowerCase()] || mo) + " " + y; }],
    [/^Ver (\d+)$/, "View $1"],
    [/^en (AMP-\d+) · /, "in $1 · "],
    [/^Enlace de (AMP-\d+) copiado$/, "Link to $1 copied"],
    [/^(\d{1,2} [a-z]{3,4} \d{4}) · (\d+)\/(\d+) tareas abiertas$/, function (m, d, a, b) { return dates(d) + " · " + a + "/" + b + " open tasks"; }],
    [/^· (\d+)\/(\d+) hechas$/, "· $1/$2 done"],
    // Etiquetas de fecha del panel ("16 nov · vencida hace 2d", "20 nov · en 3d", "18 nov · 21:30")
    [/^(\d{1,2} [a-z]{3,4}(?: \d{4})?) · vencida hace (\d+)d$/, function (m, d, n) { return dates(d) + " · overdue by " + n + "d"; }],
    [/^(\d{1,2} [a-z]{3,4}(?: \d{4})?) · en (\d+)d$/, function (m, d, n) { return dates(d) + " · in " + n + "d"; }],
    [/^(\d{1,2} [a-z]{3,4}(?: \d{4})?)( · \d{1,2}:\d{2})?$/, function (m, d, h) { return dates(d) + (h || ""); }],
    [/^Mañana · (\d{1,2} [a-z]{3,4}(?: \d{4})?)$/, function (m, d) { return "Tomorrow · " + dates(d); }],
    [/^Aún no hay notas de (.+) para este proyecto\.$/, "No $1 notes for this project yet."],
    [/^(Semanal|Mensual · semana (\d)) · día antes de la reunión \((lunes|martes|miércoles|jueves|viernes|sábado|domingo)\)$/, function (m, f, w, d) { return (w ? "Monthly · week " + w : "Weekly") + " · day before the meeting (" + DOW[d] + ")"; }]
  ];
  function dates(s) {
    return s
      .replace(/\b(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sept?|oct|nov|dic)\b\.?/g, function (m, d, mo) { return d + " " + MON[mo]; })
      .replace(/\((lunes|martes|miércoles|jueves|viernes|sábado|domingo)\)/g, function (m, d) { return "(" + DOW[d] + ")"; });
  }
  function tr(core) {
    if (Object.prototype.hasOwnProperty.call(D, core)) return D[core];
    for (var i = 0; i < PAT.length; i++) if (PAT[i][0].test(core)) return core.replace(PAT[i][0], PAT[i][1]);
    // Textos de la interfaz que llevan un nombre o un número detrás ("Hola, Alba", "Comentarios (2)")
    for (var j = 0; j < PRE.length; j++) {
      if (core.indexOf(PRE[j][0]) === 0) return PRE[j][1] + core.slice(PRE[j][0].length);
    }
    return null;
  }
  function translate(s) {
    if (!s || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(s)) return null;
    var m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var core = m[2].replace(/\s+/g, " ");
    var t = tr(core);
    if (t == null || t === core) return null;
    return m[1] + t + m[3];
  }

  /* ---------- recorrido del DOM ---------- */
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var done = new WeakMap();
  // Contenido escrito por el equipo: títulos, descripciones, comentarios, notas, nombres de proyecto…
  var USER = ".c-title,.c-desc,.lt,.ld,.st,.note,.desc,.nm,.db>h2,.mh>h2,.c-proj,.mthead h2,.mtitem b,.mtpt,[data-user-content]";
  function userText(parent) {
    try { return !!(parent.closest && parent.closest(USER)) || (parent.matches && parent.matches(".t1")); } catch (e) { return false; }
  }
  function skipEl(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (SKIP[e.tagName] || e.isContentEditable || e.hasAttribute("data-noi18n")) return true;
    }
    return false;
  }
  function doText(n) {
    if (done.get(n) === n.nodeValue) return;
    if (n.parentNode && (skipEl(n.parentNode) || userText(n.parentNode))) return;
    var t = translate(n.nodeValue);
    if (t != null) n.nodeValue = t;
    done.set(n, n.nodeValue);
  }
  function doAttrs(el) {
    if (skipEl(el.tagName === "TEXTAREA" ? el.parentNode : el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v) { var t = translate(v); if (t != null) el.setAttribute(ATTRS[i], t); }
    }
    if (el.tagName === "INPUT" && (el.type === "button" || el.type === "submit") && el.value) {
      var tv = translate(el.value); if (tv != null) el.value = tv;
    }
    if (el.tagName === "OPTGROUP" && el.label) { var tl = translate(el.label); if (tl != null) el.label = tl; }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (root.tagName === "TEXTAREA") return doAttrs(root); if (SKIP[root.tagName]) return; doAttrs(root); }
    var w = document.createTreeWalker(root, 1 | 4, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else if (n.tagName === "TEXTAREA") doAttrs(n);
      else if (SKIP[n.tagName]) continue;
      else doAttrs(n);
    }
  }
  function translatePage() {
    if (document.title) { var tt = translate(document.title.replace(/ · /g, " · ")); if (tt) document.title = tt; }
    walk(document.body);
  }

  function start() {
    addStyle();
    mountSwitches(document);
    if (LANG !== "en") return;
    document.documentElement.lang = "en";
    translatePage();
    document.documentElement.classList.remove("i18n-pending");
    var mo = new MutationObserver(function (list) {
      mo.disconnect();
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === "characterData") doText(r.target);
        else if (r.type === "attributes") { if (r.target.nodeType === 1) doAttrs(r.target); }
        else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      }
      mountSwitches(document);
      observe();
    });
    function observe() {
      mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    observe();
  }
  // Selector también en español (sin traducir)
  if (LANG !== "en") {
    var mo2 = new MutationObserver(function () { mountSwitches(document); });
    var go2 = function () { addStyle(); mountSwitches(document); mo2.observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go2); else go2();
    return;
  }
  // En las páginas de React se espera a que termine la hidratación para no chocar con ella.
  var late = document.currentScript && document.currentScript.getAttribute("data-late") === "1";
  var go = function () { late ? setTimeout(start, 0) : start(); };
  if (late) { if (document.readyState === "complete") go(); else window.addEventListener("load", go); }
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  // Por si algo falla, nunca dejar la página oculta
  setTimeout(function () { document.documentElement.classList.remove("i18n-pending"); }, 2500);
})();
