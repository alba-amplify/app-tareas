-- ============================================================
--  Alta de Florencia (Equipo Desarrollo)
--  Email: sanchez.florenciadaniela@gmail.com
--
--  ANTES de ejecutarlo: crea su usuario en
--    Supabase > Authentication > Users > Add user > Create new user
--    email: sanchez.florenciadaniela@gmail.com · marca "Auto Confirm User"
--    (pon cualquier contraseña: ella entrará con "Entrar con Google")
--  Después pega este archivo en Supabase > SQL Editor > New query > Run.
-- ============================================================

insert into public.profiles (id, full_name, email, role, department, is_admin, active)
select u.id, 'Flor', u.email, 'Desarrollo', 'Equipo Desarrollo', false, true
from auth.users u
where lower(u.email) = 'sanchez.florenciadaniela@gmail.com'
on conflict (id) do update
  set full_name  = excluded.full_name,
      role       = excluded.role,
      department = excluded.department,
      active     = true;

-- Comprobación: debe salir una fila con Flor
select full_name, email, role, department, active
from public.profiles
where lower(email) = 'sanchez.florenciadaniela@gmail.com';
