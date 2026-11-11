# Auditoría de E2 — Noche de película

Estado de cada criterio de las [historias](backlog/historias-e2.md), de la [spec](specs/spec-e2-noche-de-pelicula.md) y de [`DESIGN.md`](../DESIGN.md), con su evidencia.

- **Cumple:** hay una prueba o una inspección que lo demuestra, y se cita.
- **No cumple:** se probó y falló.
- **Sin verificar:** nadie lo ha comprobado todavía. Casi siempre falta el navegador o Supabase real; ahí se completa con [`VERIFICACION.md`](VERIFICACION.md).

**Cómo se hizo esta pasada.** Se corrieron `npm test` (103 tests), `npm run build` y `npm run lint`, y se inspeccionó el código con búsquedas concretas (los comandos están en la columna «Evidencia»). **Nadie ha abierto todavía la pantalla en el navegador ni ha corrido el script contra Supabase real**: por eso la mayoría de los criterios de interfaz y de seguridad figuran como «sin verificar» y no como «cumple». Donde la regla de dominio sí está probada pero falta ver la pantalla, se dice: «regla ✅, falta navegador».

## Resumen

| Grupo | Total | Cumple | No cumple | Sin verificar |
| --- | --- | --- | --- | --- |
| Historias (HU) | 46 | 8 | 0 | 38 |
| Spec (ES) | 24 | 16 | 0 | 8 |
| Diseño (DS) | 12 | 8 | 0 | 4 |
| **Total** | **82** | **32** | **0** | **50** |

## 1. Historias

### HU-01 — Ver qué películas caben en mi tiempo

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-01-C1 | Sin verificar | Regla ✅ (`nochePelicula.test.ts`: 30, 600 y « 120 » válidos). Falta el navegador. |
| HU-01-C2 | Sin verificar | Regla ✅ (29 y 601 → `fuera_de_rango`). Falta ver el mensaje. |
| HU-01-C3 | Sin verificar | Regla ✅ (vacío, `90,5`, `una hora`). Falta ver los mensajes. |
| HU-01-C4 | **Cumple** | `candidatas.test.ts`: «descarta las series y los estados distintos de por ver». |
| HU-01-C5 | **Cumple** | `candidatas.test.ts`: «una película cuya duración es exactamente el tiempo sí entra» y «más larga que el tiempo no se ofrece». |
| HU-01-C6 | Sin verificar | Regla ✅ (`normalizarRuntime(0)`, `clasificarCandidatas` con `sin_duracion`). Falta verlo con una película real sin duración. |
| HU-01-C7 | **Cumple** | `candidatas.test.ts`: orden por fecha y desempate por título. |
| HU-01-C8 | Sin verificar | Falta el navegador. |
| HU-01-C9 | Sin verificar | Falta el navegador (bloquear la petición y reintentar). |
| HU-01-C10 | Sin verificar | Regla ✅ (`vacio: 'sin_por_ver'`). Falta ver el mensaje. |
| HU-01-C11 | Sin verificar | Regla ✅ (`vacio: 'ninguna_cabe'`). Falta ver el mensaje. |
| HU-01-C12 | Sin verificar | Falta el navegador. |

### HU-02 — Armar una sesión

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-02-C1 | Sin verificar | Regla ✅ (`agregarPelicula`). Falta el navegador. |
| HU-02-C2 | **Cumple** | `nochePelicula.test.ts`: `duracionTotal([100]) = 100`. |
| HU-02-C3 | Sin verificar | Regla ✅ (`duracionTotal([90, 100, 120]) = 330`). Falta el navegador. |
| HU-02-C4 | Sin verificar | Regla ✅ (`evaluarAgregar(200, [100], 95)` → faltan 5). Falta ver el mensaje. |
| HU-02-C5 | **Cumple** | `nochePelicula.test.ts`: `cabe(330, [90, 100, 120])` y restante 0. |
| HU-02-C6 | Sin verificar | Regla ✅ (`quitarPelicula` y recálculo de pausas). Falta el navegador. |
| HU-02-C7 | **Cumple** | `sesion.test.ts`: «una película repetida se rechaza como duplicada, aunque quepa». |
| HU-02-C8 | Sin verificar | Regla ✅ (`puedeGuardar` → `excede`). Falta ver el aviso y el botón. |
| HU-02-C9 | **Cumple** | `sesion.test.ts`: duración `null`, 0 o `NaN` se rechaza como sin duración. |
| HU-02-C10 | **Cumple** | `nochePelicula.test.ts`: sesión vacía dura 0 y deja todo el tiempo. |

### HU-03 — Guardar mi sesión

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-03-C1 | Sin verificar | Falta el navegador con Supabase real. |
| HU-03-C2 | Sin verificar | Regla ✅ (`puedeGuardar([], 120)` → `vacia`). Falta ver el mensaje. |
| HU-03-C3 | Sin verificar | Regla ✅ (`normalizarNombre`, 60 caracteres). Falta el navegador. |
| HU-03-C4 | Sin verificar | Regla ✅ (61 caracteres → `demasiado_largo`). Falta ver el mensaje. |
| HU-03-C5 | Sin verificar | Regla ✅ (`nombrePorDefecto(new Date(2026, 10, 11))` = «Noche del 11 de nov»). Falta el navegador. |
| HU-03-C6 | Sin verificar | Inspección: el servicio y la función SQL no escriben en `mi_lista` (ver ES-10). Falta el navegador. |
| HU-03-C7 | Sin verificar | Falta el navegador. |
| HU-03-C8 | Sin verificar | Falta el navegador. |
| HU-03-C9 | Sin verificar | Falta el navegador (modo sin conexión). |
| HU-03-C10 | Sin verificar | Inspección: `useGuardarSesion` bloquea con un `ref` y el botón se deshabilita. Falta el navegador. |
| HU-03-C11 | Sin verificar | Regla ✅ (`normalizarNombre` conserva `<b>hola</b> 🎬`). Falta ver el texto en pantalla. |

### HU-04 — Consultar mis sesiones guardadas

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-04-C1 | Sin verificar | Falta el navegador con Supabase real. |
| HU-04-C2 | Sin verificar | Falta el navegador con Supabase real. |
| HU-04-C3 | Sin verificar | Falta el navegador con Supabase real. |
| HU-04-C4 | Sin verificar | Inspección: la sesión lee sus propias filas copiadas, no `mi_lista`. Falta el navegador. |
| HU-04-C5 | Sin verificar | Igual que HU-04-C4. |
| HU-04-C6 | Sin verificar | Inspección: no hay acciones de editar ni de eliminar (ver ES-22). Falta el script que confirma que la base lo rechaza. |
| HU-04-C7 | Sin verificar | Falta el navegador. |

### HU-05 — Mantener mis sesiones privadas

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-05-C1 | Sin verificar | Inspección: las tres rutas están dentro del layout protegido de `App.tsx`. Falta el navegador. |
| HU-05-C2 | Sin verificar | Falta correr `scripts/test-rls-sesiones.ts` contra Supabase real. Simulado: en un Postgres local cada persona ve solo lo suyo (33 comprobaciones); no sustituye al script. |
| HU-05-C3 | Sin verificar | Igual que HU-05-C2: falta el script y abrir la dirección en el navegador. |
| HU-05-C4 | Sin verificar | Igual que HU-05-C2: falta el script. |
| HU-05-C5 | Sin verificar | Igual que HU-05-C2: falta el script. |
| HU-05-C6 | Sin verificar | Igual que HU-05-C2: falta el script. |

## 2. Spec

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| ES-01 | **Cumple** | Las reglas están en `src/domain/nochePelicula.ts`, `candidatas.ts` y `sesion.ts`; la interfaz las llama. |
| ES-02 | **Cumple** | Búsqueda de `react`, `supabase`, `infrastructure`, `fetch(`, `Date.now`, `Math.random` y `new Date` en los cuatro archivos de dominio nuevos: solo aparece la palabra `infrastructure` dentro de un comentario. |
| ES-03 | **Cumple** | Tests «no muta…» en `nochePelicula`, `candidatas` y `sesion`. |
| ES-04 | **Cumple** | Búsqueda de `10`, `30` y `600` en `nochePelicula.ts`: solo en las constantes `PAUSA_MINUTOS`, `TIEMPO_MINIMO` y `TIEMPO_MAXIMO`. |
| ES-05 | **Cumple** | `nochePelicula.test.ts`: sesión que ocupa exactamente el tiempo, una sola película, película sin duración (`evaluarAgregar`) y tiempo fuera de rango (29, 30, 600, 601, no entero, vacío). |
| ES-06 | **Cumple** | `docs/migrations/001_sesiones.sql`: `enable row level security` en las dos tablas. |
| ES-07 | **Cumple** | La migración no contiene `for update` ni `for delete`. |
| ES-08 | **Cumple** | Las únicas claves foráneas de la migración apuntan a `auth.users` y a `sesiones`. |
| ES-09 | Sin verificar | Simulado: en el Postgres local, una película repetida falla y no deja una sesión a medias. Falta el script real. |
| ES-10 | **Cumple** | Búsqueda de `mi_lista` en el servicio, los hooks y las páginas de E2: ninguna. El SQL solo la nombra en comentarios. |
| ES-11 | Sin verificar | Simulado: `guardar_sesion` sin sesión es rechazada. Falta el script real. |
| ES-12 | **Cumple** | Ningún componente ni página de E2 importa Supabase ni TMDB. Salvedad en H-02. |
| ES-13 | Sin verificar | Inspección: `fetchDuraciones` devuelve `{ estado: 'error' }` por película. Falta el navegador. |
| ES-14 | Sin verificar | Igual que ES-13. |
| ES-15 | **Cumple** | `mapConLimite.test.ts`: con 12 tareas y límite 5 nunca hay más de 5 en curso. |
| ES-16 | **Cumple** | Búsqueda de patrones de claves (`sb_publishable_`, `sb_secret_`, JWT `eyJ…`, `api_key=…`) en `src`, `scripts` y `docs`: solo el texto de ejemplo del README. `.env` está ignorado por git. |
| ES-17 | **Cumple** | Búsqueda de `: any`, `as any` y `<any>` en `src` y `scripts`: ninguno. `npm run lint` sin errores. |
| ES-18 | Sin verificar | Inspección: las tres rutas están dentro de `ProtectedRoute`. Falta el navegador. |
| ES-19 | Sin verificar | Inspección: las tres pantallas tienen carga, error y vacío en el código. Falta el navegador. |
| ES-20 | **Cumple** | Búsqueda de aritmética de duraciones y pausas fuera del dominio: solo el texto «incluye la pausa de 10 min» en `mensajes.ts`. Los totales salen de `duracionTotal` y `tiempoRestante`. |
| ES-21 | Sin verificar | Inspección: `deshabilitado={evaluacionGuardar?.ok !== true \|\| errorNombre !== null}`. Falta el navegador. |
| ES-22 | **Cumple** | Búsqueda de `eliminar`, `editar`, `.delete(` y `.update(` en las pantallas de sesiones y su servicio: solo los dos comentarios que declaran la regla. |
| ES-23 | **Cumple** | Líneas quitadas por E2 en `App.tsx`, `AppLayout.tsx`, `rutas.ts` y `tmdb.ts`: 0 en cada uno; solo se agregó. Salvedad en H-07 (E1-D05). |
| ES-24 | Sin verificar | Falta el navegador a 360 px. |

## 3. Diseño

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| DS-01 | **Cumple** | Búsqueda de `#…`, `rgb(` y `rgba(` en la sección nueva de `index.css`: ninguno. |
| DS-02 | **Cumple** | Búsqueda de `font-size` sin `var(--fs-` en todo `index.css`: ninguno. |
| DS-03 | **Cumple** | Los cuatro usos de lucide en E2 (`Clock`, `ArrowLeft`) llevan `{...ICON_PROPS}`. |
| DS-04 | Sin verificar | Falta recorrer con Tab. |
| DS-05 | **Cumple** | Los botones nuevos tienen texto visible («Agregar», «Quitar», «Guardar sesión», «Reintentar»); no hay botones de solo ícono. |
| DS-06 | Sin verificar | Inspección: hay carga, error y vacío. Falta simularlos en el navegador. |
| DS-07 | Sin verificar | Falta el navegador a 360 px. |
| DS-08 | **Cumple** | La sección nueva de CSS no define animaciones ni transiciones; el shimmer reutilizado ya respeta `prefers-reduced-motion`. |
| DS-09 | Sin verificar | Falta mirar en escala de grises. |
| DS-10 | **Cumple** | Búsqueda de `style=` y `!important` en los archivos nuevos: ninguno. |
| DS-11 | **Cumple** | Clases BEM (`noche__*`, `fila__*`, `resumen__*`, `guardar`, `sesion-card__*`) en una sección propia al final de `index.css`. |
| DS-12 | **Cumple** | Solo `.btn` (`--primary`, `--ghost`); el enlace con forma de botón es `.btn` sobre un `<a>`. |

## 4. Hallazgos

Lo que esta auditoría encontró y qué se hizo. Lo corregido se corrigió de arriba hacia abajo: primero el documento y después el código.

| Id | Hallazgo | Qué se hizo |
| --- | --- | --- |
| H-01 | La tabla ticket → archivos de la spec no incluía `mensajes.ts`, `formato.ts` ni el cambio de `NochePage.tsx` en E2-T09. | **Corregido** en la spec (commit `docs: la spec y el PRD reflejan lo construido`). |
| H-02 | ES-12 decía «ningún componente importa `tmdb.ts`», pero `tarjetas.ts` (de E1) importa un tipo con `import type`. No es una llamada y existe desde el Proyecto 3. El defecto era de la redacción. | **Corregido**: el criterio ahora permite los imports de solo tipos. |
| H-03 | El PRD no decía con qué tiempo arranca el campo, y el código usa 120 minutos. | **Corregido**: SUP-10 en el PRD. |
| H-04 | La spec no tenía `nombreDemasiadoLargo`, `ResultadoAgregar` ni algunos textos de interfaz. | **Corregido** en la spec. |
| H-05 | El lint (compilador de React) rechazó el `useMemo` de la clasificación de candidatas. | **Corregido** en el código: se calcula directo, sin cambiar el comportamiento. |
| H-06 | Un test de `candidatas` estaba mal planteado: dos ítems con la misma fecha se ordenan por título, y el test esperaba otro orden. | **Corregido el test**, no el código; el orden ya cumplía DEC-02. |
| H-07 | Los tickets E1-D05 y el ajuste posterior de `--font-base` y `--font-ratio` cambiaron los tamaños de texto de las pantallas de E1. Esas pantallas no se han revisado en el navegador después del cambio. | **Pendiente**: lo cubre la regresión de E1 en `VERIFICACION.md` §8. |
| H-08 | La migración se validó solo en un Postgres local que simula Supabase. | **Pendiente**: correr el script real (`HU-05`). |
| H-09 | La interfaz de E2 no se ha visto en un navegador: quien la escribió no tiene credenciales de la app. | **Pendiente**: `VERIFICACION.md` §2 a §7. |
| H-10 | `npm audit` reporta 10 vulnerabilidades moderadas, todas en la cadena de ESLint (herramientas de desarrollo). Ninguna en dependencias de producción, y ninguna de Vitest ni de Prettier. | **Registrado, sin corregir**: `npm audit fix --force` actualiza ESLint con cambios que rompen compatibilidad y no es parte de E2. |

## 5. Pendientes y su razón

- **Verificación en el navegador y con Supabase real** (los 50 criterios «sin verificar»): requiere la cuenta de la persona que verifica. Es el siguiente paso.
- **Deuda de E1**: D-05, D-06, D-10 y D-11 de [`ESTADO-INICIAL.md`](ESTADO-INICIAL.md), y los tickets E1-D01 a E1-D04 (información bajo la tarjeta, selector de estado, snackbar, flechas en las filas) siguen sin hacerse. El brief pide registrarlos, no corregirlos en este entregable, y E2 era la prioridad con el plazo disponible.
- **Puntos extra del brief**: «Llenar mi noche», filtro por género, marcar una sesión como realizada, validación adicional en la base de datos, revisión adversarial y publicación. No entraron por el plazo; cada uno requeriría su historia, sus criterios y su lugar en la spec **antes** del código. La versión desplegada en Vercel corresponde a E1, no incluye E2.

## 6. Cómo completar esta auditoría

1. Llena la columna «Resultado obtenido» de [`VERIFICACION.md`](VERIFICACION.md) y pega la salida del script.
2. Por cada criterio verificado, cambia su estado aquí a **Cumple** o **No cumple** y cita en «Evidencia» la fila de `VERIFICACION.md` o la línea del script.
3. Actualiza la tabla del Resumen.
4. Si algo no cumple, regístralo en la sección 4 y corrígelo de arriba hacia abajo: primero el documento, después el código.
