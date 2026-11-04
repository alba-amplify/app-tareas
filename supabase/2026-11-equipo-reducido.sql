-- ============================================================
--  Equipo reducido (noviembre 2026)
--  Equipo activo: Alba, Alessio, Fernando (Closer), Laura (Paid Media Lead),
--                 Sara, Sid y Zak (Closer).
--  El resto queda OCULTO (no se borra nada): desaparece de las listas,
--  pierde el acceso y sus tareas pendientes pasan a Finalizadas.
--
--  ANTES de ejecutarlo: crea el usuario de Zak en
--    Supabase > Authentication > Users > Add user
--    email: zak@amplifyesp.com · marca "Auto Confirm User"
--  Después pega este archivo entero en Supabase > SQL Editor > New query.
-- ============================================================

begin;

-- 1) Marca de usuario activo / oculto
alter table public.profiles
  add column if not exists active boolean not null default true;

-- 2) Perfil de Zak (Closer)
insert into public.profiles (id, full_name, email, role, department, is_admin)
select u.id, 'Zak', u.email, 'Closer', 'Equipo Comercial', false
from auth.users u
where lower(u.email) = 'zak@amplifyesp.com'
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      department = excluded.department,
      active = true;

-- 3) Ocultar al resto del equipo
update public.profiles
set active = false
where full_name in (
  'Carlos', 'Jan', 'Khalid', 'Miguel', 'Pedro',
  'QA Vercel', 'Raquel', 'Rocío', 'Tomás'
);

-- 4) Sus tareas pendientes pasan a Finalizadas
update public.tasks t
set done = true,
    done_at = now(),
    updated_at = now()
from public.profiles p
where t.assignee_id = p.id
  and p.active = false
  and t.done = false;

-- 5) Quitarles el acceso (bloqueo reversible, no borra la cuenta).
--    Se excluye access@amplifyesp.com por seguridad, para no dejarte fuera.
update auth.users u
set banned_until = 'infinity'
from public.profiles p
where p.id = u.id
  and p.active = false
  and lower(u.email) <> 'access@amplifyesp.com';

commit;

-- Comprobación: debería listar a los 7 activos
select full_name, role, department, active
from public.profiles
order by active desc, full_name;

-- ------------------------------------------------------------
--  Para volver a activar a alguien (ejemplo con Carlos):
--    update public.profiles set active = true where full_name = 'Carlos';
--    update auth.users set banned_until = null
--      where id = (select id from public.profiles where full_name = 'Carlos');
-- ------------------------------------------------------------
