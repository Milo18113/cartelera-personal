# DESIGN.md — Sistema de diseño de Mi Cartelera Personal

Reglas visuales de la app. Todo componente nuevo (incluida la pantalla «Noche de película») se construye con lo que define este documento; la spec de interfaz lo cita por nombre y no copia sus valores.

> **Sincronización.** Los valores de este documento están copiados de [`src/index.css`](src/index.css) (la fuente de verdad) al 2026-11-10, junto con el [brand board](docs/diseno/brand-board.html). Si cambia un token en el CSS, se actualizan los tres.

## 1. Principios

1. **Oscuro y sobrio.** Fondo casi negro; el póster es lo único con color fuerte.
2. **El color significa estado.** Naranja = pendiente, azul = en progreso, verde = vista. Ningún otro elemento se pinta con esos tres para decorar.
3. **Una sola familia de íconos.** `lucide-react`, mismo tamaño y trazo en toda la app.
4. **Nunca solo color.** Un estado siempre lleva su ícono o su texto además del color.
5. **Todo estado se ve.** Cada pantalla que consulta red muestra carga, error y vacío.

## 2. Cómo se personaliza (y por qué no es Bootstrap)

El brief del Entregable 4 menciona Bootstrap; el Proyecto 3 no lo usa y se mantiene así (decisión I-01 de [`docs/ESTADO-INICIAL.md`](docs/ESTADO-INICIAL.md)): migrar rompería la coherencia visual y duplicaría estilos.

| Aspecto | Cómo se resuelve aquí |
| --- | --- |
| Hoja de estilos | Una sola: `src/index.css`. Sin CSS por componente ni `<style>` embebidos. |
| Personalización | Se edita el **valor de un token** en `:root`, igual que Bootstrap con sus variables `--bs-*`. No se sobrescribe con selectores más específicos. |
| Nombres de clase | BEM: `bloque__elemento--modificador` (`card__poster`, `btn--danger`). Los nombres de los botones, alertas y tarjetas son los mismos conceptos que en Bootstrap. |
| Variantes | Una clase modificadora nueva, nunca estilos en línea. |
| Componente nuevo | Su propia sección comentada en `index.css`, usando solo tokens. |

## 3. Tokens

### Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#14181c` | Fondo de la app. También el texto sobre fondos de color (botón primario, botones de estado). |
| `--surface` | `#1f252b` | Fondo de tarjetas, campos y esqueletos. |
| `--surface-highlight` | `#313b45` | Brillo del shimmer y estrellas vacías. |
| `--border` | `#2c343c` | Bordes y divisores. |
| `--text` | `#9ab` | Texto corriente y secundario. |
| `--text-soft` | `#ccd` | Texto de lectura larga (sinopsis, reparto). |
| `--text-strong` | `#fff` | Títulos, texto activo, hover. |
| `--color-por-ver` | `#ff8000` | Estado «pendiente». |
| `--color-viendo` | `#40bcf4` | Estado «en progreso». También el anillo de foco de los campos. |
| `--color-vista` | `#00e054` | Estado «vista». También acción primaria, enlaces y avisos de éxito. |
| `--color-error` | `#ff6b6b` | Errores y acciones destructivas. |
| `--color-estrella` | `#f5c518` | Estrellas. Distinto de los tres colores de estado. |

El verde `--color-vista` también marca la acción primaria y los enlaces; es una ambigüedad heredada. En pantallas nuevas, el estado «vista» siempre lleva su ícono (`Eye`) junto al color.

### Tipografía

| Token | Valor | Uso |
| --- | --- | --- |
| `--font-body` | `Refinery 35 Regular`, luego `system-ui` | Todo el texto. |
| `--font-display` | `Refinery 35 Bold`, luego la regular | Solo `h1`, `h2`, pills y chips de filtro. |

Solo existen esos dos archivos de fuente: `font-synthesis: none` evita negritas o cursivas falsas.

**Escala.** Dos variables controlan todos los tamaños; cada paso es el anterior por `--font-ratio`.

| Variable | Valor |
| --- | --- |
| `--font-base` | `1.1rem` (17.6 px) |
| `--font-ratio` | `1.15` |

| Paso | Tamaño | Uso |
| --- | --- | --- |
| `--fs-sm` | 0.957rem · 15.3 px | Meta de tarjeta, etiquetas en mayúsculas (`detail__label`). |
| `--fs-base` | 1.1rem · 17.6 px | Texto de interfaz: botones, campos, pills, filas. |
| `--fs-md` | 1.265rem · 20.2 px | Marca del header, créditos del detalle. |
| `--fs-lg` | 1.455rem · 23.3 px | Mínimo del título de búsqueda. |
| `--fs-xl` | 1.673rem · 26.8 px | Mínimo del título del inicio. |
| `--fs-2xl` | 1.924rem · 30.8 px | Título de login, máximo del título de búsqueda. |
| `--fs-3xl` | 2.212rem · 35.4 px | Máximo del título del inicio. |
| `--fs-4xl` | 2.544rem · 40.7 px | Máximo del título del detalle. |

Los títulos que cambian con el ancho usan `clamp(var(--fs-xl), 4vw, var(--fs-3xl))`. Los tamaños de ícono y de estrella son medidas de ícono, no de texto, y quedan fuera de la escala.

### Forma y medidas

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius` | `6px` | Tarjetas, campos, botones de texto, alertas. |
| `--radius-icon-btn` | `10px` | Botones de ícono (16 px con esquina squircle donde el navegador la soporta). |
| `--icon-btn-size` | `36px` | Lado del botón de ícono. |
| `--card-width` | `150px` | Ancho de la tarjeta de póster. |
| `--page-width` | `1100px` | Ancho máximo de la página. |

Pills y chips usan `999px` (cápsula). **Espaciado:** no hay tokens; se usan múltiplos de 4 px (4, 8, 12, 16, 24, 28, 32, 48) y, por tradición, 6 y 10. Entre bloques de una página: 28 px; dentro de un bloque: 6 a 12 px.

### Íconos

`lucide-react` con `ICON_PROPS` (`size: 18`, `strokeWidth: 2`, en `src/components/iconos.ts`). Pendiente → `Clock`, en progreso → `Play`, vista → `Eye`, agregar → `Plus`, eliminar → `Trash2`, calificación → `Star`.

## 4. Componentes

| Componente | Clase | Cuándo usarlo | Variantes y estados |
| --- | --- | --- | --- |
| Botón de texto | `.btn` | Acciones con palabra. | `--primary` (acción principal, verde), `--ghost` (secundaria, borde), `--danger` (destructiva). Deshabilitado: 50 % de opacidad. |
| Botón de ícono | `.icon-btn` | Acción rápida sobre un póster. Cuadrado, 36 px. | Neutro; `--por_ver`, `--viendo`, `--vista` (color de estado); `--eliminar` (hover rojo). `aria-busy` atenúa. |
| Pill | `.pill` | Mostrar un estado o un conteo. Cápsula con fondo teñido de su propio color. | `--por_ver`, `--viendo`, `--vista`, `--ninguna`; `--btn` si es clicable. |
| Chip | `.chip` | Filtro de un grupo. | `aria-pressed="true"`: fondo blanco, texto oscuro. |
| Campo | `.field input`, `select`, `.comment__input` | Entrada de datos. Etiqueta arriba, gap de 4 px. | Foco: contorno de 2 px en `--color-viendo`. |
| Alerta | `.alert` | Mensaje en la página. | `--error`, `--ok`. |
| Tarjeta | `.card` | Un título con póster 2:3. Todo es un enlace al detalle. | Overlay de acciones con hover o foco (siempre visible sin hover). `--skeleton` y `--cargando`: shimmer. |
| Fila / grilla | `.row`, `.grid` | Fila con scroll horizontal; grilla que salta de línea. | Mensajes `.row__message`. |
| Estrellas | `.stars` (lectura), `.rating-input` (edición) | Calificación 0 a 5. | Llena `--color-estrella`, vacía `--surface-highlight`. |
| Confirmación en línea | `.confirm` | Antes de una acción que borra datos. | Texto + `btn--danger` + `btn--ghost`. |
| Carga y vacío | `.status-message`, `.skeleton` | Esperando o sin datos. | Esqueleto con el mismo shimmer que la tarjeta. |

**Layout.** `.app` centra el contenido a `--page-width` con 16 px de margen lateral. Dos puntos de quiebre: `720px` (el detalle pasa a una columna) y `640px` (el buscador baja a su propia línea y se oculta el correo).

## 5. Accesibilidad

- Foco siempre visible: contorno de 2 px (`--text-strong` en botones, `--color-viendo` en campos).
- Todo botón de solo ícono lleva `aria-label`.
- Acciones en curso: `aria-busy`. Errores: `role="alert"`. Confirmaciones: `role="status"`.
- El shimmer se apaga con `prefers-reduced-motion`.
- Objetivo táctil mínimo de 36 px. En pantallas sin hover (`hover: none`) las acciones de la tarjeta están siempre visibles.
- Contrastes medidos (WCAG, mínimo 4.5:1): `--text` sobre `--bg` 7.49:1, sobre `--surface` 6.50:1; `--text-soft` 11.25:1; `--text-strong` 17.84:1; `--color-por-ver` 7.08:1; `--color-viendo` 8.26:1; `--color-vista` 10.02:1; `--color-error` 6.43:1; `--color-estrella` 10.94:1. El texto `--bg` sobre cada color de estado: 7.08:1 a 10.02:1.

## 6. Prohibido

- Bootstrap, Tailwind o cualquier librería de estilos o de componentes.
- Estilos en línea (`style=`) y `<style>` en componentes. Única excepción: un valor calculado en tiempo de ejecución (el ancho del relleno de una estrella).
- Colores literales en CSS nuevo: se usa un token.
- Tamaños de fuente literales: se usa un `--fs-*`.
- Otras familias de íconos, e íconos hechos con emoji en controles.
- Más fuentes que las dos del proyecto, o `font-weight` para simular una fuente que no existe.
- `!important`.
- Usar `--color-por-ver`, `--color-viendo` o `--color-vista` con un significado distinto de su estado.
- Crear un tercer tipo de botón: se usa `.btn` o `.icon-btn`.

## 7. Criterios de diseño verificables

| Id | Criterio | Cómo se verifica |
| --- | --- | --- |
| DS-01 | El CSS nuevo no contiene colores literales. | Revisar el diff: ningún `#` ni `rgb(` fuera de `:root`. |
| DS-02 | Todo `font-size` usa un `--fs-*`. | Buscar `font-size` en `index.css`: ninguno sin `var(--fs-`. |
| DS-03 | Los íconos son de `lucide-react` con `ICON_PROPS`. | Revisar imports y props en los componentes nuevos. |
| DS-04 | Todo control interactivo muestra foco con Tab. | Recorrer la pantalla con el teclado. |
| DS-05 | Todo botón de solo ícono tiene `aria-label`. | Inspeccionar el DOM. |
| DS-06 | La pantalla que consulta red muestra carga, error y vacío. | Simular cada caso en el navegador. |
| DS-07 | A 360 px de ancho no hay scroll horizontal de página. | Probar con las herramientas de desarrollo del navegador. |
| DS-08 | Las animaciones respetan `prefers-reduced-motion`. | Activar la preferencia y comprobar que no hay movimiento. |
| DS-09 | Un estado nunca se comunica solo con color. | Mirar la pantalla en escala de grises: el estado sigue siendo legible. |
| DS-10 | No hay estilos en línea ni `!important` en el código nuevo. | Buscar `style=` y `!important` en el diff. |
| DS-11 | Los componentes nuevos usan nombres BEM y viven en su propia sección de `index.css`. | Revisar el diff. |
| DS-12 | Los botones usan `.btn` o `.icon-btn`, sin variantes ad hoc. | Revisar los componentes nuevos. |

## 8. Excepciones heredadas

Valores literales que existen en `index.css` del Proyecto 3 y no cumplen DS-01. No se corrigen en este entregable.

| Dónde | Literal | Equivalente |
| --- | --- | --- |
| `.icon-btn` | `rgba(20, 24, 28, 0.72)` y `rgba(255, 255, 255, 0.18)` | `--bg` y blanco translúcido. |
| `.card__overlay` | degradado con `rgba(0, 0, 0, …)` | Sin token. |
| `.card__meta` | `#ccd` | Es `--text-soft`. |
| `.alert--error`, `.alert--ok` | `rgba(255, 107, 107, 0.12)`, `rgba(0, 224, 84, 0.12)` | `--color-error` y `--color-vista` al 12 %. |

Los tickets [E1-D01 a E1-D04](docs/backlog/tickets-e1-mejoras-ui.md) (información bajo la tarjeta, selector de estado, snackbar, flechas en las filas) cambiarían las tarjetas y añadirían componentes. Este documento describe el estado actual; se actualiza cuando se implementen.
