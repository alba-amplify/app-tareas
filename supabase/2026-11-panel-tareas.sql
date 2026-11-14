-- ============================================================
--  Panel de tareas (noviembre 2026)
--  Guarda el panel entero (proyectos, tareas, notas, comentarios)
--  como un único documento JSON. Solo el equipo activo lo ve y lo edita.
--
--  Pega este archivo entero en Supabase > SQL Editor > New query.
--  La primera vez que alguien abra el panel se carga solo con las
--  tareas de las reuniones (Gemini y Otter) hasta el 12/11.
-- ============================================================

begin;

create table if not exists public.panel_state (
  id          int primary key default 1 check (id = 1),
  data        jsonb not null,
  rev         int not null default 1,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ¿El usuario actual es del equipo activo?
create or replace function public.is_active_member()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select active is not false from public.profiles where id = auth.uid()),
    false
  );
$$;

alter table public.panel_state enable row level security;

drop policy if exists "panel legible por el equipo" on public.panel_state;
create policy "panel legible por el equipo"
  on public.panel_state for select to authenticated
  using (public.is_active_member());

drop policy if exists "panel creable por el equipo" on public.panel_state;
create policy "panel creable por el equipo"
  on public.panel_state for insert to authenticated
  with check (public.is_active_member());

drop policy if exists "panel editable por el equipo" on public.panel_state;
create policy "panel editable por el equipo"
  on public.panel_state for update to authenticated
  using (public.is_active_member())
  with check (public.is_active_member());

commit;

-- Comprobación (vacía hasta que alguien abra el panel por primera vez):
select id, rev, updated_at, jsonb_array_length(data->'tasks') as tareas
from public.panel_state;

-- ------------------------------------------------------------
--  Para volver a cargar el panel desde cero (borra lo que haya):
--    delete from public.panel_state where id = 1;
-- ------------------------------------------------------------
