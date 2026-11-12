# Auditoría de E2 — Noche de película

Estado de cada criterio de las [historias](backlog/historias-e2.md), de la [spec](specs/spec-e2-noche-de-pelicula.md) y de [`DESIGN.md`](../DESIGN.md), con su evidencia.

- **Cumple:** hay una prueba o una inspección que lo demuestra, y se cita.
- **No cumple:** se probó y falló.
- **Sin verificar:** nadie lo ha comprobado todavía. Casi siempre falta el navegador o Supabase real; ahí se completa con [`VERIFICACION.md`](VERIFICACION.md).

**Cómo se hizo esta pasada.** Tres veces. La primera (antes de abrir la app), con `npm test`, `npm run build`, `npm run lint` y búsquedas en el código. La segunda, el 2026-11-11, con la app real: un Chrome automatizado (Puppeteer) recorrió cada criterio con Supabase y TMDB de verdad y dos cuentas de prueba, y se corrieron los dos scripts de seguridad (`test-rls.ts` 12/12 y `test-rls-sesiones.ts` 26/26). La tercera repitió el recorrido completo, con cuentas nuevas, después de E1-D04 (3) y E1-D06 (que cambian el orden de las flechas y los errores de conexión) para comprobar que no se rompió nada. Los pasos y lo que se vio están en [`VERIFICACION.md`](VERIFICACION.md). Hoy `npm test` corre 152 tests. Tres matices: DS-09 (escala de grises) y el menú del selector (E1-D02-C7) los confirmó Milo, porque no se pueden observar desde Chrome sin pantalla; HU-01-C10 se probó con una cuenta limpia en lugar de mover todas las «por ver» de la cuenta principal; y HU-01-C6 y HU-02-C9 se probaron con una película real sin duración en TMDB («Las nuevas desventuras de Cliff Booth»).

## Resumen

| Grupo | Total | Cumple | No cumple | Sin verificar |
| --- | --- | --- | --- | --- |
| Historias (HU) | 46 | 46 | 0 | 0 |
| Spec (ES) | 24 | 24 | 0 | 0 |
| Diseño (DS) | 12 | 12 | 0 | 0 |
| Mejoras de interfaz de E1 (E1-D) | 57 | 57 | 0 | 0 |
| **Total** | **139** | **139** | **0** | **0** |

## 1. Historias

### HU-01 — Ver qué películas caben en mi tiempo

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-01-C1 | **Cumple** | Regla ✅ (`nochePelicula.test.ts`: 30, 600 y « 120 » válidos). Verificado en la app real (`VERIFICACION.md`): 120 min: sin mensaje de error, 3 película(s) en «Caben en tu tiempo»; 30 min: sin mensaje de error, 0 película(s) en «Caben en tu tiempo»; 600 min: sin mensaje de error, 11 película(s) en «Caben en tu tiempo» |
| HU-01-C2 | **Cumple** | Regla ✅ (29 y 601 → `fuera_de_rango`). Verificado en la app real (`VERIFICACION.md`): 29: «El tiempo debe estar entre 30 y 600 minutos.», 0 películas; 601: «El tiempo debe estar entre 30 y 600 minutos.», 0 películas |
| HU-01-C3 | **Cumple** | Regla ✅ (vacío, `90,5`, `una hora`). Verificado en la app real (`VERIFICACION.md`): «» → «Escribe cuántos minutos tienes.»; «90,5» → «Usa un número entero de minutos, sin decimales ni texto.»; «una hora» → «Usa un número entero de minutos, sin decimales ni texto.» |
| HU-01-C4 | **Cumple** | `candidatas.test.ts`: «descarta las series y los estados distintos de por ver». |
| HU-01-C5 | **Cumple** | `candidatas.test.ts`: «una película cuya duración es exactamente el tiempo sí entra» y «más larga que el tiempo no se ofrece». |
| HU-01-C6 | **Cumple** | Regla ✅ (`normalizarRuntime(0)`, `clasificarCandidatas` con `sin_duracion`). Verificado en la app real (`VERIFICACION.md`): «Las nuevas desventuras de Cliff Booth» (runtime 0 en TMDB): en «No disponibles» con «Sin duración conocida: no se puede agregar.»; no está en «Caben» y no tiene botón «Agregar» (false) |
| HU-01-C7 | **Cumple** | `candidatas.test.ts`: orden por fecha y desempate por título. |
| HU-01-C8 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): con Slow 3G se vieron rectángulos de carga (true) y después la lista (true) |
| HU-01-C9 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): con la API de películas bloqueada: 11 en «No disponibles» con «No se pudo consultar la duración.» y botón «Reintentar» (0 en Caben); tras quitar el bloqueo y reintentar: 3 en «Caben en tu tiempo» |
| HU-01-C10 | **Cumple** | Regla ✅ (`vacio: 'sin_por_ver'`). Verificado en la app real (`VERIFICACION.md`): cuenta B (lista vacía, sin «por ver»): «No tienes películas por ver. Agrégalas desde el inicio.». Equivale al paso del documento (pasar todas las «por ver» a otro estado) con una cuenta limpia. |
| HU-01-C11 | **Cumple** | Regla ✅ (`vacio: 'ninguna_cabe'`). Verificado en la app real (`VERIFICACION.md`): con 30 min: «Ninguna de tus películas por ver cabe en 30 min.» |
| HU-01-C12 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): 120 min → 3 (esperadas 3); 200 min → 11 (esperadas 11); 90 min → 1 (esperadas 1); la página no se recargó (sin-recarga) |

### HU-02 — Armar una sesión

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-02-C1 | **Cumple** | Regla ✅ (`agregarPelicula`). Verificado en la app real (`VERIFICACION.md`): «1. Vengadores: Infinity War» (2 h 29 min); Duración total: 2 h 29 min / Te quedan 7 h 31 min |
| HU-02-C2 | **Cumple** | `nochePelicula.test.ts`: `duracionTotal([100]) = 100`. |
| HU-02-C3 | **Cumple** | Regla ✅ (`duracionTotal([90, 100, 120]) = 330`). Verificado en la app real (`VERIFICACION.md`): 1. Vengadores: Infinity War → 2. Toy Story → 3. Vengadores: Endgame; 149+77+181+20 = 427 min → «Duración total: 7 h 7 min», «Te quedan 2 h 53 min» |
| HU-02-C4 | **Cumple** | Regla ✅ (`evaluarAgregar(200, [100], 95)` → faltan 5). Verificado en la app real (`VERIFICACION.md`): tiempo 186 min, sesión con «Vengadores: Endgame» (181); al agregar «Toy Story» (77): «“Toy Story” no cabe: faltan 82 min (incluye la pausa de 10 min).» (esperado N = 181+10+77−186 = 82); no se agregó (1 película) |
| HU-02-C5 | **Cumple** | `nochePelicula.test.ts`: `cabe(330, [90, 100, 120])` y restante 0. |
| HU-02-C6 | **Cumple** | Regla ✅ (`quitarPelicula` y recálculo de pausas). Verificado en la app real (`VERIFICACION.md`): se quitó «Toy Story»; quedan Vengadores: Infinity War y Vengadores: Endgame; total = 149+181+10 = 340 min → «Duración total: 5 h 40 min» (una sola pausa) |
| HU-02-C7 | **Cumple** | `sesion.test.ts`: «una película repetida se rechaza como duplicada, aunque quepa». |
| HU-02-C8 | **Cumple** | Regla ✅ (`puedeGuardar` → `excede`). Verificado en la app real (`VERIFICACION.md`): sesión de 340 min con tiempo 335: «Tu sesión se pasa por 5 min. Quita películas para poder guardarla.»; «Guardar sesión» deshabilitado (true); la sesión sigue con 2 películas |
| HU-02-C9 | **Cumple** | `sesion.test.ts`: duración `null`, 0 o `NaN` se rechaza como sin duración. |
| HU-02-C10 | **Cumple** | `nochePelicula.test.ts`: sesión vacía dura 0 y deja todo el tiempo. |

### HU-03 — Guardar mi sesión

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-03-C1 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): aviso «Sesión guardada. Ver mis sesiones», enlace «Ver mis sesiones», la sesión armada quedó vacía («Aún no agregaste películas.») y el campo de nombre se limpió |
| HU-03-C2 | **Cumple** | Regla ✅ (`puedeGuardar([], 120)` → `vacia`). Verificado en la app real (`VERIFICACION.md`): sesión vacía: «Agrega al menos una película para guardar.», botón deshabilitado (true) |
| HU-03-C3 | **Cumple** | Regla ✅ (`normalizarNombre`, 60 caracteres). Verificado en la app real (`VERIFICACION.md`): «Mis sesiones» muestra el nombre de 60 caracteres idéntico al escrito |
| HU-03-C4 | **Cumple** | Regla ✅ (61 caracteres → `demasiado_largo`). Verificado en la app real (`VERIFICACION.md`): 61 caracteres: «El nombre admite hasta 60 caracteres.» y botón deshabilitado (true); recortado a 60: sin mensaje y botón habilitado (true) |
| HU-03-C5 | **Cumple** | Regla ✅ (`nombrePorDefecto(new Date(2026, 10, 11))` = «Noche del 11 de nov»). Verificado en la app real (`VERIFICACION.md`): vacío y solo espacios → «Noche del 11 de nov» y «Noche del 11 de nov» (esperado «Noche del 11 de nov») |
| HU-03-C6 | **Cumple** | Inspección: el servicio y la función SQL no escriben en `mi_lista` (ver ES-10). Verificado en la app real (`VERIFICACION.md`): tras guardar 4 sesiones, «Pendientes» sigue con los mismos 12 títulos |
| HU-03-C7 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): «Toy Story» estaba en la primera sesión; se guardó en otra sin advertencias (0 errores) y ambas aparecen en «Mis sesiones» |
| HU-03-C8 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): Ver HU-04-C3: el detalle de la sesión «Orden de agregado» muestra «Tiempo disponible: 10 h» con el que se armó y «Sobraban …» calculado. |
| HU-03-C9 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): sin red: «No se pudo guardar la sesión: No se pudo conectar con el servidor.»; la sesión seguía armada (1 película); al volver la red se guardó |
| HU-03-C10 | **Cumple** | Inspección: `useGuardarSesion` bloquea con un `ref` y el botón se deshabilita. Verificado en la app real (`VERIFICACION.md`): dos clics en el mismo instante: «Mis sesiones» pasó de 5 a 6 sesiones |
| HU-03-C11 | **Cumple** | Regla ✅ (`normalizarNombre` conserva `<b>hola</b> 🎬`). Verificado en la app real (`VERIFICACION.md`): en la lista se lee «<b>hola</b> 🎬» (sin elemento <b>: true); en el detalle «<b>hola</b> 🎬» (sin <b>: true) |

### HU-04 — Consultar mis sesiones guardadas

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-04-C1 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): 8 sesiones, de la más reciente a la más antigua: Orden de agregado › <b>hola</b> 🎬 › Doble clic › Con corte de red…; la más nueva dice «11 nov 2026 · 3 películas · 7 h 7 min» (esperado total 7 h 7 min) |
| HU-04-C2 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): cuenta B: «Aún no tienes sesiones guardadas.» |
| HU-04-C3 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): 1. Vengadores: Endgame / 2. Toy Story / 3. Vengadores: Infinity War; Duración total: 7 h 7 min / Tiempo disponible: 10 h / Sobraban 2 h 53 min (esperado: total 7 h 7 min, disponible 10 h, sobraban 2 h 53 min) |
| HU-04-C4 | **Cumple** | Inspección: la sesión lee sus propias filas copiadas, no `mi_lista`. Verificado en la app real (`VERIFICACION.md`): se quitó «Vengadores: Endgame» de mi lista; la sesión se ve igual (mismas 3 películas, duraciones, pósters y totales) |
| HU-04-C5 | **Cumple** | Igual que HU-04-C4. Verificado en la app real (`VERIFICACION.md`): «Toy Story» pasó a «Vista» en mi lista; la sesión no cambió |
| HU-04-C6 | **Cumple** | Inspección: no hay acciones de editar ni de eliminar (ver ES-22). Verificado en la app real (`VERIFICACION.md`): «Mis sesiones»: 0 botones; detalle: 0 botones; sin textos de editar/eliminar/borrar/quitar |
| HU-04-C7 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): Slow 3G: rectángulos de carga (true) y luego la lista (true); con la API bloqueada: pantalla de error con «No se pudo conectar con el servidor.» y botón «Reintentar»; al reintentar sin bloqueo se cargó la lista |

### HU-05 — Mantener mis sesiones privadas

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| HU-05-C1 | **Cumple** | Inspección: las tres rutas están dentro del layout protegido de `App.tsx`. Verificado en la app real (`VERIFICACION.md`): Sin sesión, «/noche», «/noche/sesiones» y «/noche/sesiones/1» terminan en «/login» (también «/»). |
| HU-05-C2 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «A solo ve su sesión, con sus películas» y «B también ve únicamente la suya»: PASS. |
| HU-05-C3 | **Cumple** | Igual que HU-05-C2: falta el script y abrir la dirección en el navegador. Verificado en la app real (`VERIFICACION.md`): la cuenta B abre la sesión 40 de A: «No encontramos esa sesión.»; una inexistente: «No encontramos esa sesión.»; «/abc»: «No encontramos esa sesión.» (se ven igual). El script de seguridad también pasó (26/26). |
| HU-05-C4 | **Cumple** | Igual que HU-05-C2: falta el script. Verificado en la app real (`VERIFICACION.md`): Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «B no puede modificar ni eliminar la sesión de A» y «La sesión de A sigue intacta»: PASS. |
| HU-05-C5 | **Cumple** | Igual que HU-05-C2: falta el script. Verificado en la app real (`VERIFICACION.md`): Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «B no puede insertar una sesión a nombre de A» y «B no puede insertar películas en la sesión de A»: PASS. |
| HU-05-C6 | **Cumple** | Igual que HU-05-C2: falta el script. Verificado en la app real (`VERIFICACION.md`): Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «Sin sesión, guardar_sesion es rechazada» y «Sin sesión no se ve ninguna sesión»: PASS. |

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
| ES-09 | **Cumple** | Script `test-rls-sesiones.ts` contra Supabase real: «Una película repetida falla y no deja una sesión a medias» (HTTP 409; las sesiones de A siguen en 1 antes y después). |
| ES-10 | **Cumple** | Búsqueda de `mi_lista` en el servicio, los hooks y las páginas de E2: ninguna. El SQL solo la nombra en comentarios. |
| ES-11 | **Cumple** | Script `test-rls-sesiones.ts` contra Supabase real: «Sin sesión, guardar_sesion es rechazada» (HTTP 401, permission denied for function guardar_sesion). |
| ES-12 | **Cumple** | Ningún componente ni página de E2 importa Supabase ni TMDB. Salvedad en H-02. |
| ES-13 | **Cumple** | Inspección: `fetchDuraciones` devuelve `{ estado: 'error' }` por película. Verificado en la app real (`VERIFICACION.md`): se bloqueó solo «Dune» (id 438631): está en «No disponibles» con «No se pudo consultar la duración.»; las otras 3 que caben en 120 min (las esperadas) aparecen en «Caben» |
| ES-14 | **Cumple** | Igual que ES-13. Verificado en la app real (`VERIFICACION.md`): se bloqueó solo «Dune» (id 438631): está en «No disponibles» con «No se pudo consultar la duración.»; las otras 3 que caben en 120 min (las esperadas) aparecen en «Caben» |
| ES-15 | **Cumple** | `mapConLimite.test.ts`: con 12 tareas y límite 5 nunca hay más de 5 en curso. |
| ES-16 | **Cumple** | Búsqueda de patrones de claves (`sb_publishable_`, `sb_secret_`, JWT `eyJ…`, `api_key=…`) en `src`, `scripts` y `docs`: solo el texto de ejemplo del README. `.env` está ignorado por git. |
| ES-17 | **Cumple** | Búsqueda de `: any`, `as any` y `<any>` en `src` y `scripts`: ninguno. `npm run lint` sin errores. |
| ES-18 | **Cumple** | Inspección: las tres rutas están dentro de `ProtectedRoute`. Verificado en la app real (`VERIFICACION.md`): Igual que HU-05-C1: las tres rutas de «Noche de película» piden iniciar sesión. |
| ES-19 | **Cumple** | Inspección: las tres pantallas tienen carga, error y vacío en el código. Verificado en la app real (`VERIFICACION.md`): Carga, error y vacío de cada pantalla simulados: HU-01-C8 (carga), C9 (error y reintento), C10 y C11 (vacíos); HU-04-C7 (carga y error con «Reintentar») y C2 (vacío). |
| ES-20 | **Cumple** | Búsqueda de aritmética de duraciones y pausas fuera del dominio: solo el texto «incluye la pausa de 10 min» en `mensajes.ts`. Los totales salen de `duracionTotal` y `tiempoRestante`. |
| ES-21 | **Cumple** | Inspección: `deshabilitado={evaluacionGuardar?.ok !== true \|\| errorNombre !== null}`. Verificado en la app real (`VERIFICACION.md`): Guardar deshabilitado → vacía: true, se pasa: true; válida: false (deshabilitado=false significa habilitado) |
| ES-22 | **Cumple** | Búsqueda de `eliminar`, `editar`, `.delete(` y `.update(` en las pantallas de sesiones y su servicio: solo los dos comentarios que declaran la regla. |
| ES-23 | **Cumple** | Líneas quitadas por E2 en `App.tsx`, `AppLayout.tsx`, `rutas.ts` y `tmdb.ts`: 0 en cada uno; solo se agregó. Salvedad en H-07 (E1-D05). |
| ES-24 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): /noche: sin scroll horizontal = true; /noche/sesiones: sin scroll horizontal = true; detalle de sesión: sin scroll horizontal = true |

## 3. Diseño

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| DS-01 | **Cumple** | Búsqueda de `#…`, `rgb(` y `rgba(` en la sección nueva de `index.css`: ninguno. |
| DS-02 | **Cumple** | Búsqueda de `font-size` sin `var(--fs-` en todo `index.css`: ninguno. |
| DS-03 | **Cumple** | Los cuatro usos de lucide en E2 (`Clock`, `ArrowLeft`) llevan `{...ICON_PROPS}`. |
| DS-04 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): /noche: 12 paradas con Tab, sin indicador de foco: ninguna / /noche/sesiones: 13 paradas con Tab, sin indicador de foco: ninguna / detalle de sesión: 5 paradas con Tab, sin indicador de foco: ninguna |
| DS-05 | **Cumple** | Los botones nuevos tienen texto visible («Agregar», «Quitar», «Guardar sesión», «Reintentar»); no hay botones de solo ícono. |
| DS-06 | **Cumple** | Inspección: hay carga, error y vacío. Verificado en la app real (`VERIFICACION.md`): Mismas simulaciones que ES-19: las pantallas nuevas muestran carga, error y vacío. |
| DS-07 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): a 360 px sin scroll horizontal en: /noche (true), /noche/sesiones (true), detalle de sesión (true) |
| DS-08 | **Cumple** | La sección nueva de CSS no define animaciones ni transiciones; el shimmer reutilizado ya respeta `prefers-reduced-motion`. |
| DS-09 | **Cumple** | Verificado en la app real (`VERIFICACION.md`): Revisión visual de dos capturas en escala de grises (`/noche` con sesión armada y aviso de «se pasa», y `/noche/sesiones`): todo el texto se lee; el aviso de exceso se entiende por su texto y no solo por el color; el botón deshabilitado se distingue. Milo las revisó y confirmó que se leen bien. |
| DS-10 | **Cumple** | Búsqueda de `style=` y `!important` en los archivos nuevos: ninguno. |
| DS-11 | **Cumple** | Clases BEM (`noche__*`, `fila__*`, `resumen__*`, `guardar`, `sesion-card__*`) en una sección propia al final de `index.css`. |
| DS-12 | **Cumple** | Solo `.btn` (`--primary`, `--ghost`); el enlace con forma de botón es `.btn` sobre un `<a>`. |

## 4. Mejoras de interfaz de E1 (E1-D01 a E1-D06)

Criterios de los [tickets](backlog/tickets-e1-mejoras-ui.md) y la [spec](specs/spec-e1-mejoras-ui.md), con las actualizaciones del 2026-11-11. Se verificaron en la app real (ver [`VERIFICACION.md`](VERIFICACION.md) §9). E1-D02-C3 lo prueban los tests de Vitest y E1-D05-C1 una búsqueda en `index.css`.

### E1-D01 — Información bajo la tarjeta

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D01-C1 | **Cumple** | 48 tarjetas, todas con título visible; overlay oculto sin hover en 48 |
| E1-D01-C2 | **Cumple** | 40 resultados; sin año: ninguno |
| E1-D01-C3 | **Cumple** | «Matrix Resurrections» muestra estrellas chicas: «4.0 de 5 estrellas» |
| E1-D01-C4 | **Cumple** | «Toy Story» (de mi lista, sin nota): 0 estrellas; resultado de búsqueda fuera de mi lista: 0 estrellas |
| E1-D01-C5 | **Cumple** | 20 resultados a 360 px; máximo 2 líneas; 10 títulos recortados (p. ej. «Piratas del Caribe: La maldición de la Perla Negra»); pósters alineados por fila: true |
| E1-D01-C6 | **Cumple** | overlay con mouse: opacidad 1; con Tab (foco en una tarjeta): opacidad 1 |
| E1-D01-C7 | **Cumple** | emulación táctil (hover:none = true); overlay con opacidad 1; botón 36×36 px |
| E1-D01-C8 | **Cumple** | póster → /titulo/pelicula/1383750; título → /titulo/pelicula/62 |
| E1-D01-C9 | **Cumple** | «Django desencadenado»: alto 22.0 px con línea de 22.0 px; min-height auto |
| E1-D01-C10 | **Cumple** | 5 filas: todas con un solo "top" y un solo alto de póster; filas con títulos de 1 y 2 líneas: 4 |

### E1-D02 — «+» y papelera en las tarjetas; selector en el detalle

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D02-C1 | **Cumple** | título «Guardianes de la Galaxia: Volumen 3», opción inicial «Agregar a…», aviso «“Guardianes de la Galaxia: Volumen 3” agregada a En progreso», valor final «viendo» |
| E1-D02-C2 | **Cumple** | avisos: «“Matrix Reloaded” movida a Vistas», «“Matrix Reloaded” movida a En progreso», «“Matrix Reloaded” movida a Pendientes»; queda en «Vistas»: Matrix Reloaded |
| E1-D02-C3 | **Cumple** | `miLista.test.ts`: `decidirCambioEstado` devuelve `ninguno` para el mismo estado, con los tres estados. |
| E1-D02-C4 | **Cumple** | 80 ms después de elegir con Slow 3G: disabled=true, aria-busy=true; luego se habilitó |
| E1-D02-C5 | **Cumple** | En el detalle se pasó de vista → en progreso → pendiente → vista: cualquier estado desde cualquier otro. Ver E1-D02-C2. |
| E1-D02-C6 | **Cumple** | con la petición de la lista retrasada 4 s: al aparecer el selector disabled=true; después se habilitó |
| E1-D02-C7 | **Cumple** | con Tab se enfocó el selector (true); con ↓ pasó de «por_ver» a «viendo». Milo confirmó que el menú desplegable se abre. |
| E1-D02-C8 | **Cumple** | tras cambiar a «viendo» y recargar: estado=viendo, nota=«4 de 5», comentario=«Comentario de verificación» |
| E1-D02-C9 | **Cumple** | Recomendadas: 19/19 con «+», 0 con selector; búsqueda «shrek»: 24 tarjetas fuera de mi lista, 0 con selector |
| E1-D02-C10 | **Cumple** | «The Imitation Game (Descifrando Enigma)»: primera en «Agregadas recientemente» (true), está en «Pendientes» (true), en la búsqueda su botón es «Quitar “The Imitation Game (Descifrando Enigma)” de mi lista» |
| E1-D02-C11 | **Cumple** | 28/28 tarjetas de mi lista tienen solo papelera, sin «+» ni selector |
| E1-D02-C12 | **Cumple** | «Dune: Parte dos» se quitó y su tarjeta volvió a mostrar «+» |
| E1-D02-C13 | **Cumple** | «Shrek», 80 ms después de pulsar con Slow 3G: disabled=true, aria-busy=true |
| E1-D02-C14 | **Cumple** | opciones del selector: Pendiente, En progreso, Vista (actual: por_ver) |

### E1-D03 — Avisos (snackbar)

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D03-C1 | **Cumple** | aviso al pulsar «+»: «“The Imitation Game (Descifrando Enigma)” agregada a Pendientes» |
| E1-D03-C2 | **Cumple** | Al cambiar de estado en el detalle el aviso fue «“Matrix Reloaded” movida a Vistas» (también a En progreso y a Pendientes). Ver E1-D02-C2. |
| E1-D03-C3 | **Cumple** | aviso al pulsar la papelera: «“Dune: Parte dos” quitada de tu lista» |
| E1-D03-C4 | **Cumple** | sin red: aviso de error con role=alert, mensaje «No se pudo conectar con el servidor.» |
| E1-D03-C5 | **Cumple** | dos altas seguidas («La leyenda de Korra», «Avatar: Los Siete Refugios»): 1 aviso visible: «“Avatar: Los Siete Refugios” agregada a Pendientes» |
| E1-D03-C6 | **Cumple** | el aviso de éxito se cerró solo a los ~4.0 s (aparece desde que lo vi); con «Cerrar aviso» se quitó (true) |
| E1-D03-C7 | **Cumple** | 360 px: aviso entre 16 y 344 px de 360, arriba en 639 (encabezado termina en 166), scroll horizontal: false; «“El señor de los anillos: La comunidad del anillo” agregada a Pendientes» |
| E1-D03-C8 | **Cumple** | contenedor del aviso: role=status, aria-live=polite; el aviso de error lleva role=alert (visto en E1-D03-C4) |

### E1-D04 — Flechas para navegar las filas

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D04-C1 | **Cumple** | la fila desborda (true) y no hay barra: offsetHeight − clientHeight = 0, scrollbar-width: none |
| E1-D04-C2 | **Cumple** | opacidad antes del hover 0, con hover 1; centro de la flecha a 727 px y centro del póster a 727 px |
| E1-D04-C3 | **Cumple** | al inicio (scrollLeft 0): flechas «anterior» 0, «siguiente» 1 |
| E1-D04-C4 | **Cumple** | un click: la fila avanzó 972 px de 1068 visibles; aparece «anterior» (1) |
| E1-D04-C5 | **Cumple** | al final: «anterior» 1, «siguiente» 0, fila al final: true |
| E1-D04-C6 | **Cumple** | filas que caben completas: «En progreso» (2 tarjetas, 0 flechas); «Vistas» (1 tarjetas, 0 flechas) |
| E1-D04-C7 | **Cumple** | táctil: flechas con display none; deslizar movió la fila de 0 a 162 px |
| E1-D04-C8 | **Cumple** | Tab llegó a «Ver siguientes» (visible con el foco: opacidad 1); Enter movió la fila de 0 a 972 px; nombres accesibles: Ver anteriores / Ver siguientes |
| E1-D04-C9 | **Cumple** | tras pulsar una flecha (sobre una tarjeta) la URL sigue siendo / |
| E1-D04-C10 | **Cumple** | a 3200 px hay 3 flechas en total; a 700 px hay 4 (cambian al redimensionar sin recargar) |
| E1-D04-C11 | **Cumple** | al llegar al final con Enter, el foco quedó en «icon-btn row__flecha row__flecha--anterior» |
| E1-D04-C12 | **Cumple** | la fila estaba desplazada 972 px; al agregar «Noche fatídica» volvió a 0 px y esa tarjeta está primera y a la vista (true) |
| E1-D04-C13 | **Cumple** | desplazada 972 px; al quitar una tarjeta quedó en 810 px (no volvió al inicio) |
| E1-D04-C14 | **Cumple** | «Recomendadas para ti»: primera parada en la fila = flecha (parada 10); «Agregadas recientemente»: primera parada en la fila = flecha (parada 49); «Pendientes»: primera parada en la fila = flecha (parada 76) |
| E1-D04-C15 | **Cumple** | flecha a 4 px del borde derecho de la fila (el CSS la pone a 4 px), centrada con el póster (709 vs 709 px); la primera tarjeta empieza en el borde izquierdo y todas están a la misma distancia una de otra |

### E1-D05 — Escala tipográfica

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D05-C1 | **Cumple** | Inspección: la búsqueda de `font-size` sin `var(--fs-` en `src/index.css` no devuelve nada (la misma de DS-02). |
| E1-D05-C2 | **Cumple** | --font-base 1.1rem → 1.4rem: título de página 35.4→45.1 px, fila 17.6→22.4, tarjeta 17.6→22.4; al quitarlo vuelven a los valores originales |
| E1-D05-C3 | **Cumple** | inicio: 35.4 ≥ 17.6 ≥ 17.6 ≥ 15.3 px / busqueda: 30.8 ≥ 17.6 ≥ 15.3 px / detalle: 40.7 ≥ 16.0 ≥ 15.3 px / noche: 35.4 ≥ 17.6 ≥ 17.6 ≥ 15.3 px |

### E1-D06 — Pantalla de error de conexión

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| E1-D06-C1 | **Cumple** | 7 casos con la conexión cortada al cargar: Inicio (Supabase caído), Inicio (TMDB caído), Búsqueda, Detalle de un título, Noche de película, Mis sesiones, Detalle de una sesión. En todos: título «Error 404», texto «No se pudo conectar con el servidor.», encabezado visible y sin el contenido de la página. |
| E1-D06-C2 | **Cumple** | TMDB responde 500: la búsqueda muestra «No se pudo completar la búsqueda: TMDB respondió con estado 500» y no la pantalla de error |
| E1-D06-C3 | **Cumple** | «+» sin red: snackbar «No se pudo conectar con el servidor.» y la búsqueda sigue en su lugar (true); guardar sesión sin red: «No se pudo guardar la sesión: No se pudo conectar con el servidor.» y «Noche» sigue en su lugar (true) |
| E1-D06-C4 | **Cumple** | «Mis sesiones» y el detalle de una sesión tienen «Reintentar» y, al quitar el bloqueo y pulsarlo, cargan el contenido; sin botón en: Inicio (Supabase caído), Inicio (TMDB caído), Búsqueda, Detalle de un título, Noche de película |
| E1-D06-C5 | **Cumple** | a 360 px la pantalla ocupa de 16 a 344 px y no hay scroll horizontal (true) |
| E1-D06-C6 | **Cumple** | en los 7 casos el texto lleva role="alert" y hay un solo h1 |
| E1-D06-C7 | **Cumple** | sin archivo de imagen: 0 imágenes rotas en pantalla; con imagen: se muestra (ancho natural 1) con alt vacío Con la imagen definitiva (`public/error-servidor.png`, sin el cuadriculado que traía el archivo original y reducida a 640 px) se ve centrada, a 320 px de ancho, sobre el fondo de la app. |

## 5. Hallazgos

Lo que esta auditoría encontró y qué se hizo. Lo corregido se corrigió de arriba hacia abajo: primero el documento y después el código.

| Id | Hallazgo | Qué se hizo |
| --- | --- | --- |
| H-01 | La tabla ticket → archivos de la spec no incluía `mensajes.ts`, `formato.ts` ni el cambio de `NochePage.tsx` en E2-T09. | **Corregido** en la spec (commit `docs: la spec y el PRD reflejan lo construido`). |
| H-02 | ES-12 decía «ningún componente importa `tmdb.ts`», pero `tarjetas.ts` (de E1) importa un tipo con `import type`. No es una llamada y existe desde el Proyecto 3. El defecto era de la redacción. | **Corregido**: el criterio ahora permite los imports de solo tipos. |
| H-03 | El PRD no decía con qué tiempo arranca el campo, y el código usa 120 minutos. | **Corregido**: SUP-10 en el PRD. |
| H-04 | La spec no tenía `nombreDemasiadoLargo`, `ResultadoAgregar` ni algunos textos de interfaz. | **Corregido** en la spec. |
| H-05 | El lint (compilador de React) rechazó el `useMemo` de la clasificación de candidatas. | **Corregido** en el código: se calcula directo, sin cambiar el comportamiento. |
| H-06 | Un test de `candidatas` estaba mal planteado: dos ítems con la misma fecha se ordenan por título, y el test esperaba otro orden. | **Corregido el test**, no el código; el orden ya cumplía DEC-02. |
| H-07 | Los tickets E1-D05 y el ajuste posterior de `--font-base` y `--font-ratio` cambiaron los tamaños de texto de las pantallas de E1. Esas pantallas no se habían revisado en el navegador después del cambio. | **Resuelto** el 2026-11-11: la regresión de E1 (`VERIFICACION.md` §8) y los criterios de E1-D05 pasaron en la app real; la jerarquía de tamaños se mantiene en inicio, búsqueda, detalle y «Noche de película». |
| H-08 | La migración se validó solo en un Postgres local que simula Supabase. | **Resuelto** el 2026-11-11: `scripts/test-rls-sesiones.ts` contra el Supabase real, 26/26 (y `test-rls.ts`, 12/12). |
| H-09 | La interfaz de E2 no se había visto en un navegador: quien la escribió no tenía credenciales de la app. | **Resuelto** el 2026-11-11: se recorrió en Chrome con la app real y dos cuentas de prueba; ningún criterio falló (`VERIFICACION.md` §2 a §7). |
| H-10 | `npm audit` reporta 10 vulnerabilidades moderadas, todas en la cadena de ESLint (herramientas de desarrollo). Ninguna en dependencias de producción, y ninguna de Vitest ni de Prettier. | **Registrado, sin corregir**: `npm audit fix --force` actualiza ESLint con cambios que rompen compatibilidad y no es parte de E2. |
| H-11 | Con la red cortada o una API bloqueada, los avisos de error mostraban el texto técnico del navegador («TypeError: Failed to fetch», «Failed to fetch»): en el snackbar, al guardar una sesión, al cargar «Mis sesiones» y en la búsqueda. | **Resuelto** el 2026-11-11 con E1-D06 (documento primero, código después): si al cargar una página no hay conexión se muestra `ErrorPage`, y las acciones fallidas avisan «No se pudo conectar con el servidor.». Cubre D-11 solo en lo que toca a la conexión: los demás mensajes crudos siguen pendientes. |
| H-12 | Con teclado, las flechas de una fila venían después de todas sus tarjetas en el orden de Tab (más de 30 paradas antes de la primera flecha), y la fila se desplazaba sola al enfocar cada tarjeta. | **Resuelto** el 2026-11-11 con la actualización (3) de E1-D04: las flechas pasan antes de las tarjetas en el código, sin cambiar cómo se ven (E1-D04-C14 y C15). |

## 6. Pendientes y su razón

- **Deuda de E1 que sigue sin hacerse**: D-05, D-06 y D-10 de [`ESTADO-INICIAL.md`](ESTADO-INICIAL.md), y de D-11 los mensajes crudos que no son de conexión (los de conexión los cubre E1-D06). Se resolvieron D-01 a D-04, D-09 y D-13 con los tickets E1-D01 a E1-D05 (sección 4). El brief pide registrar la deuda, no corregirla toda en este entregable.
- **La imagen de la pantalla de error**: va en `public/error-servidor.png` (la pone Milo). Sin ella la pantalla funciona y se ve igual sin imagen (E1-D06-C7).
- **Datos de prueba**: la verificación creó cuentas `rls-test-*@example.com` (los scripts) y `rls-test-ui-*@example.com` (el navegador) en Supabase, con sus listas y sesiones. Milo borró las de la primera corrida; la tercera pasada creó otras. Las sesiones no se pueden borrar desde la app. Para borrarlas todas (SQL Editor): `delete from auth.users where email like 'rls-test-%@example.com';`.
- **Puntos extra del brief**: «Llenar mi noche», filtro por género, marcar una sesión como realizada, validación adicional en la base de datos y revisión adversarial. No entraron por el plazo; cada uno requeriría su historia, sus criterios y su lugar en la spec **antes** del código.
- **Publicación (punto extra, hecha):** la app está en Vercel con Noche de película: <https://cartelera-personal-brown.vercel.app>. El 2026-11-11 se leyó el código publicado y trae Noche de película y las mejoras E1-D01 a E1-D06; no se recorrió con una sesión iniciada.

## 7. Cómo se completó esta auditoría

1. Se llenó la columna «Resultado obtenido» de [`VERIFICACION.md`](VERIFICACION.md) y se pegó la salida del script.
2. Cada criterio pasó de «sin verificar» a **Cumple** con la evidencia citada en esta tabla; el Resumen se contó de las propias tablas.
3. Lo que la pasada encontró quedó en la sección 5 (H-11 y H-12, ambos resueltos con E1-D06 y E1-D04 (3)). Nada falló.
4. Si algo no cumple más adelante, se registra en la sección 5 y se corrige de arriba hacia abajo: primero el documento, después el código.
