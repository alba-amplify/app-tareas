"use server";

import { createClient } from "@/lib/supabase/server";

const APP_URL = "https://amplify-tareas.vercel.app";

// Envía un DM de Slack a cada usuario (por su email en la app).
// Silencioso si no hay token o no se encuentra al usuario en Slack.
export async function slackDMToUsers(recipientIds: string[], text: string) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token || recipientIds.length === 0) return;

  const supabase = await createClient();
  const { data: recipients } = await supabase
    .from("profiles")
    .select("email")
    .in("id", recipientIds);

  for (const r of recipients ?? []) {
    try {
      const lookup = await fetch(
        `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(r.email)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ).then((x) => x.json());

      if (!lookup.ok || !lookup.user?.id) continue;

      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ channel: lookup.user.id, text }),
      });
    } catch {
      // La notificación dentro de la app ya quedó guardada.
    }
  }
}

// Aviso de mención en un comentario.
export async function notifyMentionsSlack(
  taskTitle: string,
  recipientIds: string[],
) {
  if (recipientIds.length === 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: actor } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const actorName = actor?.full_name ?? "Alguien";

  await slackDMToUsers(
    recipientIds,
    `📌 *${actorName}* te ha mencionado en la tarea *${taskTitle}*.\nÁbrela en el panel: ${APP_URL}`,
  );
}

// Aviso de mención en una publicación de RRSS.
export async function notifyPostMentionsSlack(
  postTitle: string,
  recipientIds: string[],
) {
  if (recipientIds.length === 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: actor } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const actorName = actor?.full_name ?? "Alguien";

  await slackDMToUsers(
    recipientIds,
    `📣 *${actorName}* te ha mencionado en la publicación *${postTitle}*.\nÁbrela en RRSS: ${APP_URL}/rrss`,
  );
}
