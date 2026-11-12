# Verificación de E2 — Noche de película

Cómo comprobar cada criterio de las [historias](backlog/historias-e2.md) y de la [spec](specs/spec-e2-noche-de-pelicula.md) en el navegador. La columna **Resultado obtenido** la llena quien verifica, con lo que realmente vio.

- **⬜** pendiente de verificar.
- **✅ Automático** ya comprobado por `npm test` (152 tests, todos pasan). No necesita navegador.
- Para marcar un criterio como cumplido, escribe lo que viste (por ejemplo, «Cumple: vi el mensaje …»). Si no cumple, escribe qué pasó. Si no se puede probar, escribe «Sin verificar» y por qué.
- **Verificación del 2026-11-11.** La hizo Claude con un Chrome automatizado (Puppeteer) sobre la app real, con Supabase y TMDB de verdad, cuentas de prueba (`rls-test-ui-*@example.com`) y los dos scripts de seguridad. Se hizo dos veces: la segunda, con cuentas nuevas, después de E1-D04 (3) y E1-D06 para comprobar que no se rompió nada. Cada resultado cita lo que se vio. Milo confirmó que la escala de grises se lee bien (DS-09) y que el menú del selector se abre (E1-D02-C7).

## 1. Preparación

1. `npm install` y `npm run dev`. La app corre en <http://localhost:5173>.
2. Aplica la migración: en Supabase → SQL Editor → pega [`docs/migrations/001_sesiones.sql`](migrations/001_sesiones.sql) y ejecuta.
3. Entra con una cuenta (o créala en `/registro`) y deja en tu lista, al menos:
   - **4 películas en «por ver»** con duraciones distintas (agrégalas desde la búsqueda).
   - **1 serie en «por ver»** y **1 película en «viendo»**.
4. Para los criterios de privacidad crea una **segunda cuenta**.
5. En las herramientas del navegador (F12):
   - **Bloquear una petición:** pestaña Network → clic derecho sobre una petición → *Block request URL*.
   - **Sin red:** Network → lista desplegable «No throttling» → *Offline*. *Slow 3G* para ver las cargas.
   - **Celular:** botón de dispositivos (Ctrl+Shift+M) con ancho de 360 px.

Las duraciones que verás en pantalla sirven de datos de prueba: donde un paso dice «A + B + C», usa las duraciones de las películas que hayas elegido.

## 2. HU-01 — Ver qué películas caben en mi tiempo

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-01-C1 | Abre «Noche de película». Escribe `120`, luego `30` y luego `600`. | Cada valor se acepta sin mensaje y aparece la lista «Caben en tu tiempo». | ✅ Cumple. 120 min: sin mensaje de error, 3 película(s) en «Caben en tu tiempo»; 30 min: sin mensaje de error, 0 película(s) en «Caben en tu tiempo»; 600 min: sin mensaje de error, 11 película(s) en «Caben en tu tiempo» |
| HU-01-C2 | Escribe `29` y luego `601`. | Mensaje «El tiempo debe estar entre 30 y 600 minutos.» y no hay lista de películas. | ✅ Cumple. 29: «El tiempo debe estar entre 30 y 600 minutos.», 0 películas; 601: «El tiempo debe estar entre 30 y 600 minutos.», 0 películas |
| HU-01-C3 | Borra el campo. Luego escribe `90,5` y luego `una hora`. | Vacío: «Escribe cuántos minutos tienes.» Los otros dos: «Usa un número entero de minutos, sin decimales ni texto.» | ✅ Cumple. «» → «Escribe cuántos minutos tienes.»; «90,5» → «Usa un número entero de minutos, sin decimales ni texto.»; «una hora» → «Usa un número entero de minutos, sin decimales ni texto.» |
| HU-01-C4 | Revisa que tu serie «por ver» y tu película «viendo» no estén. | No aparecen en «Caben en tu tiempo» ni en «No disponibles». | ✅ Automático: `candidatas.test.ts`, «descarta las series y los estados distintos de por ver». |
| HU-01-C5 | Anota la duración de una película de la lista. Pon exactamente ese tiempo (mínimo 30) y luego un minuto menos. | Con el tiempo exacto la película aparece; con un minuto menos desaparece. | ✅ Automático: `candidatas.test.ts`, límite exacto y «más larga que el tiempo». |
| HU-01-C6 | Si tienes una película «por ver» sin duración en TMDB (por ejemplo, un estreno lejano), mírala. | Aparece en «No disponibles» con «Sin duración conocida: no se puede agregar.» y sin botón «Agregar». | ✅ Cumple. «Las nuevas desventuras de Cliff Booth» (runtime 0 en TMDB): en «No disponibles» con «Sin duración conocida: no se puede agregar.»; no está en «Caben» y no tiene botón «Agregar» (false) |
| HU-01-C7 | Compara el orden de la lista con el de «Agregadas recientemente» del inicio. | La que lleva más tiempo en tu lista va primero; el orden es el inverso al de «Agregadas recientemente». | ✅ Automático: `candidatas.test.ts`, orden por fecha y desempate por título. |
| HU-01-C8 | Con *Slow 3G*, recarga la pantalla. | Se ven rectángulos de carga antes de la lista. | ✅ Cumple. con Slow 3G se vieron rectángulos de carga (true) y después la lista (true) |
| HU-01-C9 | Bloquea las peticiones a `api.themoviedb.org/3/movie/` y recarga. Quita el bloqueo y pulsa «Reintentar». | Las películas aparecen en «No disponibles» con «No se pudo consultar la duración.» y un botón «Reintentar». Tras reintentar pasan a «Caben en tu tiempo». | ✅ Cumple. con la API de películas bloqueada: 11 en «No disponibles» con «No se pudo consultar la duración.» y botón «Reintentar» (0 en Caben); tras quitar el bloqueo y reintentar: 3 en «Caben en tu tiempo» |
| HU-01-C10 | Pasa temporalmente todas tus «por ver» a otro estado y abre la pantalla. | «No tienes películas por ver. Agrégalas desde el inicio.» | ✅ Cumple. cuenta B (lista vacía, sin «por ver»): «No tienes películas por ver. Agrégalas desde el inicio.». Equivale al paso del documento (pasar todas las «por ver» a otro estado) con una cuenta limpia. |
| HU-01-C11 | Escribe `30` con películas más largas. | «Ninguna de tus películas por ver cabe en 30 min.» | ✅ Cumple. con 30 min: «Ninguna de tus películas por ver cabe en 30 min.» |
| HU-01-C12 | Cambia el tiempo varias veces (`120`, `200`, `90`). | La lista se actualiza cada vez, sin recargar. | ✅ Cumple. 120 min → 3 (esperadas 3); 200 min → 11 (esperadas 11); 90 min → 1 (esperadas 1); la página no se recargó (sin-recarga) |

## 3. HU-02 — Armar una sesión

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-02-C1 | Pulsa «Agregar» en una película que cabe. | Aparece en «Tu sesión» y cambian «Duración total» y «Te quedan». | ✅ Cumple. «1. Vengadores: Infinity War» (2 h 29 min); Duración total: 2 h 29 min / Te quedan 7 h 31 min |
| HU-02-C2 | Con una sola película en la sesión, mira «Duración total». | Es igual a la duración de esa película, sin pausa. | ✅ Automático: `nochePelicula.test.ts`, `duracionTotal([100]) = 100`. |
| HU-02-C3 | Agrega tres películas A, B y C. | «Duración total» = A + B + C + 20 min. Con 90, 100 y 120 son 5 h 30 min. | ✅ Cumple. 1. Vengadores: Infinity War → 2. Toy Story → 3. Vengadores: Endgame; 149+77+181+20 = 427 min → «Duración total: 7 h 7 min», «Te quedan 2 h 53 min» |
| HU-02-C4 | Agrega películas hasta que una no quepa en lo que queda y pulsa «Agregar» en ella. | No se agrega y aparece «“título” no cabe: faltan N min (incluye la pausa de 10 min).», donde N = total actual + 10 + duración − tiempo disponible. | ✅ Cumple. tiempo 186 min, sesión con «Vengadores: Endgame» (181); al agregar «Toy Story» (77): «“Toy Story” no cabe: faltan 82 min (incluye la pausa de 10 min).» (esperado N = 181+10+77−186 = 82); no se agregó (1 película) |
| HU-02-C5 | Pon el tiempo igual a la «Duración total» de tu sesión. | «Te quedan 0 min», sin errores, y «Guardar sesión» habilitado. | ✅ Automático: `nochePelicula.test.ts`, `cabe(330, [90, 100, 120])` y restante 0. |
| HU-02-C6 | Con tres películas en la sesión, quita la del medio. | Desaparece y el total se recalcula con una sola pausa. | ✅ Cumple. se quitó «Toy Story»; quedan Vengadores: Infinity War y Vengadores: Endgame; total = 149+181+10 = 340 min → «Duración total: 5 h 40 min» (una sola pausa) |
| HU-02-C7 | Pulsa «Agregar» dos veces en la misma película. | La segunda vez: «“título” ya está en tu sesión.» y no se duplica. | ✅ Automático: `sesion.test.ts`, «una película repetida se rechaza como duplicada». |
| HU-02-C8 | Con una sesión armada, baja el tiempo por debajo de su «Duración total». | «Tu sesión se pasa por N min. Quita películas para poder guardarla.», «Guardar sesión» deshabilitado y la sesión no se pierde. | ✅ Cumple. sesión de 340 min con tiempo 335: «Tu sesión se pasa por 5 min. Quita películas para poder guardarla.»; «Guardar sesión» deshabilitado (true); la sesión sigue con 2 películas |
| HU-02-C9 | Revisa una película sin duración (ver HU-01-C6). | No tiene botón «Agregar». | ✅ Automático: `sesion.test.ts`, duración nula, 0 o NaN se rechaza como sin duración. |
| HU-02-C10 | Con la sesión vacía, mira el resumen. | «Duración total: 0 min» y «Te quedan» igual a tu tiempo disponible. | ✅ Automático: `nochePelicula.test.ts`, sesión vacía dura 0 y deja todo el tiempo. |

## 4. HU-03 — Guardar mi sesión

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-03-C1 | Arma una sesión que quepa y pulsa «Guardar sesión». | «Sesión guardada.» con el enlace «Ver mis sesiones», y la sesión armada se vacía. | ✅ Cumple. aviso «Sesión guardada. Ver mis sesiones», enlace «Ver mis sesiones», la sesión armada quedó vacía («Aún no agregaste películas.») y el campo de nombre se limpió |
| HU-03-C2 | Con la sesión vacía, mira el formulario. | «Agrega al menos una película para guardar.» y el botón deshabilitado. | ✅ Cumple. sesión vacía: «Agrega al menos una película para guardar.», botón deshabilitado (true) |
| HU-03-C3 | Escribe un nombre de 60 caracteres y guarda. Ábrelo en «Mis sesiones». | El nombre se ve idéntico al escrito. | ✅ Cumple. «Mis sesiones» muestra el nombre de 60 caracteres idéntico al escrito |
| HU-03-C4 | Escribe un nombre de 61 caracteres. | «El nombre admite hasta 60 caracteres.» y el botón deshabilitado hasta recortarlo. | ✅ Cumple. 61 caracteres: «El nombre admite hasta 60 caracteres.» y botón deshabilitado (true); recortado a 60: sin mensaje y botón habilitado (true) |
| HU-03-C5 | Guarda con el nombre vacío, y otra vez con solo espacios. | Se llama «Noche del {día} de {mes abreviado}» con la fecha de hoy, por ejemplo «Noche del 11 de nov». | ✅ Cumple. vacío y solo espacios → «Noche del 11 de nov» y «Noche del 11 de nov» (esperado «Noche del 11 de nov») |
| HU-03-C6 | Tras guardar, ve al inicio. | Las películas de la sesión siguen en «Pendientes». | ✅ Cumple. tras guardar 4 sesiones, «Pendientes» sigue con los mismos 12 títulos |
| HU-03-C7 | Guarda una segunda sesión con una película que ya está en la primera. | Se guarda sin advertencias; las dos sesiones aparecen en «Mis sesiones». | ✅ Cumple. «Toy Story» estaba en la primera sesión; se guardó en otra sin advertencias (0 errores) y ambas aparecen en «Mis sesiones» |
| HU-03-C8 | Abre el detalle de una sesión guardada. | Muestra el «Tiempo disponible» con el que la armaste y «Sobraban …». | ✅ Cumple. Ver HU-04-C3: el detalle de la sesión «Orden de agregado» muestra «Tiempo disponible: 10 h» con el que se armó y «Sobraban …» calculado. |
| HU-03-C9 | Pon *Offline* y pulsa «Guardar sesión». Luego quita *Offline* y pulsa de nuevo. | Primero «No se pudo guardar la sesión: …» y la sesión sigue armada; después se guarda. | ✅ Cumple. sin red: «No se pudo guardar la sesión: No se pudo conectar con el servidor.»; la sesión seguía armada (1 película); al volver la red se guardó |
| HU-03-C10 | Pulsa «Guardar sesión» dos veces muy rápido. | En «Mis sesiones» aparece una sola sesión nueva. | ✅ Cumple. dos clics en el mismo instante: «Mis sesiones» pasó de 5 a 6 sesiones |
| HU-03-C11 | Guarda una sesión llamada `<b>hola</b> 🎬`. | En la lista y en el detalle se ve literal, sin negrita. | ✅ Cumple. en la lista se lee «<b>hola</b> 🎬» (sin elemento <b>: true); en el detalle «<b>hola</b> 🎬» (sin <b>: true) |

## 5. HU-04 — Consultar mis sesiones guardadas

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-04-C1 | Con al menos dos sesiones, abre «Mis sesiones». | De la más reciente a la más antigua; cada una con nombre, fecha, cantidad de películas y duración total. | ✅ Cumple. 8 sesiones, de la más reciente a la más antigua: Orden de agregado › <b>hola</b> 🎬 › Doble clic › Con corte de red…; la más nueva dice «11 nov 2026 · 3 películas · 7 h 7 min» (esperado total 7 h 7 min) |
| HU-04-C2 | Entra con una cuenta sin sesiones. | «Aún no tienes sesiones guardadas.» | ✅ Cumple. cuenta B: «Aún no tienes sesiones guardadas.» |
| HU-04-C3 | Abre el detalle de una sesión. | Películas numeradas en el orden en que las agregaste, la duración de cada una, «Duración total», «Tiempo disponible» y «Sobraban …». | ✅ Cumple. 1. Vengadores: Endgame / 2. Toy Story / 3. Vengadores: Infinity War; Duración total: 7 h 7 min / Tiempo disponible: 10 h / Sobraban 2 h 53 min (esperado: total 7 h 7 min, disponible 10 h, sobraban 2 h 53 min) |
| HU-04-C4 | En el inicio quita de tu lista una película que está en una sesión. Reabre la sesión. | La sesión se ve igual, con esa película, su duración y su póster. | ✅ Cumple. se quitó «Vengadores: Endgame» de mi lista; la sesión se ve igual (mismas 3 películas, duraciones, pósters y totales) |
| HU-04-C5 | Cambia a «vista» una película de una sesión. Reabre la sesión. | La sesión no cambió. | ✅ Cumple. «Toy Story» pasó a «Vista» en mi lista; la sesión no cambió |
| HU-04-C6 | Revisa la lista y el detalle. | No hay botones de editar ni de eliminar. (La base lo rechaza: se comprueba con el script de HU-05-C4.) | ✅ Cumple. «Mis sesiones»: 0 botones; detalle: 0 botones; sin textos de editar/eliminar/borrar/quitar |
| HU-04-C7 | Con *Slow 3G*, abre «Mis sesiones». Luego bloquea `rest/v1/sesiones` y recarga. | Primero rectángulos de carga; después la pantalla de error («No se pudo conectar con el servidor.») con «Reintentar». | ✅ Cumple. Slow 3G: rectángulos de carga (true) y luego la lista (true); con la API bloqueada: pantalla de error con «No se pudo conectar con el servidor.» y botón «Reintentar»; al reintentar sin bloqueo se cargó la lista |

## 6. HU-05 — Mantener mis sesiones privadas

Ejecuta el script con las dos cuentas de prueba (las crea él mismo):

```bash
node --experimental-strip-types scripts/test-rls-sesiones.ts
```

Pega abajo su salida completa. Debe terminar en `26/26 verificaciones correctas.` Al final imprime el SQL para borrar los usuarios de prueba.

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-05-C1 | Cierra sesión (o usa una ventana privada) y abre `/noche`, `/noche/sesiones` y `/noche/sesiones/1`. | Las tres te llevan a `/login`. | ✅ Cumple. Sin sesión, «/noche», «/noche/sesiones» y «/noche/sesiones/1» terminan en «/login» (también «/»). |
| HU-05-C2 | Script: «A solo ve su sesión» y «B también ve únicamente la suya». | PASS | ✅ Cumple. Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «A solo ve su sesión, con sus películas» y «B también ve únicamente la suya»: PASS. |
| HU-05-C3 | Script: «B no ve la sesión de A pidiéndola por id». En el navegador, con la cuenta B abre la dirección del detalle de una sesión de A. | PASS, y en el navegador «No encontramos esa sesión.» | ✅ Cumple. la cuenta B abre la sesión 40 de A: «No encontramos esa sesión.»; una inexistente: «No encontramos esa sesión.»; «/abc»: «No encontramos esa sesión.» (se ven igual). El script de seguridad también pasó (26/26). |
| HU-05-C4 | Script: «B no puede modificar ni eliminar la sesión de A» y «La sesión de A sigue intacta». | PASS | ✅ Cumple. Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «B no puede modificar ni eliminar la sesión de A» y «La sesión de A sigue intacta»: PASS. |
| HU-05-C5 | Script: «B no puede insertar una sesión a nombre de A» y «B no puede insertar películas en la sesión de A». | PASS | ✅ Cumple. Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «B no puede insertar una sesión a nombre de A» y «B no puede insertar películas en la sesión de A»: PASS. |
| HU-05-C6 | Script: «Sin sesión, guardar_sesion es rechazada» y «Sin sesión no se ve ninguna sesión». | PASS | ✅ Cumple. Script `scripts/test-rls-sesiones.ts` contra Supabase real, corrida del 2026-11-11: 26/26 verificaciones correctas. «Sin sesión, guardar_sesion es rechazada» y «Sin sesión no se ve ninguna sesión»: PASS. |

**Salida del script:**

```text
PASS  A guarda su sesión
PASS  B guarda su sesión
PASS  Sin sesión, guardar_sesion es rechazada
PASS  Sin sesión no se ve ninguna sesión
PASS  A solo ve su sesión, con sus películas
PASS  B no ve la sesión de A pidiéndola por id
PASS  B no ve las películas de la sesión de A
PASS  B no puede modificar la sesión de A
PASS  B no puede eliminar la sesión de A
PASS  A tampoco puede modificar su propia sesión (solo lectura)
PASS  A tampoco puede eliminar su propia sesión (solo lectura)
PASS  Las películas de una sesión guardada tampoco se modifican
PASS  La sesión de A sigue intacta (existe, mismo nombre y misma película)
PASS  B no puede insertar una sesión a nombre de A
PASS  B no puede insertar películas en la sesión de A
PASS  Una película repetida falla y no deja una sesión a medias
PASS  Se rechaza: nombre vacío
PASS  Se rechaza: nombre de 61 caracteres
PASS  Se rechaza: tiempo de 29 minutos
PASS  Se rechaza: tiempo de 601 minutos
PASS  Se rechaza: duración de 0 minutos
PASS  Se rechaza: sesión sin películas
PASS  Los intentos rechazados no dejaron nada guardado
PASS  Se aceptan los límites exactos (nombre de 60, tiempo 30)
PASS  El orden en que se agregaron se guarda como 1, 2, 3
PASS  B también ve únicamente la suya

26/26 verificaciones correctas.

(Corrida del 2026-11-11 contra el Supabase real; se muestran las líneas de resultado, sin el detalle HTTP de cada una.)
```

## 7. Criterios de la spec que se comprueban en el navegador

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| ES-10 | Guarda una sesión y compara el inicio antes y después. | Las películas siguen «Pendientes»; nada cambió en tu lista. | ✅ Cumple. «Pendientes» antes de guardar sesiones: 12 títulos; después: 12; mismos títulos: true |
| ES-13 y ES-14 | Bloquea la petición de **una sola** película (`.../3/movie/<id>`) y recarga. | Esa película aparece en «No disponibles» con el error; las demás aparecen normalmente. | ✅ Cumple. se bloqueó solo «Dune» (id 438631): está en «No disponibles» con «No se pudo consultar la duración.»; las otras 3 que caben en 120 min (las esperadas) aparecen en «Caben» |
| ES-18 | Ver HU-05-C1. | Las tres rutas piden iniciar sesión. | ✅ Cumple. Igual que HU-05-C1: las tres rutas de «Noche de película» piden iniciar sesión. |
| ES-19 | Ver los criterios de carga y error de HU-01 y HU-04. | Cada pantalla muestra carga, error y vacío. | ✅ Cumple. Carga, error y vacío de cada pantalla simulados: HU-01-C8 (carga), C9 (error y reintento), C10 y C11 (vacíos); HU-04-C7 (carga y error con «Reintentar») y C2 (vacío). |
| ES-21 | Mira «Guardar sesión» con la sesión vacía, con una que se pasa y con una válida. | Deshabilitado, deshabilitado y habilitado. | ✅ Cumple. Guardar deshabilitado → vacía: true, se pasa: true; válida: false (deshabilitado=false significa habilitado) |
| ES-22 | Ver HU-04-C6. | Sin editar ni eliminar. | ✅ Cumple. botones en «Mis sesiones»: 0; en el detalle: 0 |
| ES-24 | Con ancho de 360 px, recorre `/noche`, `/noche/sesiones` y un detalle. | Sin scroll horizontal de la página. | ✅ Cumple. /noche: sin scroll horizontal = true; /noche/sesiones: sin scroll horizontal = true; detalle de sesión: sin scroll horizontal = true |
| DS-04 | Recorre cada pantalla nueva solo con Tab. | Todo control muestra su foco. | ✅ Cumple. /noche: 12 paradas con Tab, sin indicador de foco: ninguna / /noche/sesiones: 13 paradas con Tab, sin indicador de foco: ninguna / detalle de sesión: 5 paradas con Tab, sin indicador de foco: ninguna |
| DS-09 | Mira la pantalla en escala de grises. | Todo sigue siendo legible. | ✅ Cumple. Revisión visual de dos capturas en escala de grises (`/noche` con sesión armada y aviso de «se pasa», y `/noche/sesiones`): todo el texto se lee; el aviso de exceso se entiende por su texto y no solo por el color; el botón deshabilitado se distingue. Milo las revisó y confirmó que se leen bien. |

## 8. Regresión de E1

Las funciones del Proyecto 3 deben seguir funcionando igual ([`ESTADO-INICIAL.md`](ESTADO-INICIAL.md), sección 7).

| Comprobación | Resultado obtenido |
| --- | --- |
| Registro, login, logout y sesión persistente al recargar. | ✅ Cumple. entró a «/» con el correo rls-test-ui-a-1794449677983@example.com tras recargar sigue la sesión logout lleva a /login y el login vuelve a entrar mensaje: «Invalid login credentials» |
| Las rutas protegidas redirigen a `/login` sin sesión. | ✅ Cumple. terminó en /login |
| Búsqueda con año como pista, «Ver más», y estados de carga y error. | ✅ Cumple. «dune 2021» → primero «Dune» (2021); «blade runner 2049» (2049 no es un año plausible) → Blade Runner 2049 «Ver más»: de 40 a 80 resultados vacío: «No encontramos resultados para “zzzzqqqxxyy”.»; consulta corta: «Escribe al menos 2 caracteres para buscar.»; carga con Slow 3G: rectángulos (true) y luego resultados (true); error: «No se pudo conectar con el servidor.» |
| Agregar («+») y quitar (papelera) desde las tarjetas; agregar, cambiar de estado y quitar desde el detalle (con el selector). | ✅ Cumple. Tarjetas: «+» agrega y papelera quita (E1-D02-C10 y C12). Detalle: selector agrega y cambia entre los tres estados (E1-D02-C1, C2, C5) y «Quitar de mi lista» pide confirmación (REG-quitar-detalle). confirmación: «¿Quitar de tu lista? Se borrarán tu nota y comentario.»; «Cancelar» no quitó; «Quitar» → «“Breaking Bad” quitada de tu lista» y el selector volvió a «Agregar a…»; se volvió a agregar |
| Calificación (1 a 5, quitar con un segundo clic) y comentario en el detalle. | ✅ Cumple. «Noche fatídica»: 3 → «3 de 5»; segundo clic en la misma → «Sin calificar»; 5 estrellas y recarga → «5 de 5» comentario guardado y recuperado tras recargar: «Buen comentario de prueba»; vaciado y guardado: queda «» |
| Contador por estado, filtro por estado y orden por fecha o calificación. | ✅ Cumple. contadores {"pendientes":10,"en progreso":1,"vistas":2} = tarjetas por fila {"Pendientes":10,"En progreso":1,"Vistas":2} (true); filtro «Vistas» muestra solo: Vistas; orden «Mi calificación» en Pendientes: «Noche fatídica» (5★), «The Imitation Game (Descifrando Enigma)» (2★) primero |
| Recomendaciones sin títulos ya guardados. | ✅ Cumple. 19 recomendadas; repetidas con mi lista: 0 |
| `node --experimental-strip-types scripts/test-rls.ts` termina en 12/12. | ✅ Cumple. `scripts/test-rls.ts` contra Supabase real, corrida del 2026-11-11: 12/12 verificaciones correctas. |
| El encabezado muestra el enlace «Noche de película» y no se rompe en celular. | ✅ Cumple. a 360 px el enlace «Noche de película» está dentro de la pantalla (true) y el inicio no tiene scroll horizontal |

## 9. Mejoras de interfaz de E1 (E1-D01 a E1-D05)

Son las mejoras que salieron del feedback del profesor ([tickets](backlog/tickets-e1-mejoras-ui.md), [spec](specs/spec-e1-mejoras-ui.md)). Se ven en las pantallas de E1, no en las de E2.

Un Chrome automatizado ya recorrió estos comportamientos con los componentes reales, pero con una lista simulada y **sin Supabase**: sirve de ensayo, no sustituye este paso con la app real y tu cuenta.

**Preparación.** Tu lista debe tener al menos **10 títulos** (para que «Agregadas recientemente» desborde a ancho de escritorio; si no desborda, achica la ventana), alguno con calificación y alguno sin ella, en los tres estados. Para los pasos de «+» necesitas títulos que **no** estén en tu lista: salen en «Recomendadas para ti» y en la búsqueda.

### 9.1 E1-D01 — Información bajo la tarjeta

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D01-C1 | Abre el inicio sin tocar el mouse sobre las tarjetas. | Cada tarjeta muestra su título bajo el póster. | ✅ Cumple. 48 tarjetas, todas con título visible; overlay oculto sin hover en 48 |
| E1-D01-C2 | Busca `dune`. | Cada resultado muestra el año bajo el título. | ✅ Cumple. 40 resultados; sin año: ninguno |
| E1-D01-C3 | Mira una tarjeta de un título de tu lista que tenga calificación personal. | Estrellas chicas con esa calificación. | ✅ Cumple. «Matrix Resurrections» muestra estrellas chicas: «4.0 de 5 estrellas» |
| E1-D01-C4 | Mira una tarjeta de tu lista sin calificación y un resultado de búsqueda que no esté en tu lista. | No hay estrellas en ninguna. | ✅ Cumple. «Toy Story» (de mi lista, sin nota): 0 estrellas; resultado de búsqueda fuera de mi lista: 0 estrellas |
| E1-D01-C5 y C10 | Busca `pirates of the caribbean` (títulos largos) y compáralo con una fila de títulos cortos. | El título largo se corta en 2 líneas con «…». Los pósters de la fila quedan alineados arriba y con el mismo alto. | ✅ Cumple. 20 resultados a 360 px; máximo 2 líneas; 10 títulos recortados (p. ej. «Piratas del Caribe: La maldición de la Perla Negra»); pósters alineados por fila: true 5 filas: todas con un solo "top" y un solo alto de póster; filas con títulos de 1 y 2 líneas: 4 |
| E1-D01-C9 | Mira una tarjeta con un título de una sola línea. | Debajo de la línea no queda un hueco reservado para una segunda. | ✅ Cumple. «Django desencadenado»: alto 22.0 px con línea de 22.0 px; min-height auto |
| E1-D01-C6 | Pasa el mouse sobre una tarjeta; luego llega a otra solo con Tab. | En ambos casos aparece el botón de acción sobre el póster, arriba a la derecha. | ✅ Cumple. overlay con mouse: opacidad 1; con Tab (foco en una tarjeta): opacidad 1 |
| E1-D01-C7 | Modo dispositivo (Ctrl+Shift+M) con un celular táctil, y recarga. | El botón de acción se ve sin pasar el mouse. | ✅ Cumple. emulación táctil (hover:none = true); overlay con opacidad 1; botón 36×36 px |
| E1-D01-C8 | Haz click en el póster de una tarjeta, vuelve, y haz click en el título de otra. | Ambos abren el detalle. | ✅ Cumple. póster → /titulo/pelicula/1383750; título → /titulo/pelicula/62 |

### 9.2 E1-D02 — «+» y papelera en las tarjetas; selector solo en el detalle

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D02-C9 | En el inicio o la búsqueda, mira una tarjeta de un título que **no** está en tu lista. | Tiene el botón «+» y ningún selector de estado. | ✅ Cumple. Recomendadas: 19/19 con «+», 0 con selector; búsqueda «shrek»: 24 tarjetas fuera de mi lista, 0 con selector |
| E1-D02-C10 | Pulsa ese «+». | La tarjeta pasa a mostrar la papelera; el título aparece primero en «Agregadas recientemente» y en «Pendientes». | ✅ Cumple. «The Imitation Game (Descifrando Enigma)»: primera en «Agregadas recientemente» (true), está en «Pendientes» (true), en la búsqueda su botón es «Quitar “The Imitation Game (Descifrando Enigma)” de mi lista» |
| E1-D02-C11 | Mira una tarjeta de un título que sí está en tu lista. | Solo hay papelera: ni «+» ni selector. | ✅ Cumple. 28/28 tarjetas de mi lista tienen solo papelera, sin «+» ni selector |
| E1-D02-C12 | En la búsqueda, pulsa la papelera de un título de tu lista. | Se quita y la tarjeta vuelve a mostrar «+». | ✅ Cumple. «Dune: Parte dos» se quitó y su tarjeta volvió a mostrar «+» |
| E1-D02-C13 | Con *Slow 3G*, pulsa «+» y mira la tarjeta antes de que responda. | El botón está deshabilitado hasta que termina. | ✅ Cumple. «Shrek», 80 ms después de pulsar con Slow 3G: disabled=true, aria-busy=true |
| E1-D02-C14 | Abre el detalle de un título de tu lista. | Hay un selector con «Pendiente», «En progreso» y «Vista». | ✅ Cumple. opciones del selector: Pendiente, En progreso, Vista (actual: por_ver) |
| E1-D02-C1 | Abre el detalle de un título que **no** está en tu lista y elige «En progreso» en «Agregar a…». | Se agrega con ese estado. | ✅ Cumple. título «Guardianes de la Galaxia: Volumen 3», opción inicial «Agregar a…», aviso «“Guardianes de la Galaxia: Volumen 3” agregada a En progreso», valor final «viendo» |
| E1-D02-C2 | En el detalle de un título «Vista», elige «En progreso» y luego «Pendiente». | Cambia cada vez; en el inicio aparece en la fila correspondiente. | ✅ Cumple. avisos: «“Matrix Reloaded” movida a Vistas», «“Matrix Reloaded” movida a En progreso», «“Matrix Reloaded” movida a Pendientes»; queda en «Vistas»: Matrix Reloaded |
| E1-D02-C3 | Elige el estado que ya tiene. | No pasa nada: ni aviso ni petición (Network). | ✅ Automático: `miLista.test.ts`, `decidirCambioEstado` devuelve `ninguno` para los tres estados. |
| E1-D02-C4 | Con *Slow 3G*, cambia el estado en el detalle y mira el selector. | Está deshabilitado mientras dura el cambio. | ✅ Cumple. 80 ms después de elegir con Slow 3G: disabled=true, aria-busy=true; luego se habilitó |
| E1-D02-C5 | Prueba en el detalle: agregar, mover y elegir cualquiera de los tres estados. | Cualquier estado se puede elegir desde cualquier otro. | ✅ Cumple. En el detalle se pasó de vista → en progreso → pendiente → vista: cualquier estado desde cualquier otro. Ver E1-D02-C2. |
| E1-D02-C6 | Con *Slow 3G*, recarga el detalle. | Mientras la lista carga, el selector está deshabilitado. | ✅ Cumple. con la petición de la lista retrasada 4 s: al aparecer el selector disabled=true; después se habilitó |
| E1-D02-C7 | En el detalle, solo con teclado: Tab hasta el selector, abrirlo y elegir. | Se puede enfocar, abrir y elegir un estado. | ✅ Cumple. con Tab se enfocó el selector (true); con ↓ pasó de «por_ver» a «viendo». Milo confirmó que el menú desplegable se abre. |
| E1-D02-C8 | Dale calificación y comentario a un título; cambia su estado en el detalle. | La calificación y el comentario siguen ahí. | ✅ Cumple. tras cambiar a «viendo» y recargar: estado=viendo, nota=«4 de 5», comentario=«Comentario de verificación» |

### 9.3 E1-D03 — Avisos (snackbar)

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D03-C1 | Pulsa «+» en una tarjeta. | Aviso «“título” agregada a Pendientes». | ✅ Cumple. aviso al pulsar «+»: «“The Imitation Game (Descifrando Enigma)” agregada a Pendientes» |
| E1-D03-C2 | En el detalle, cambia el estado a «Vista». | Aviso «“título” movida a Vistas». | ✅ Cumple. Al cambiar de estado en el detalle el aviso fue «“Matrix Reloaded” movida a Vistas» (también a En progreso y a Pendientes). Ver E1-D02-C2. |
| E1-D03-C3 | Pulsa la papelera de una tarjeta. | Aviso «“título” quitada de tu lista». | ✅ Cumple. aviso al pulsar la papelera: «“Dune: Parte dos” quitada de tu lista» |
| E1-D03-C4 | Pon *Offline* y pulsa «+». | Aviso de error, con aspecto distinto al de éxito. | ✅ Cumple. sin red: aviso de error con role=alert, mensaje «No se pudo conectar con el servidor.» |
| E1-D03-C5 | Haz dos acciones seguidas (por ejemplo, «+» y luego una papelera). | Se ve un solo aviso: el último. | ✅ Cumple. dos altas seguidas («La leyenda de Korra», «Avatar: Los Siete Refugios»): 1 aviso visible: «“Avatar: Los Siete Refugios” agregada a Pendientes» |
| E1-D03-C6 | Deja un aviso de éxito sin tocarlo; en otro, pulsa «Cerrar aviso». | El primero se cierra solo a los ~4 s; el segundo, al pulsar el botón. | ✅ Cumple. el aviso de éxito se cerró solo a los ~4.0 s (aparece desde que lo vi); con «Cerrar aviso» se quitó (true) |
| E1-D03-C7 | Con 360 px, provoca un aviso con un título largo. | Se ve completo, sin scroll horizontal y sin tapar el encabezado. | ✅ Cumple. 360 px: aviso entre 16 y 344 px de 360, arriba en 639 (encabezado termina en 166), scroll horizontal: false; «“El señor de los anillos: La comunidad del anillo” agregada a Pendientes» |
| E1-D03-C8 | F12 → Elements, y busca el contenedor del aviso mientras está visible. | Tiene `role="status"` y `aria-live="polite"`; el de error lleva `role="alert"`. | ✅ Cumple. contenedor del aviso: role=status, aria-live=polite; el aviso de error lleva role=alert (visto en E1-D03-C4) |

### 9.4 E1-D04 — Flechas para navegar las filas

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D04-C1 | En el inicio, mira una fila con más tarjetas de las que caben. | No hay barra de scroll horizontal. | ✅ Cumple. la fila desborda (true) y no hay barra: offsetHeight − clientHeight = 0, scrollbar-width: none |
| E1-D04-C2 | Pasa el mouse sobre esa fila. | Aparecen flechas a media altura del póster (antes no se ven). | ✅ Cumple. opacidad antes del hover 0, con hover 1; centro de la flecha a 727 px y centro del póster a 727 px |
| E1-D04-C3 | Con la fila sin desplazar, mira las flechas. | Solo la de la derecha («siguiente»). | ✅ Cumple. al inicio (scrollLeft 0): flechas «anterior» 0, «siguiente» 1 |
| E1-D04-C4 | Pulsa «siguiente». | La fila avanza casi un ancho visible, aparecen tarjetas nuevas y surge la flecha de la izquierda. | ✅ Cumple. un click: la fila avanzó 972 px de 1068 visibles; aparece «anterior» (1) |
| E1-D04-C5 | Sigue pulsando hasta el final. | En el extremo final solo queda la flecha de la izquierda. | ✅ Cumple. al final: «anterior» 1, «siguiente» 0, fila al final: true |
| E1-D04-C6 | Mira una fila con pocas tarjetas (por ejemplo, 2) o ensancha la ventana. | No hay flechas. | ✅ Cumple. filas que caben completas: «En progreso» (2 tarjetas, 0 flechas); «Vistas» (1 tarjetas, 0 flechas) |
| E1-D04-C7 | Modo dispositivo táctil: mira una fila y arrástrala. | No hay flechas y la fila se desplaza al arrastrar. | ✅ Cumple. táctil: flechas con display none; deslizar movió la fila de 0 a 162 px |
| E1-D04-C8 | Con Tab llega a una flecha (aparece con el foco) y pulsa Enter. En Elements, mira su nombre. | La fila se desplaza. Las flechas se llaman «Ver anteriores» y «Ver siguientes». | ✅ Cumple. Tab llegó a «Ver siguientes» (visible con el foco: opacidad 1); Enter movió la fila de 0 a 972 px; nombres accesibles: Ver anteriores / Ver siguientes |
| E1-D04-C9 | Pulsa una flecha cuando queda sobre una tarjeta. | No abre el detalle de esa tarjeta. | ✅ Cumple. tras pulsar una flecha (sobre una tarjeta) la URL sigue siendo / |
| E1-D04-C10 | Cambia el ancho de la ventana con la fila a la vista. | Las flechas aparecen o desaparecen según la fila desborde o no. | ✅ Cumple. a 3200 px hay 3 flechas en total; a 700 px hay 4 (cambian al redimensionar sin recargar) |
| E1-D04-C11 | Con el foco en «Ver siguientes», pulsa Enter hasta llegar al final. | El foco pasa a «Ver anteriores» (se ve su anillo) y no se pierde. | ✅ Cumple. al llegar al final con Enter, el foco quedó en «icon-btn row__flecha row__flecha--anterior» |
| E1-D04-C12 | Desplaza «Agregadas recientemente» a la derecha. Luego pulsa «+» en una tarjeta de «Recomendadas para ti». | «Agregadas recientemente» vuelve al inicio y la tarjeta nueva se ve primero. | ✅ Cumple. la fila estaba desplazada 972 px; al agregar «Noche fatídica» volvió a 0 px y esa tarjeta está primera y a la vista (true) |
| E1-D04-C13 | Desplaza «Agregadas recientemente» y pulsa la papelera de una de sus tarjetas. | La fila no vuelve al inicio. | ✅ Cumple. desplazada 972 px; al quitar una tarjeta quedó en 810 px (no volvió al inicio) |
| E1-D04-C14 | Con Tab desde arriba del inicio, mira en qué orden se enfocan los controles de una fila con flechas. | La flecha «Ver siguientes» se enfoca antes que cualquier tarjeta de esa fila. | ✅ Cumple. «Recomendadas para ti»: primera parada en la fila = flecha (parada 10); «Agregadas recientemente»: primera parada en la fila = flecha (parada 49); «Pendientes»: primera parada en la fila = flecha (parada 76) |
| E1-D04-C15 | Mira dónde quedan las flechas y las tarjetas de una fila con el mouse encima. | Las flechas siguen sobre los bordes, a media altura del póster, y ninguna tarjeta se movió. | ✅ Cumple. flecha a 4 px del borde derecho de la fila (el CSS la pone a 4 px), centrada con el póster (709 vs 709 px); la primera tarjeta empieza en el borde izquierdo y todas están a la misma distancia una de otra |

### 9.5 E1-D05 — Escala tipográfica

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D05-C1 | Busca `font-size` en `src/index.css` y descarta los que ya llevan `var(--fs-`. | No queda ninguno fuera de `:root`. | ✅ Inspección: la búsqueda de `font-size` sin `var(--fs-` en `index.css` no devuelve nada (la misma de DS-02). |
| E1-D05-C2 | F12 → Elements → `<html>`, estilo de `:root`: sube `--font-base` (por ejemplo a `1.4rem`) y luego devuélvelo a su valor. | Todos los textos de la app crecen en proporción y vuelven al valor original. | ✅ Cumple. --font-base 1.1rem → 1.4rem: título de página 35.4→45.1 px, fila 17.6→22.4, tarjeta 17.6→22.4; al quitarlo vuelven a los valores originales |
| E1-D05-C3 | Recorre el inicio, la búsqueda, un detalle y «Noche de película». | En cada pantalla la jerarquía se mantiene: título de página > título de fila > texto > meta. | ✅ Cumple. inicio: 35.4 ≥ 17.6 ≥ 17.6 ≥ 15.3 px / busqueda: 30.8 ≥ 17.6 ≥ 15.3 px / detalle: 40.7 ≥ 16.0 ≥ 15.3 px / noche: 35.4 ≥ 17.6 ≥ 17.6 ≥ 15.3 px |

### 9.6 E1-D06 — Pantalla de error de conexión

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D06-C1 | En DevTools → Network bloquea `rest/v1/mi_lista` (o `api.themoviedb.org`) y recarga el inicio. Repite en la búsqueda (bloquea `3/search`), en el detalle de un título (`3/movie/`), en «Noche de película» (`mi_lista`), en «Mis sesiones» y en el detalle de una sesión (`rest/v1/sesiones`). | En cada una se ve la pantalla de error («Error 404» y «No se pudo conectar con el servidor.», con la imagen si ya está) en lugar del contenido, con el encabezado visible. | ✅ Cumple. 7 casos con la conexión cortada al cargar: Inicio (Supabase caído), Inicio (TMDB caído), Búsqueda, Detalle de un título, Noche de película, Mis sesiones, Detalle de una sesión. En todos: título «Error 404», texto «No se pudo conectar con el servidor.», encabezado visible y sin el contenido de la página. |
| E1-D06-C2 | Haz que TMDB responda con un 500 (DevTools → Network → *Override content*, o una herramienta de intercepción) y busca `matrix`. | La búsqueda muestra su mensaje de siempre («… TMDB respondió con estado 500») y no la pantalla de error. | ✅ Cumple. TMDB responde 500: la búsqueda muestra «No se pudo completar la búsqueda: TMDB respondió con estado 500» y no la pantalla de error |
| E1-D06-C3 | Pon *Offline* y pulsa «+» en una tarjeta. Luego, con conexión, arma una sesión, pon *Offline* y pulsa «Guardar sesión». | Snackbar «No se pudo conectar con el servidor.»; al guardar, «No se pudo guardar la sesión: No se pudo conectar con el servidor.». Sin texto técnico y la página sigue en su lugar. | ✅ Cumple. «+» sin red: snackbar «No se pudo conectar con el servidor.» y la búsqueda sigue en su lugar (true); guardar sesión sin red: «No se pudo guardar la sesión: No se pudo conectar con el servidor.» y «Noche» sigue en su lugar (true) |
| E1-D06-C4 | En «Mis sesiones» y en el detalle de una sesión bloquea `rest/v1/sesiones`, recarga, quita el bloqueo y pulsa «Reintentar». Mira también las demás pantallas con error. | Esas dos pantallas tienen «Reintentar» y cargan el contenido; las demás no tienen botón. | ✅ Cumple. «Mis sesiones» y el detalle de una sesión tienen «Reintentar» y, al quitar el bloqueo y pulsarlo, cargan el contenido; sin botón en: Inicio (Supabase caído), Inicio (TMDB caído), Búsqueda, Detalle de un título, Noche de película |
| E1-D06-C5 | Con ancho de 360 px, provoca la pantalla de error. | Se ve completa, sin scroll horizontal. | ✅ Cumple. a 360 px la pantalla ocupa de 16 a 344 px y no hay scroll horizontal (true) |
| E1-D06-C6 | F12 → Elements y busca el texto del error. | El párrafo lleva `role="alert"` y la página tiene un solo `h1`. | ✅ Cumple. en los 7 casos el texto lleva role="alert" y hay un solo h1 |
| E1-D06-C7 | Provoca la pantalla de error sin el archivo `public/error-servidor.png` y luego con él. | Sin archivo no queda un ícono de imagen rota; con archivo se ve la imagen, centrada y sin pasar de 320 px de ancho. | ✅ Cumple. sin archivo de imagen: 0 imágenes rotas en pantalla; con imagen: se muestra (ancho natural 1) con alt vacío |
