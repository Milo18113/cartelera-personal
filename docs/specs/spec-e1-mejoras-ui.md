# Spec — Mejoras de interfaz de E1

Describe **cómo** se construyen los tickets [E1-D01 a E1-D04](../backlog/tickets-e1-mejoras-ui.md) (E1-D05, la escala de fuentes, ya está implementada). El **qué** y las decisiones de diseño con su origen están en esos tickets; aquí solo se baja a archivos, componentes y comportamiento. La interfaz sigue [`DESIGN.md`](../../DESIGN.md) por nombre.

Orden de construcción: D01 → D02 → D03 → D04. Cada ticket deja la app funcionando.

## Principios

- **E1 no pierde ninguna función.** Cambia la forma de la tarjeta, cómo se elige el estado, cómo se confirma una acción y cómo se recorre una fila.
- **La lógica va al dominio** cuando se puede probar sin navegador (qué hacer al elegir un estado, los mensajes, cuándo mostrar las flechas) y se prueba con Vitest.
- **Cero código muerto:** lo que reemplazan estos cambios se elimina (`siguienteEstado`, `etiquetasEstado.ts`, la variante botón de `EstadoPill`).

## E1-D01 — Información siempre visible debajo de la tarjeta

```
article.card                       (columna)
├── div.card__media                (2:3, recorta, shimmer mientras baja el póster)
│   ├── img.card__poster | div.card__poster--empty
│   └── div.card__overlay          (solo acciones; aparece con hover o foco)
├── div.card__info                 (siempre visible)
│   ├── h3.card__title             (máximo 2 líneas)
│   └── p.card__meta               (año · estrellas de mi calificación)
└── a.card__link                   (cubre todo el article)
```

- `MovieCard` pasa a esta estructura. El `article` ya no fija la proporción 2:3: la fija `card__media`. El shimmer de carga del póster pasa a `card__media` (clase `skeleton`).
- **Estrellas:** `StarRating` suma la prop `tamano` (`'normal'` por defecto, `'chica'`). La tarjeta usa `'chica'` solo cuando hay `calificacion`; sin calificación no hay estrellas.
- **Año:** solo si existe (las tarjetas de mi lista no lo traen, D-12). Si no hay año ni calificación no se dibuja `card__meta`.
- **Esqueleto:** componente nuevo `MovieCardSkeleton` (media + dos líneas). Reemplaza el `div.card.card--skeleton` repetido en `MovieRow` y `SearchPage`, para que la página no salte al cargar.
- **Título:** `-webkit-line-clamp: 2`; el alto del bloque de información es el mismo en todas las tarjetas de una fila (reserva dos líneas).
- El overlay conserva el degradado solo arriba y abajo para dar contraste a los botones; en pantallas sin hover (`hover: none`) sigue siempre visible.

## E1-D02 — Selector de estado

**Dominio (`src/domain/miLista.ts`).** Se eliminan `SIGUIENTE_ESTADO` y `siguienteEstado`. Se agrega:

```ts
export type CambioEstado = 'ninguno' | 'agregar' | 'cambiar'

// Elegir el estado que ya tiene no hace nada; sin item se agrega; con item se cambia.
export function decidirCambioEstado(actual: Estado | null, nuevo: Estado): CambioEstado
```

**Componente `EstadoSelect`** (archivo propio):

```ts
interface EstadoSelectProps {
  estado: Estado | null        // null = el título no está en mi lista
  titulo: string               // el componente arma el aria-label: «Estado de “Dune”» o «Agregar “Dune” a mi lista»
  variante: 'tarjeta' | 'detalle'
  busy: boolean
  disabled?: boolean
  onCambiar: (estado: Estado) => void
}
```

- `<select>` nativo dentro de `span.estado-select`, con `appearance: none`, el ícono del estado a la izquierda (`ICONO_ESTADO` o `ICONO_AGREGAR`) y `ChevronDown` a la derecha, ambos con `ICON_PROPS` y `pointer-events: none`.
- Sin item: opción inicial deshabilitada «Agregar a…» seleccionada. Con item: las tres opciones con `ETIQUETA_ESTADO_SINGULAR` (Pendiente, En progreso, Vista).
- Color por estado con los mismos tokens que `icon-btn` y las pills (texto `--bg` sobre el color del estado); sin item, neutro (`--surface-highlight`). El estado nunca va solo en color: lleva ícono y texto (DS-09).
- Variante `tarjeta`: texto en `--fs-sm`, ocupa el ancho de la tarjeta. Variante `detalle`: texto en `--fs-base`, ancho propio.
- Elegir el estado actual no hace ninguna petición. `busy` o `disabled` deshabilitan el `select`; `busy` pone `aria-busy`.

**Tarjeta.** El botón de eliminar queda arriba a la derecha; el selector va **abajo** de la tarjeta, sobre el póster, donde antes iba la información. Si el título no está en mi lista, solo aparece el selector.

**`useAccionesTarjeta`.** `onAvanzar` se reemplaza por `onCambiarEstado(pelicula, estado)`, que usa `decidirCambioEstado` para llamar a `agregar` o `cambiarEstado`. Se renombra en `MovieCardWithActions`, `MovieRow`, `HomePage` y `SearchPage`.

**Detalle.** La pill-botón se reemplaza por `EstadoSelect` (variante `detalle`). Sigue deshabilitado mientras la lista carga o falla, para no insertar un título dos veces.

**Limpieza.** Se eliminan `src/components/etiquetasEstado.ts`, la variante botón de `EstadoPill` (queda solo informativa, la usa `StatPills`) y las reglas `.pill--btn*` de `index.css`.

## E1-D03 — Snackbar de notificaciones

**API** (`src/notificaciones/`, con el mismo patrón de contexto que `lista/` y `auth/`):

```ts
export type TipoNotificacion = 'exito' | 'error'
export interface Notificacion { tipo: TipoNotificacion; mensaje: string }

export interface NotificacionesContextValue {
  notificar: (notificacion: Notificacion) => void
  cerrar: () => void
}
```

- `NotificacionesProvider` guarda **una sola** notificación: una nueva reemplaza a la anterior. Se cierra sola a los 4 s (éxito) o a los 6 s (error); `cerrar` y el botón la quitan. El temporizador se reinicia con cada notificación nueva y se limpia al desmontar.
- `useNotificaciones()` devuelve el valor del contexto y lanza un error si se usa fuera del provider.
- El provider se monta en `AppLayout`, por fuera de `MiListaProvider` (que lo usa para sus errores), y dibuja el `Snackbar`.

**Componente `Snackbar`.**

- Una región `role="status"` (`aria-live="polite"`) que siempre existe, para que el lector de pantalla anuncie lo que aparece dentro. Si la notificación es de error, su contenido lleva `role="alert"`.
- Ícono (`CircleCheck` o `CircleAlert`), texto y un botón de cerrar con `X` y `aria-label="Cerrar aviso"`, todos con `ICON_PROPS`.
- Fijo abajo y centrado, con ancho máximo; en celular ocupa el ancho con el margen lateral. Respeta el área segura inferior (`env(safe-area-inset-bottom)`) y no tapa el encabezado.
- Entrada con deslizamiento corto, desactivada con `prefers-reduced-motion`.
- Colores solo con tokens: borde izquierdo `--color-vista` (éxito) o `--color-error` (error), sobre `--surface-highlight`.

**Mensajes** (`src/lista/mensajes.ts`, funciones puras con tests):

```ts
mensajeAgregada(titulo, estado)  // «“Dune” agregada a Pendientes»
mensajeMovida(titulo, estado)    // «“Dune” movida a Vistas»
mensajeQuitada(titulo)           // «“Dune” quitada de tu lista»
```

Usan `ETIQUETA_ESTADO` (Pendientes, En progreso, Vistas).

**Integración.**

- `useAccionesTarjeta` espera cada acción y, si salió bien, notifica éxito: agregar, cambiar estado o quitar.
- Los **errores** se notifican desde `MiListaProvider` (en `ejecutar`), así cubren también guardar calificación o comentario. Por eso desaparece `actionError` del provider, del contexto, del hook y de las tres páginas, junto con los avisos rojos que mostraban arriba de la página.
- Las pantallas de E2 no cambian.

## E1-D04 — Navegación de filas con flechas

**Dominio** (`src/domain/fila.ts`, funciones puras con tests):

```ts
// ¿Hay más tarjetas a la izquierda o a la derecha? Tolera 1 px de redondeo.
export function extremosDeFila(scrollLeft: number, clientWidth: number, scrollWidth: number): {
  anterior: boolean
  siguiente: boolean
}

// Cuánto avanza cada click: casi un ancho visible, para que la última tarjeta vista siga a la vista.
export function pasoDeDesplazamiento(clientWidth: number): number   // 90 % del ancho
```

**Hook `useFilaDesplazable`** (la lógica de desplazamiento no va en el componente):

- Devuelve `{ pistaRef, puedeAnterior, puedeSiguiente, desplazar }`. `pistaRef` es una función de ref (guarda el elemento en el estado), para que el hook se entere cuando la pista aparece o desaparece (la fila pasa por cargando, vacío y con datos).
- Mide con tres fuentes: el evento `scroll`, un `ResizeObserver` (cambia el ancho de la ventana) y un `MutationObserver` de los hijos (llegan o se van tarjetas). Todos llaman a `extremosDeFila`.
- `desplazar('anterior' | 'siguiente')` hace `scrollBy` con `pasoDeDesplazamiento`; `behavior: 'smooth'`, salvo con `prefers-reduced-motion`, que usa `'auto'`.

**`MovieRow`:**

```
div.row__viewport                  (position: relative)
├── div.row__track                 (la pista que se desplaza; sin barra visible)
├── button.icon-btn.row__flecha--anterior    (solo si hay más a la izquierda)
└── button.icon-btn.row__flecha--siguiente   (solo si hay más a la derecha)
```

- Flechas con `ChevronLeft` y `ChevronRight`, estilo `icon-btn`, `aria-label` «Ver anteriores» y «Ver siguientes». Se **omiten** cuando no hay más hacia ese lado (no se deshabilitan).
- Sobre los bordes de la fila, a media altura del **póster** (no de la tarjeta, para que la información de abajo no las descentre), encima de las tarjetas (`z-index` sobre el enlace y el overlay), de modo que un click en la flecha no abre el detalle.
- Visibles con hover sobre la fila o con foco de teclado; invisibles el resto del tiempo. En `hover: none` (táctil) no se muestran: se navega deslizando.
- La barra de scroll se oculta (`scrollbar-width: none` y `::-webkit-scrollbar`), pero la pista conserva `overflow-x: auto`, así que el gesto táctil y el trackpad siguen funcionando.

## Criterios y verificación

Los ids numeran los criterios de cada ticket, en el orden en que están escritos allí. **Vitest** = test automático; **Navegador** = paso en [`VERIFICACION.md`](../VERIFICACION.md).

| Id | Criterio (resumen) | Verificación |
| --- | --- | --- |
| E1-D01-C1 | Cada tarjeta muestra su título debajo del póster sin interacción. | Navegador |
| E1-D01-C2 | Un resultado de búsqueda muestra su año bajo el título. | Navegador |
| E1-D01-C3 | Un título con calificación personal muestra estrellas con esa calificación. | Navegador |
| E1-D01-C4 | Un título sin calificación no muestra estrellas. | Navegador |
| E1-D01-C5 | Un título largo ocupa dos líneas y las tarjetas de la fila quedan alineadas. | Navegador |
| E1-D01-C6 | Con mouse o teclado, aparecen las acciones sobre el póster. | Navegador |
| E1-D01-C7 | En pantalla táctil las acciones están visibles sin hover. | Navegador (emulación) |
| E1-D01-C8 | Click en el póster o en el título lleva al detalle. | Navegador |
| E1-D02-C1 | Un título fuera de mi lista se agrega con el estado que elijo. | Vitest (`decidirCambioEstado`) y Navegador |
| E1-D02-C2 | Un título en «vista» puede pasar a «en progreso» o «pendiente» y cambia de fila. | Vitest y Navegador |
| E1-D02-C3 | Elegir el estado actual no hace ninguna petición. | Vitest |
| E1-D02-C4 | Durante un cambio en curso, el selector de ese título no se puede usar. | Navegador |
| E1-D02-C5 | El detalle se comporta igual que las tarjetas. | Navegador |
| E1-D02-C6 | En el detalle, con la lista cargando, el selector está deshabilitado. | Navegador |
| E1-D02-C7 | Solo con teclado se puede enfocar, abrir y elegir un estado. | Navegador |
| E1-D02-C8 | Cambiar de estado conserva calificación y comentario. | Navegador |
| E1-D03-C1 | Agregar muestra un aviso que nombra el título y la lista. | Vitest (`mensajeAgregada`) y Navegador |
| E1-D03-C2 | Cambiar de estado muestra un aviso con el nuevo estado. | Vitest (`mensajeMovida`) y Navegador |
| E1-D03-C3 | Quitar muestra un aviso de que se quitó. | Vitest (`mensajeQuitada`) y Navegador |
| E1-D03-C4 | Una acción que falla muestra un aviso de error, distinto del de éxito. | Navegador |
| E1-D03-C5 | Un aviso nuevo reemplaza al anterior. | Navegador |
| E1-D03-C6 | El aviso se cierra solo a los pocos segundos o con el botón. | Navegador |
| E1-D03-C7 | En celular el aviso se ve completo, sin scroll horizontal y sin tapar el encabezado. | Navegador (360 px) |
| E1-D03-C8 | Un lector de pantalla anuncia el texto del aviso. | Navegador (inspección del DOM) |
| E1-D04-C1 | Una fila con más tarjetas de las que caben no muestra barra de scroll. | Navegador |
| E1-D04-C2 | Con el mouse sobre la fila aparecen las flechas, a media altura del póster. | Navegador |
| E1-D04-C3 | Al inicio de la fila solo aparece «siguiente». | Vitest (`extremosDeFila`) y Navegador |
| E1-D04-C4 | «Siguiente» avanza la fila y muestra tarjetas nuevas. | Navegador |
| E1-D04-C5 | En el extremo final solo aparece «anterior». | Vitest y Navegador |
| E1-D04-C6 | Una fila cuyas tarjetas caben completas no muestra flechas. | Vitest y Navegador |
| E1-D04-C7 | En táctil no hay flechas y deslizar funciona. | Navegador (emulación) |
| E1-D04-C8 | Con Tab y Enter sobre una flecha la fila se desplaza; cada flecha tiene nombre accesible. | Navegador |
| E1-D04-C9 | Un click en una flecha no abre el detalle de la tarjeta de abajo. | Navegador |
| E1-D04-C10 | Al cambiar el tamaño de la ventana las flechas se actualizan. | Navegador |

Criterios de interfaz de [`DESIGN.md`](../../DESIGN.md) que aplican a todo lo nuevo: DS-01 a DS-12.

## Casos de prueba de Vitest

- `miLista.test.ts`: `decidirCambioEstado(null, 'por_ver')` → agregar (y con cada estado); `('vista', 'viendo')` y `('vista', 'por_ver')` → cambiar; el mismo estado de entrada → ninguno, para los tres.
- `mensajes.test.ts` (en `src/lista/`): los tres mensajes para cada estado, con el título entre comillas inglesas y la concordancia correcta.
- `fila.test.ts`: al inicio (`scrollLeft` 0) solo siguiente; a mitad, ambas; al final (`scrollLeft + clientWidth` igual a `scrollWidth`) solo anterior; contenido que cabe, ninguna; tolerancia de 1 px; `pasoDeDesplazamiento(1000)` es 900.

## Ticket → archivos

| Ticket | Se crea | Se modifica | Se elimina |
| --- | --- | --- | --- |
| E1-D01 | `components/MovieCardSkeleton.tsx` | `MovieCard.tsx`, `StarRating.tsx`, `MovieRow.tsx`, `pages/SearchPage.tsx`, `index.css` | — |
| E1-D02 | `components/EstadoSelect.tsx`, `domain/miLista.test.ts` | `domain/miLista.ts`, `CardActions.tsx`, `MovieCardWithActions.tsx`, `MovieRow.tsx`, `EstadoPill.tsx`, `hooks/useAccionesTarjeta.ts`, `pages/HomePage.tsx`, `SearchPage.tsx`, `DetailPage.tsx`, `index.css` | `components/etiquetasEstado.ts` |
| E1-D03 | `notificaciones/NotificacionesProvider.tsx`, `notificacionesContextValue.ts`, `useNotificaciones.ts`, `components/Snackbar.tsx`, `lista/mensajes.ts`, `lista/mensajes.test.ts` | `components/AppLayout.tsx`, `lista/MiListaProvider.tsx`, `lista/miListaContextValue.ts`, `hooks/useAccionesTarjeta.ts`, `pages/HomePage.tsx`, `SearchPage.tsx`, `DetailPage.tsx`, `index.css` | — |
| E1-D04 | `domain/fila.ts`, `domain/fila.test.ts`, `hooks/useFilaDesplazable.ts` | `components/MovieRow.tsx`, `index.css` | — |

## Riesgos

- **Ancho de la tarjeta.** `--card-width` es 150 px y el texto base ahora es 17.6 px: el selector de la tarjeta usa `--fs-sm` y ocupa todo el ancho para que «En progreso» quepa. Si en el navegador se corta, se ajusta el relleno del selector, no el ancho de la tarjeta.
- **Estilo de un `<select>` nativo.** Con `appearance: none` y un ícono propio se ve igual en los navegadores principales; el desplegable lo dibuja el sistema, y es lo que se quiere (accesible por teclado y por lector de pantalla).
- **`line-clamp`.** `-webkit-line-clamp` funciona en todos los navegadores actuales; en uno que no lo soporte el título se vería completo, sin romper el diseño.
- **Cambia E1.** Estos tickets modifican la interfaz que el brief pide dejar «funcionando igual». Se compensa con la lista de regresión de E1 en `VERIFICACION.md`, que se amplía con estos criterios.
