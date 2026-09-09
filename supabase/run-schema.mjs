// Ejecuta schema.sql contra la base de datos.
// La conexión se pasa por variables de entorno (no se guarda en disco).
import pg from "pg";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

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
  await client.query(sql);
  console.log("✓ Esquema aplicado correctamente");
} catch (e) {
  console.error("✗ Error:", e.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
