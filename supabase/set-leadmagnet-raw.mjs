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
const LINK =
  "https://www.canva.com/design/DAHR_MdNMyY/FTO1BytoRrm0SGNVtuvhAw/edit";
const r = await c.query(
  `update public.social_posts set content_raw = $1
   where (objective ilike '%regalo%' or objective ilike '%capta%'
          or objective ilike '%lead%' or category = 'Lead Magnet')
     and (content_raw is null or content_raw = '')`,
  [LINK],
);
console.log("lead magnets actualizados:", r.rowCount);
await c.end();
