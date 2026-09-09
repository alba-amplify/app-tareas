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
// 1) Restaurar la story del 7/9 que se convirtió en Reel (contenido intacto)
const r1 = await c.query(`
  update public.social_posts set kind='story', format='Story'
  where publish_date='2026-09-07' and objective='Calentamiento (Lunes)'
`);
console.log("story 7/9 restaurada:", r1.rowCount);
// 2) Asegurar formato 'Story' en TODAS las stories (evita el bug del default a Reel)
const r2 = await c.query(`
  update public.social_posts set format='Story'
  where kind='story' and (format is null or format='')
`);
console.log("stories con formato Story:", r2.rowCount);
await c.end();
