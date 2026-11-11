-- Noche de película (E2): sesiones guardadas.
-- Se corre a mano en Supabase: SQL Editor -> New query -> pegar -> Run.

-- ============================================================
-- Tablas
-- ============================================================
create table public.sesiones (
  id                bigint generated always as identity primary key,

  -- default auth.uid(): igual que mi_lista, el frontend no envía user_id
  -- y el with check de la policy de insert impide falsificarlo.
  user_id           uuid not null default auth.uid()
                      references auth.users (id) on delete cascade,

  -- Siempre hay nombre: si la persona no escribe uno, el cliente guarda
  -- "Noche del 11 de nov". char_length cuenta caracteres, no bytes.
  nombre            text not null
                      check (char_length(nombre) between 1 and 60),
  tiempo_disponible integer not null
                      check (tiempo_disponible between 30 and 600),
  creada_en         timestamptz not null default now()
);

-- "Mis sesiones": filtra por dueño y ordena de la más reciente a la más antigua.
create index sesiones_user_id_creada_en_idx on public.sesiones (user_id, creada_en desc);

create table public.sesion_peliculas (
  id            bigint generated always as identity primary key,
  -- on delete cascade: si se borra la sesión (o la cuenta), se borran sus películas.
  sesion_id     bigint not null references public.sesiones (id) on delete cascade,

  -- Copia de lo que se vio al armar la sesión. Sin FK a mi_lista a propósito:
  -- la sesión es un plan histórico y no debe cambiar si la lista cambia.
  tmdb_id       integer not null,
  titulo        text not null,
  poster_url    text,
  duracion_min  integer not null check (duracion_min > 0),
  orden         integer not null check (orden >= 1),

  -- Una película una sola vez por sesión; el orden no se repite.
  -- (sesion_id, orden) también sirve de índice para buscar por sesion_id.
  unique (sesion_id, tmdb_id),
  unique (sesion_id, orden)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.sesiones enable row level security;
alter table public.sesion_peliculas enable row level security;

-- Solo select e insert. No hay policies de update ni delete: las sesiones
-- guardadas son de solo lectura (DEC-03) y sin policy esa operación se deniega.
create policy "sesiones: select propio"
  on public.sesiones for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "sesiones: insert propio"
  on public.sesiones for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Las películas heredan el permiso de su sesión: solo se ven o se crean
-- si la sesión a la que apuntan es del usuario.
create policy "sesion_peliculas: select propio"
  on public.sesion_peliculas for select
  to authenticated
  using (
    exists (
      select 1 from public.sesiones s
      where s.id = sesion_peliculas.sesion_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "sesion_peliculas: insert propio"
  on public.sesion_peliculas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sesiones s
      where s.id = sesion_peliculas.sesion_id
        and s.user_id = (select auth.uid())
    )
  );

-- ============================================================
-- Guardado atómico
-- ============================================================
-- Una sola transacción: o se guardan la sesión y todas sus películas, o nada.
-- security invoker: corre con los permisos de quien llama, así RLS sigue aplicando.
-- p_peliculas es un arreglo JSON de { tmdb_id, titulo, poster_url, duracion_min }
-- en el orden en que se agregaron; la posición en el arreglo se guarda como orden.
create function public.guardar_sesion(
  p_nombre            text,
  p_tiempo_disponible integer,
  p_peliculas         jsonb
) returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id bigint;
begin
  if p_peliculas is null
     or jsonb_typeof(p_peliculas) <> 'array'
     or jsonb_array_length(p_peliculas) = 0 then
    raise exception 'Una sesión necesita al menos una película';
  end if;

  insert into public.sesiones (nombre, tiempo_disponible)
  values (p_nombre, p_tiempo_disponible)
  returning id into v_id;

  insert into public.sesion_peliculas
    (sesion_id, tmdb_id, titulo, poster_url, duracion_min, orden)
  select v_id,
         (e.elemento ->> 'tmdb_id')::integer,
         e.elemento ->> 'titulo',
         e.elemento ->> 'poster_url',
         (e.elemento ->> 'duracion_min')::integer,
         e.posicion::integer
  from jsonb_array_elements(p_peliculas) with ordinality as e(elemento, posicion);

  return v_id;
end;
$$;

-- Por defecto Supabase deja ejecutar funciones a anon; aquí solo a usuarios con sesión.
revoke all on function public.guardar_sesion(text, integer, jsonb) from public, anon;
grant execute on function public.guardar_sesion(text, integer, jsonb) to authenticated;
