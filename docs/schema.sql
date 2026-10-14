-- Schema de Mi Cartelera Personal.
-- Se corre a mano en Supabase: SQL Editor -> New query -> pegar -> Run.

-- ============================================================
-- Tabla
-- ============================================================
create table public.mi_lista (
  id                    bigint generated always as identity primary key,

  -- default auth.uid(): el frontend no necesita enviar user_id, y el
  -- with check de la policy de insert garantiza que no se pueda falsificar.
  -- on delete cascade: si se borra la cuenta, se borra su lista.
  user_id               uuid not null default auth.uid()
                          references auth.users (id) on delete cascade,

  tmdb_id               integer not null,
  titulo                text not null,
  poster_url            text,
  tipo_contenido        text not null
                          check (tipo_contenido in ('pelicula', 'serie')),
  estado                text not null default 'por_ver'
                          check (estado in ('por_ver', 'viendo', 'vista')),
  calificacion_personal integer
                          check (calificacion_personal between 1 and 5),
  comentario            text,
  fecha_agregado        timestamptz not null default now(),

  -- Los IDs de TMDB se repiten entre películas y series, por eso el tipo
  -- forma parte de la unicidad. Evita agregar el mismo título dos veces.
  unique (user_id, tmdb_id, tipo_contenido)
);

-- Todas las queries filtran por user_id (RLS y "Mi lista").
create index mi_lista_user_id_idx on public.mi_lista (user_id);

-- ============================================================
-- Row Level Security
-- ============================================================
-- Con RLS activo y sin policies nadie accede a nada; cada policy abre
-- una sola operación, solo para filas propias.
alter table public.mi_lista enable row level security;

-- (select auth.uid()) en vez de auth.uid() directo: Postgres lo evalúa una
-- vez por query en lugar de una vez por fila.
create policy "mi_lista: select propio"
  on public.mi_lista for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "mi_lista: insert propio"
  on public.mi_lista for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- using filtra qué filas se pueden editar; with check impide
-- reasignar la fila a otro user_id al actualizarla.
create policy "mi_lista: update propio"
  on public.mi_lista for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "mi_lista: delete propio"
  on public.mi_lista for delete
  to authenticated
  using ((select auth.uid()) = user_id);
