// Genera un borrador de newsletter para cada publicación a partir de su copy.
// Ejecutar: node supabase/seed-newsletter.mjs
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

const { data: posts } = await admin
  .from("social_posts")
  .select("id, copy, category, newsletter");

let n = 0;
for (const p of posts ?? []) {
  if (p.newsletter || !p.copy) continue;
  const subject = p.copy.split("\n")[0].trim();
  const newsletter =
    `Asunto: ${subject}\n\n` +
    `Hola 👋\n\n` +
    `${p.copy}\n\n` +
    `Esta semana lo compartimos en redes y te lo dejo aquí. ` +
    `Si quieres que lo apliquemos a tu proyecto, responde a este email.\n\n` +
    `— Equipo Amplify`;
  await admin.from("social_posts").update({ newsletter }).eq("id", p.id);
  n++;
}
console.log(`✓ newsletter generada para ${n} publicaciones`);
