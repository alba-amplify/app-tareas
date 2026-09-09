// Crea el bucket público "resource-images" y sus políticas de acceso.
// Ejecutar:
//   PGHOST=... PGUSER=... PGPASSWORD=... node supabase/setup-storage.mjs
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// 1) Crear el bucket público (idempotente)
const { error: bErr } = await supabase.storage.createBucket("resource-images", {
  public: true,
  fileSizeLimit: "10MB",
});
if (bErr && !/already exists/i.test(bErr.message)) {
  console.error("bucket:", bErr.message);
} else {
  console.log("✓ bucket resource-images listo");
}

// 2) Políticas de acceso sobre storage.objects
const policySql = `
drop policy if exists "img ver" on storage.objects;
create policy "img ver" on storage.objects
  for select using (bucket_id = 'resource-images');

drop policy if exists "img subir" on storage.objects;
create policy "img subir" on storage.objects
  for insert to authenticated with check (bucket_id = 'resource-images');

drop policy if exists "img borrar" on storage.objects;
create policy "img borrar" on storage.objects
  for delete to authenticated using (bucket_id = 'resource-images');
`;

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
try {
  await client.connect();
  await client.query(policySql);
  console.log("✓ políticas de storage aplicadas");
} catch (e) {
  console.error("políticas:", e.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
