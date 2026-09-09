// ============================================================
//  Crea los 11 usuarios del equipo Amplify en Supabase.
//  Ejecutar UNA VEZ:  node supabase/seed-users.mjs
//  Requiere en .env.local:  NEXT_PUBLIC_SUPABASE_URL  y  SUPABASE_SERVICE_ROLE_KEY
// ============================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Carga simple de .env.local (sin dependencias extra)
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  process.exit(1);
}

// Contraseña inicial para todos (cámbiala tú luego si quieres).
const TEMP_PASSWORD = "Amplify2026!";

const users = [
  { name: "Sid",      role: "Director / CEO",          email: "sid@amplifyesp.com",              department: "Dirección",          is_admin: false },
  { name: "Alessio",  role: "Creador Co-CEO",          email: "alessiopierucci2001@gmail.com",   department: "Dirección",          is_admin: false },
  { name: "Carlos",   role: "Head of Revenue",         email: "carlos@amplifyesp.com",           department: "Equipo Comercial",   is_admin: false },
  { name: "Laura",    role: "Paid Media Lead",         email: "lauracobarro@gmail.com",          department: "Equipo Publicidad",  is_admin: false },
  { name: "Alba",     role: "Project Manager",         email: "alba@amplifyesp.com",             department: "Estrategia",         is_admin: true  },
  { name: "Miguel",   role: "Organic Content Executor",email: "mrooyaan@gmail.com",              department: "Equipo Diseño",      is_admin: false },
  { name: "Sara",     role: "Head Of Setters",         email: "sara@amplifyesp.com",             department: "Equipo Comercial",   is_admin: false },
  { name: "Raquel",   role: "Setter",                  email: "raquel@amplifyesp.com",           department: "Equipo Comercial",   is_admin: false },
  { name: "Tomás",    role: "Setter",                  email: "tomasgonzalezb5@gmail.com",       department: "Equipo Comercial",   is_admin: false },
  { name: "Khalid",   role: "SDR / TRIAGE",            email: "khalidzamma@gmail.com",           department: "Equipo Comercial",   is_admin: false },
  { name: "Fernando", role: "Closer",                  email: "fernando@amplifyesp.com",         department: "Equipo Comercial",   is_admin: false },
  { name: "Jan",      role: "Contenidos",              email: "jjanmacia@gmail.com",             department: "Equipo Contenidos",  is_admin: false },
  { name: "Pedro",    role: "Contenidos",              email: "pedro@pegallardo.com",            department: "Equipo Contenidos",  is_admin: false },
  { name: "Rocío",    role: "IT",                      email: "rotoledo93@gmail.com",            department: "Equipo Desarrollo",  is_admin: false },
];

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const u of users) {
  // Crea el usuario de autenticación (email ya confirmado)
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: TEMP_PASSWORD,
    email_confirm: true,
  });

  let userId = data?.user?.id;

  if (error) {
    if (/already been registered|already exists/i.test(error.message)) {
      // Ya existía: buscamos su id por email
      const { data: list } = await admin.auth.admin.listUsers();
      userId = list?.users?.find((x) => x.email === u.email)?.id;
      console.log(`↺ ya existía: ${u.email}`);
    } else {
      console.error(`✗ ${u.email}: ${error.message}`);
      continue;
    }
  } else {
    console.log(`✓ creado: ${u.email}`);
  }

  if (!userId) continue;

  // Crea/actualiza su perfil
  const { error: pErr } = await admin.from("profiles").upsert({
    id: userId,
    full_name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    is_admin: u.is_admin,
  });
  if (pErr) console.error(`  perfil ${u.email}: ${pErr.message}`);
}

console.log(`\nListo. Contraseña inicial de todos: ${TEMP_PASSWORD}`);
