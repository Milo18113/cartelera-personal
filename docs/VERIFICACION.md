# Verificación de E2 — Noche de película

Cómo comprobar cada criterio de las [historias](backlog/historias-e2.md) y de la [spec](specs/spec-e2-noche-de-pelicula.md) en el navegador. La columna **Resultado obtenido** la llena quien verifica, con lo que realmente vio.

- **⬜** pendiente de verificar.
- **✅ Automático** ya comprobado por `npm test` (142 tests, todos pasan). No necesita navegador.
- Para marcar un criterio como cumplido, escribe lo que viste (por ejemplo, «Cumple: vi el mensaje …»). Si no cumple, escribe qué pasó. Si no se puede probar, escribe «Sin verificar» y por qué.

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
| HU-01-C1 | Abre «Noche de película». Escribe `120`, luego `30` y luego `600`. | Cada valor se acepta sin mensaje y aparece la lista «Caben en tu tiempo». | ⬜ |
| HU-01-C2 | Escribe `29` y luego `601`. | Mensaje «El tiempo debe estar entre 30 y 600 minutos.» y no hay lista de películas. | ⬜ |
| HU-01-C3 | Borra el campo. Luego escribe `90,5` y luego `una hora`. | Vacío: «Escribe cuántos minutos tienes.» Los otros dos: «Usa un número entero de minutos, sin decimales ni texto.» | ⬜ |
| HU-01-C4 | Revisa que tu serie «por ver» y tu película «viendo» no estén. | No aparecen en «Caben en tu tiempo» ni en «No disponibles». | ✅ Automático: `candidatas.test.ts`, «descarta las series y los estados distintos de por ver». |
| HU-01-C5 | Anota la duración de una película de la lista. Pon exactamente ese tiempo (mínimo 30) y luego un minuto menos. | Con el tiempo exacto la película aparece; con un minuto menos desaparece. | ✅ Automático: `candidatas.test.ts`, límite exacto y «más larga que el tiempo». |
| HU-01-C6 | Si tienes una película «por ver» sin duración en TMDB (por ejemplo, un estreno lejano), mírala. | Aparece en «No disponibles» con «Sin duración conocida: no se puede agregar.» y sin botón «Agregar». | ⬜ (si no encuentras una película así, anota «Sin verificar»; la regla está probada en `duracionPelicula.test.ts`) |
| HU-01-C7 | Compara el orden de la lista con el de «Agregadas recientemente» del inicio. | La que lleva más tiempo en tu lista va primero; el orden es el inverso al de «Agregadas recientemente». | ✅ Automático: `candidatas.test.ts`, orden por fecha y desempate por título. |
| HU-01-C8 | Con *Slow 3G*, recarga la pantalla. | Se ven rectángulos de carga antes de la lista. | ⬜ |
| HU-01-C9 | Bloquea las peticiones a `api.themoviedb.org/3/movie/` y recarga. Quita el bloqueo y pulsa «Reintentar». | Las películas aparecen en «No disponibles» con «No se pudo consultar la duración.» y un botón «Reintentar». Tras reintentar pasan a «Caben en tu tiempo». | ⬜ |
| HU-01-C10 | Pasa temporalmente todas tus «por ver» a otro estado y abre la pantalla. | «No tienes películas por ver. Agrégalas desde el inicio.» | ⬜ |
| HU-01-C11 | Escribe `30` con películas más largas. | «Ninguna de tus películas por ver cabe en 30 min.» | ⬜ |
| HU-01-C12 | Cambia el tiempo varias veces (`120`, `200`, `90`). | La lista se actualiza cada vez, sin recargar. | ⬜ |

## 3. HU-02 — Armar una sesión

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-02-C1 | Pulsa «Agregar» en una película que cabe. | Aparece en «Tu sesión» y cambian «Duración total» y «Te quedan». | ⬜ |
| HU-02-C2 | Con una sola película en la sesión, mira «Duración total». | Es igual a la duración de esa película, sin pausa. | ✅ Automático: `nochePelicula.test.ts`, `duracionTotal([100]) = 100`. |
| HU-02-C3 | Agrega tres películas A, B y C. | «Duración total» = A + B + C + 20 min. Con 90, 100 y 120 son 5 h 30 min. | ⬜ |
| HU-02-C4 | Agrega películas hasta que una no quepa en lo que queda y pulsa «Agregar» en ella. | No se agrega y aparece «“título” no cabe: faltan N min (incluye la pausa de 10 min).», donde N = total actual + 10 + duración − tiempo disponible. | ⬜ |
| HU-02-C5 | Pon el tiempo igual a la «Duración total» de tu sesión. | «Te quedan 0 min», sin errores, y «Guardar sesión» habilitado. | ✅ Automático: `nochePelicula.test.ts`, `cabe(330, [90, 100, 120])` y restante 0. |
| HU-02-C6 | Con tres películas en la sesión, quita la del medio. | Desaparece y el total se recalcula con una sola pausa. | ⬜ |
| HU-02-C7 | Pulsa «Agregar» dos veces en la misma película. | La segunda vez: «“título” ya está en tu sesión.» y no se duplica. | ✅ Automático: `sesion.test.ts`, «una película repetida se rechaza como duplicada». |
| HU-02-C8 | Con una sesión armada, baja el tiempo por debajo de su «Duración total». | «Tu sesión se pasa por N min. Quita películas para poder guardarla.», «Guardar sesión» deshabilitado y la sesión no se pierde. | ⬜ |
| HU-02-C9 | Revisa una película sin duración (ver HU-01-C6). | No tiene botón «Agregar». | ✅ Automático: `sesion.test.ts`, duración nula, 0 o NaN se rechaza como sin duración. |
| HU-02-C10 | Con la sesión vacía, mira el resumen. | «Duración total: 0 min» y «Te quedan» igual a tu tiempo disponible. | ✅ Automático: `nochePelicula.test.ts`, sesión vacía dura 0 y deja todo el tiempo. |

## 4. HU-03 — Guardar mi sesión

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-03-C1 | Arma una sesión que quepa y pulsa «Guardar sesión». | «Sesión guardada.» con el enlace «Ver mis sesiones», y la sesión armada se vacía. | ⬜ |
| HU-03-C2 | Con la sesión vacía, mira el formulario. | «Agrega al menos una película para guardar.» y el botón deshabilitado. | ⬜ |
| HU-03-C3 | Escribe un nombre de 60 caracteres y guarda. Ábrelo en «Mis sesiones». | El nombre se ve idéntico al escrito. | ⬜ |
| HU-03-C4 | Escribe un nombre de 61 caracteres. | «El nombre admite hasta 60 caracteres.» y el botón deshabilitado hasta recortarlo. | ⬜ |
| HU-03-C5 | Guarda con el nombre vacío, y otra vez con solo espacios. | Se llama «Noche del {día} de {mes abreviado}» con la fecha de hoy, por ejemplo «Noche del 11 de nov». | ⬜ |
| HU-03-C6 | Tras guardar, ve al inicio. | Las películas de la sesión siguen en «Pendientes». | ⬜ |
| HU-03-C7 | Guarda una segunda sesión con una película que ya está en la primera. | Se guarda sin advertencias; las dos sesiones aparecen en «Mis sesiones». | ⬜ |
| HU-03-C8 | Abre el detalle de una sesión guardada. | Muestra el «Tiempo disponible» con el que la armaste y «Sobraban …». | ⬜ |
| HU-03-C9 | Pon *Offline* y pulsa «Guardar sesión». Luego quita *Offline* y pulsa de nuevo. | Primero «No se pudo guardar la sesión: …» y la sesión sigue armada; después se guarda. | ⬜ |
| HU-03-C10 | Pulsa «Guardar sesión» dos veces muy rápido. | En «Mis sesiones» aparece una sola sesión nueva. | ⬜ |
| HU-03-C11 | Guarda una sesión llamada `<b>hola</b> 🎬`. | En la lista y en el detalle se ve literal, sin negrita. | ⬜ |

## 5. HU-04 — Consultar mis sesiones guardadas

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-04-C1 | Con al menos dos sesiones, abre «Mis sesiones». | De la más reciente a la más antigua; cada una con nombre, fecha, cantidad de películas y duración total. | ⬜ |
| HU-04-C2 | Entra con una cuenta sin sesiones. | «Aún no tienes sesiones guardadas.» | ⬜ |
| HU-04-C3 | Abre el detalle de una sesión. | Películas numeradas en el orden en que las agregaste, la duración de cada una, «Duración total», «Tiempo disponible» y «Sobraban …». | ⬜ |
| HU-04-C4 | En el inicio quita de tu lista una película que está en una sesión. Reabre la sesión. | La sesión se ve igual, con esa película, su duración y su póster. | ⬜ |
| HU-04-C5 | Cambia a «vista» una película de una sesión. Reabre la sesión. | La sesión no cambió. | ⬜ |
| HU-04-C6 | Revisa la lista y el detalle. | No hay botones de editar ni de eliminar. (La base lo rechaza: se comprueba con el script de HU-05-C4.) | ⬜ |
| HU-04-C7 | Con *Slow 3G*, abre «Mis sesiones». Luego bloquea `rest/v1/sesiones` y recarga. | Primero rectángulos de carga; después un mensaje de error con «Reintentar». | ⬜ |

## 6. HU-05 — Mantener mis sesiones privadas

Ejecuta el script con las dos cuentas de prueba (las crea él mismo):

```bash
node --experimental-strip-types scripts/test-rls-sesiones.ts
```

Pega abajo su salida completa. Debe terminar en `26/26 verificaciones correctas.` Al final imprime el SQL para borrar los usuarios de prueba.

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| HU-05-C1 | Cierra sesión (o usa una ventana privada) y abre `/noche`, `/noche/sesiones` y `/noche/sesiones/1`. | Las tres te llevan a `/login`. | ⬜ |
| HU-05-C2 | Script: «A solo ve su sesión» y «B también ve únicamente la suya». | PASS | ⬜ |
| HU-05-C3 | Script: «B no ve la sesión de A pidiéndola por id». En el navegador, con la cuenta B abre la dirección del detalle de una sesión de A. | PASS, y en el navegador «No encontramos esa sesión.» | ⬜ |
| HU-05-C4 | Script: «B no puede modificar ni eliminar la sesión de A» y «La sesión de A sigue intacta». | PASS | ⬜ |
| HU-05-C5 | Script: «B no puede insertar una sesión a nombre de A» y «B no puede insertar películas en la sesión de A». | PASS | ⬜ |
| HU-05-C6 | Script: «Sin sesión, guardar_sesion es rechazada» y «Sin sesión no se ve ninguna sesión». | PASS | ⬜ |

**Salida del script:**

```text
(pega aquí la salida)
```

## 7. Criterios de la spec que se comprueban en el navegador

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| ES-10 | Guarda una sesión y compara el inicio antes y después. | Las películas siguen «Pendientes»; nada cambió en tu lista. | ⬜ |
| ES-13 y ES-14 | Bloquea la petición de **una sola** película (`.../3/movie/<id>`) y recarga. | Esa película aparece en «No disponibles» con el error; las demás aparecen normalmente. | ⬜ |
| ES-18 | Ver HU-05-C1. | Las tres rutas piden iniciar sesión. | ⬜ |
| ES-19 | Ver los criterios de carga y error de HU-01 y HU-04. | Cada pantalla muestra carga, error y vacío. | ⬜ |
| ES-21 | Mira «Guardar sesión» con la sesión vacía, con una que se pasa y con una válida. | Deshabilitado, deshabilitado y habilitado. | ⬜ |
| ES-22 | Ver HU-04-C6. | Sin editar ni eliminar. | ⬜ |
| ES-24 | Con ancho de 360 px, recorre `/noche`, `/noche/sesiones` y un detalle. | Sin scroll horizontal de la página. | ⬜ |
| DS-04 | Recorre cada pantalla nueva solo con Tab. | Todo control muestra su foco. | ⬜ |
| DS-09 | Mira la pantalla en escala de grises. | Todo sigue siendo legible. | ⬜ |

## 8. Regresión de E1

Las funciones del Proyecto 3 deben seguir funcionando igual ([`ESTADO-INICIAL.md`](ESTADO-INICIAL.md), sección 7).

| Comprobación | Resultado obtenido |
| --- | --- |
| Registro, login, logout y sesión persistente al recargar. | ⬜ |
| Las rutas protegidas redirigen a `/login` sin sesión. | ⬜ |
| Búsqueda con año como pista, «Ver más», y estados de carga y error. | ⬜ |
| Agregar («+») y quitar (papelera) desde las tarjetas; agregar, cambiar de estado y quitar desde el detalle (con el selector). | ⬜ |
| Calificación (1 a 5, quitar con un segundo clic) y comentario en el detalle. | ⬜ |
| Contador por estado, filtro por estado y orden por fecha o calificación. | ⬜ |
| Recomendaciones sin títulos ya guardados. | ⬜ |
| `node --experimental-strip-types scripts/test-rls.ts` termina en 12/12. | ⬜ |
| El encabezado muestra el enlace «Noche de película» y no se rompe en celular. | ⬜ |

## 9. Mejoras de interfaz de E1 (E1-D01 a E1-D05)

Son las mejoras que salieron del feedback del profesor ([tickets](backlog/tickets-e1-mejoras-ui.md), [spec](specs/spec-e1-mejoras-ui.md)). Se ven en las pantallas de E1, no en las de E2.

Un Chrome automatizado ya recorrió estos comportamientos con los componentes reales, pero con una lista simulada y **sin Supabase**: sirve de ensayo, no sustituye este paso con la app real y tu cuenta.

**Preparación.** Tu lista debe tener al menos **10 títulos** (para que «Agregadas recientemente» desborde a ancho de escritorio; si no desborda, achica la ventana), alguno con calificación y alguno sin ella, en los tres estados. Para los pasos de «+» necesitas títulos que **no** estén en tu lista: salen en «Recomendadas para ti» y en la búsqueda.

### 9.1 E1-D01 — Información bajo la tarjeta

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D01-C1 | Abre el inicio sin tocar el mouse sobre las tarjetas. | Cada tarjeta muestra su título bajo el póster. | ⬜ |
| E1-D01-C2 | Busca `dune`. | Cada resultado muestra el año bajo el título. | ⬜ |
| E1-D01-C3 | Mira una tarjeta de un título de tu lista que tenga calificación personal. | Estrellas chicas con esa calificación. | ⬜ |
| E1-D01-C4 | Mira una tarjeta de tu lista sin calificación y un resultado de búsqueda que no esté en tu lista. | No hay estrellas en ninguna. | ⬜ |
| E1-D01-C5 y C10 | Busca `pirates of the caribbean` (títulos largos) y compáralo con una fila de títulos cortos. | El título largo se corta en 2 líneas con «…». Los pósters de la fila quedan alineados arriba y con el mismo alto. | ⬜ |
| E1-D01-C9 | Mira una tarjeta con un título de una sola línea. | Debajo de la línea no queda un hueco reservado para una segunda. | ⬜ |
| E1-D01-C6 | Pasa el mouse sobre una tarjeta; luego llega a otra solo con Tab. | En ambos casos aparece el botón de acción sobre el póster, arriba a la derecha. | ⬜ |
| E1-D01-C7 | Modo dispositivo (Ctrl+Shift+M) con un celular táctil, y recarga. | El botón de acción se ve sin pasar el mouse. | ⬜ |
| E1-D01-C8 | Haz click en el póster de una tarjeta, vuelve, y haz click en el título de otra. | Ambos abren el detalle. | ⬜ |

### 9.2 E1-D02 — «+» y papelera en las tarjetas; selector solo en el detalle

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D02-C9 | En el inicio o la búsqueda, mira una tarjeta de un título que **no** está en tu lista. | Tiene el botón «+» y ningún selector de estado. | ⬜ |
| E1-D02-C10 | Pulsa ese «+». | La tarjeta pasa a mostrar la papelera; el título aparece primero en «Agregadas recientemente» y en «Pendientes». | ⬜ |
| E1-D02-C11 | Mira una tarjeta de un título que sí está en tu lista. | Solo hay papelera: ni «+» ni selector. | ⬜ |
| E1-D02-C12 | En la búsqueda, pulsa la papelera de un título de tu lista. | Se quita y la tarjeta vuelve a mostrar «+». | ⬜ |
| E1-D02-C13 | Con *Slow 3G*, pulsa «+» y mira la tarjeta antes de que responda. | El botón está deshabilitado hasta que termina. | ⬜ |
| E1-D02-C14 | Abre el detalle de un título de tu lista. | Hay un selector con «Pendiente», «En progreso» y «Vista». | ⬜ |
| E1-D02-C1 | Abre el detalle de un título que **no** está en tu lista y elige «En progreso» en «Agregar a…». | Se agrega con ese estado. | ⬜ |
| E1-D02-C2 | En el detalle de un título «Vista», elige «En progreso» y luego «Pendiente». | Cambia cada vez; en el inicio aparece en la fila correspondiente. | ⬜ |
| E1-D02-C3 | Elige el estado que ya tiene. | No pasa nada: ni aviso ni petición (Network). | ✅ Automático: `miLista.test.ts`, `decidirCambioEstado` devuelve `ninguno` para los tres estados. |
| E1-D02-C4 | Con *Slow 3G*, cambia el estado en el detalle y mira el selector. | Está deshabilitado mientras dura el cambio. | ⬜ |
| E1-D02-C5 | Prueba en el detalle: agregar, mover y elegir cualquiera de los tres estados. | Cualquier estado se puede elegir desde cualquier otro. | ⬜ |
| E1-D02-C6 | Con *Slow 3G*, recarga el detalle. | Mientras la lista carga, el selector está deshabilitado. | ⬜ |
| E1-D02-C7 | En el detalle, solo con teclado: Tab hasta el selector, abrirlo y elegir. | Se puede enfocar, abrir y elegir un estado. | ⬜ |
| E1-D02-C8 | Dale calificación y comentario a un título; cambia su estado en el detalle. | La calificación y el comentario siguen ahí. | ⬜ |

### 9.3 E1-D03 — Avisos (snackbar)

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D03-C1 | Pulsa «+» en una tarjeta. | Aviso «“título” agregada a Pendientes». | ⬜ |
| E1-D03-C2 | En el detalle, cambia el estado a «Vista». | Aviso «“título” movida a Vistas». | ⬜ |
| E1-D03-C3 | Pulsa la papelera de una tarjeta. | Aviso «“título” quitada de tu lista». | ⬜ |
| E1-D03-C4 | Pon *Offline* y pulsa «+». | Aviso de error, con aspecto distinto al de éxito. | ⬜ |
| E1-D03-C5 | Haz dos acciones seguidas (por ejemplo, «+» y luego una papelera). | Se ve un solo aviso: el último. | ⬜ |
| E1-D03-C6 | Deja un aviso de éxito sin tocarlo; en otro, pulsa «Cerrar aviso». | El primero se cierra solo a los ~4 s; el segundo, al pulsar el botón. | ⬜ |
| E1-D03-C7 | Con 360 px, provoca un aviso con un título largo. | Se ve completo, sin scroll horizontal y sin tapar el encabezado. | ⬜ |
| E1-D03-C8 | F12 → Elements, y busca el contenedor del aviso mientras está visible. | Tiene `role="status"` y `aria-live="polite"`; el de error lleva `role="alert"`. | ⬜ |

### 9.4 E1-D04 — Flechas para navegar las filas

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D04-C1 | En el inicio, mira una fila con más tarjetas de las que caben. | No hay barra de scroll horizontal. | ⬜ |
| E1-D04-C2 | Pasa el mouse sobre esa fila. | Aparecen flechas a media altura del póster (antes no se ven). | ⬜ |
| E1-D04-C3 | Con la fila sin desplazar, mira las flechas. | Solo la de la derecha («siguiente»). | ⬜ |
| E1-D04-C4 | Pulsa «siguiente». | La fila avanza casi un ancho visible, aparecen tarjetas nuevas y surge la flecha de la izquierda. | ⬜ |
| E1-D04-C5 | Sigue pulsando hasta el final. | En el extremo final solo queda la flecha de la izquierda. | ⬜ |
| E1-D04-C6 | Mira una fila con pocas tarjetas (por ejemplo, 2) o ensancha la ventana. | No hay flechas. | ⬜ |
| E1-D04-C7 | Modo dispositivo táctil: mira una fila y arrástrala. | No hay flechas y la fila se desplaza al arrastrar. | ⬜ |
| E1-D04-C8 | Con Tab llega a una flecha (aparece con el foco) y pulsa Enter. En Elements, mira su nombre. | La fila se desplaza. Las flechas se llaman «Ver anteriores» y «Ver siguientes». | ⬜ |
| E1-D04-C9 | Pulsa una flecha cuando queda sobre una tarjeta. | No abre el detalle de esa tarjeta. | ⬜ |
| E1-D04-C10 | Cambia el ancho de la ventana con la fila a la vista. | Las flechas aparecen o desaparecen según la fila desborde o no. | ⬜ |
| E1-D04-C11 | Con el foco en «Ver siguientes», pulsa Enter hasta llegar al final. | El foco pasa a «Ver anteriores» (se ve su anillo) y no se pierde. | ⬜ |
| E1-D04-C12 | Desplaza «Agregadas recientemente» a la derecha. Luego pulsa «+» en una tarjeta de «Recomendadas para ti». | «Agregadas recientemente» vuelve al inicio y la tarjeta nueva se ve primero. | ⬜ |
| E1-D04-C13 | Desplaza «Agregadas recientemente» y pulsa la papelera de una de sus tarjetas. | La fila no vuelve al inicio. | ⬜ |

### 9.5 E1-D05 — Escala tipográfica

| Criterio | Cómo verificarlo | Resultado esperado | Resultado obtenido |
| --- | --- | --- | --- |
| E1-D05-C1 | Busca `font-size` en `src/index.css` y descarta los que ya llevan `var(--fs-`. | No queda ninguno fuera de `:root`. | ✅ Inspección: la búsqueda de `font-size` sin `var(--fs-` en `index.css` no devuelve nada (la misma de DS-02). |
| E1-D05-C2 | F12 → Elements → `<html>`, estilo de `:root`: sube `--font-base` (por ejemplo a `1.4rem`) y luego devuélvelo a su valor. | Todos los textos de la app crecen en proporción y vuelven al valor original. | ⬜ |
| E1-D05-C3 | Recorre el inicio, la búsqueda, un detalle y «Noche de película». | En cada pantalla la jerarquía se mantiene: título de página > título de fila > texto > meta. | ⬜ |
