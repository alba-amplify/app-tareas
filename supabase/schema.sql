-- ============================================================
--  Amplify Tareas — Esquema de base de datos
--  Ejecuta este archivo entero en:  Supabase > SQL Editor > New query
-- ============================================================

-- 1) PERFILES (extienden a los usuarios de autenticación)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        text not null,
  department  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Permiso para gestionar tareas sin ser admin completo
alter table public.profiles
  add column if not exists can_manage_tasks boolean not null default false;

-- 2) TAREAS
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  priority     text not null default 'media' check (priority in ('alta','media','baja')),
  due_date     date,
  assignee_id  uuid references public.profiles(id) on delete set null,
  department   text,
  next_action  text,
  done         boolean not null default false,
  done_at      timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3) COMENTARIOS
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Índices útiles
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists tasks_due_idx on public.tasks(due_date);
create index if not exists comments_task_idx on public.comments(task_id);

-- ============================================================
--  SEGURIDAD (Row Level Security)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tasks    enable row level security;
alter table public.comments enable row level security;

-- Función auxiliar: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ¿Puede gestionar tareas? (admin o permiso explícito)
create or replace function public.can_manage_tasks()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin or can_manage_tasks from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---- PERFILES ----
drop policy if exists "perfiles legibles" on public.profiles;
create policy "perfiles legibles"
  on public.profiles for select to authenticated using (true);

drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil"
  on public.profiles for update to authenticated using (id = auth.uid());

-- ---- TAREAS ----
-- Todos ven todas las tareas (panel del equipo)
drop policy if exists "tareas legibles" on public.tasks;
create policy "tareas legibles"
  on public.tasks for select to authenticated using (true);

-- Crean tareas quienes pueden gestionarlas
drop policy if exists "admin crea tareas" on public.tasks;
create policy "admin crea tareas"
  on public.tasks for insert to authenticated with check (public.can_manage_tasks());

-- Gestores editan todo; el responsable puede editar la suya (p.ej. marcar hecha)
drop policy if exists "editar tareas" on public.tasks;
create policy "editar tareas"
  on public.tasks for update to authenticated
  using (public.can_manage_tasks() or assignee_id = auth.uid());

-- Borran quienes pueden gestionar tareas
drop policy if exists "admin borra tareas" on public.tasks;
create policy "admin borra tareas"
  on public.tasks for delete to authenticated using (public.can_manage_tasks());

-- ---- COMENTARIOS ----
drop policy if exists "comentarios legibles" on public.comments;
create policy "comentarios legibles"
  on public.comments for select to authenticated using (true);

drop policy if exists "crear comentario propio" on public.comments;
create policy "crear comentario propio"
  on public.comments for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "borrar comentario propio" on public.comments;
create policy "borrar comentario propio"
  on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "editar comentario propio" on public.comments;
create policy "editar comentario propio"
  on public.comments for update to authenticated
  using (author_id = auth.uid());

-- ============================================================
--  NOTIFICACIONES (menciones @usuario)
-- ============================================================
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id     uuid references public.profiles(id) on delete set null,
  task_id      uuid references public.tasks(id) on delete cascade,
  comment_id   uuid references public.comments(id) on delete cascade,
  type         text not null default 'mention',
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists notif_recipient_idx
  on public.notifications(recipient_id, read);

alter table public.notifications enable row level security;

-- Cada uno solo ve SUS notificaciones
drop policy if exists "notif leer propias" on public.notifications;
create policy "notif leer propias"
  on public.notifications for select to authenticated
  using (recipient_id = auth.uid());

-- Se pueden crear notificaciones si el actor eres tú (al mencionar)
drop policy if exists "notif crear" on public.notifications;
create policy "notif crear"
  on public.notifications for insert to authenticated
  with check (actor_id = auth.uid());

-- Marcar como leídas las propias
drop policy if exists "notif marcar leidas" on public.notifications;
create policy "notif marcar leidas"
  on public.notifications for update to authenticated
  using (recipient_id = auth.uid());

-- ============================================================
--  RECURSOS (paneles de Contenido y Accesos)
--  Cada tarjeta tiene un título, descripción y una lista de enlaces.
-- ============================================================
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  board       text not null check (board in ('contenido','accesos','updates')),
  title       text not null,
  description text,
  links       jsonb not null default '[]'::jsonb, -- [{ "label": "...", "url": "..." }]
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists resources_board_idx on public.resources(board);

-- Tabla opcional dentro de la tarjeta: { "columns": [...], "rows": [[...]] }
alter table public.resources
  add column if not exists table_data jsonb;

-- Imagen opcional (URL pública en Supabase Storage)
alter table public.resources
  add column if not exists image_url text;

-- Categoría de la tarjeta (para filtrar por categorías)
alter table public.resources add column if not exists category text;

-- Permitir el tablero 'updates' (además de contenido y accesos)
alter table public.resources drop constraint if exists resources_board_check;
alter table public.resources
  add constraint resources_board_check
  check (board in ('contenido','accesos','updates'));

alter table public.resources enable row level security;

-- Todo el equipo puede ver y gestionar los recursos
drop policy if exists "recursos legibles" on public.resources;
create policy "recursos legibles"
  on public.resources for select to authenticated using (true);

drop policy if exists "recursos crear" on public.resources;
create policy "recursos crear"
  on public.resources for insert to authenticated with check (true);

drop policy if exists "recursos editar" on public.resources;
create policy "recursos editar"
  on public.resources for update to authenticated using (true);

drop policy if exists "recursos borrar" on public.resources;
create policy "recursos borrar"
  on public.resources for delete to authenticated using (true);

-- ============================================================
--  REACCIONES a comentarios (emojis)
-- ============================================================
create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, emoji)
);
alter table public.comment_reactions enable row level security;

drop policy if exists "reacc ver" on public.comment_reactions;
create policy "reacc ver" on public.comment_reactions
  for select to authenticated using (true);

drop policy if exists "reacc crear" on public.comment_reactions;
create policy "reacc crear" on public.comment_reactions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "reacc borrar" on public.comment_reactions;
create policy "reacc borrar" on public.comment_reactions
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================
--  CALENDARIO DE CONTENIDO RRSS
-- ============================================================
create table if not exists public.social_posts (
  id           uuid primary key default gen_random_uuid(),
  publish_date date,
  category     text,
  objective    text,
  product      text,
  status       text default 'Idea',
  link         text,
  content      text,
  copy         text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists social_posts_date_idx on public.social_posts(publish_date);
alter table public.social_posts add column if not exists script text;
alter table public.social_posts add column if not exists content_raw text;
alter table public.social_posts add column if not exists content_edited text;
alter table public.social_posts add column if not exists newsletter text;
alter table public.social_posts add column if not exists kind text not null default 'publicacion';
alter table public.social_posts add column if not exists inspiration text;
alter table public.social_posts add column if not exists format text;

alter table public.social_posts enable row level security;

drop policy if exists "rrss ver" on public.social_posts;
create policy "rrss ver" on public.social_posts
  for select to authenticated using (true);
drop policy if exists "rrss crear" on public.social_posts;
create policy "rrss crear" on public.social_posts
  for insert to authenticated with check (true);
drop policy if exists "rrss editar" on public.social_posts;
create policy "rrss editar" on public.social_posts
  for update to authenticated using (true);
drop policy if exists "rrss borrar" on public.social_posts;
create policy "rrss borrar" on public.social_posts
  for delete to authenticated using (true);

-- Comentarios de las publicaciones de RRSS
create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.social_posts(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on public.post_comments(post_id);
alter table public.post_comments enable row level security;

drop policy if exists "pcom ver" on public.post_comments;
create policy "pcom ver" on public.post_comments
  for select to authenticated using (true);
drop policy if exists "pcom crear" on public.post_comments;
create policy "pcom crear" on public.post_comments
  for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "pcom editar" on public.post_comments;
create policy "pcom editar" on public.post_comments
  for update to authenticated using (author_id = auth.uid());
drop policy if exists "pcom borrar" on public.post_comments;
create policy "pcom borrar" on public.post_comments
  for delete to authenticated using (author_id = auth.uid() or public.is_admin());

-- Notificaciones también pueden apuntar a una publicación de RRSS
alter table public.notifications
  add column if not exists post_id uuid references public.social_posts(id) on delete cascade;
