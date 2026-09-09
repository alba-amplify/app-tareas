// Mueve el contenido de las stories del campo script (Guion) a content (Contenido).
import pg from "pg";
const c = new pg.Client({
  host: "aws-1-eu-west-2.pooler.supabase.com",
  port: 5432,
  user: "postgres.mltjwzxulrbpoolpexhj",
  password: "Amplify2026@!",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const r = await c.query(`
  update public.social_posts
  set content = script || case when content is not null and content <> ''
                               then E'\n\n' || content else '' end,
      script = null
  where kind = 'story' and script is not null and script <> ''
`);
console.log("stories movidas a Contenido:", r.rowCount);
await c.end();
