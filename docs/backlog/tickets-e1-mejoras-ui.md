# Tickets E1 — Mejoras de UI/UX heredadas del Proyecto 3

Estos tickets corrigen deuda de la épica **E1** (Proyecto 3, ya construida) registrada en [`ESTADO-INICIAL.md`](../ESTADO-INICIAL.md#6-deuda-pendiente). Son **decisiones de diseño UI/UX**: parten de la retroalimentación del profesor sobre el Proyecto 3 y se completan con criterio propio para mejorar la experiencia. Cada decisión indica su origen.

> Retroalimentación del profesor (Proyecto 3): «el estado solo avanza, así que una película marcada como vista no puede volver a "viendo"; las tarjetas esconden título y año hasta pasar el mouse; y al agregar no hay mensaje de confirmación, solo cambia un icono».

Restricciones comunes a todos los tickets:

- Se usa el CSS propio del proyecto (`src/index.css`) con sus tokens existentes; ninguna librería de estilos nueva.
- Íconos de `lucide-react` con `ICON_PROPS`, y botones con el estilo `icon-btn` ya existente.
- Ningún cambio en la base de datos ni en las políticas RLS.
- Las funciones del checklist de regresión de `ESTADO-INICIAL.md` siguen funcionando.

---

## E1-D01 — Información siempre visible debajo de la tarjeta

**Tipo:** Mejora (UI/UX) · **Prioridad:** Alta · **Deuda:** D-01

**Historia de usuario**
> Como usuario, quiero ver el título, el año y mi calificación de cada tarjeta sin pasar el mouse, para reconocer las películas de un vistazo, también desde el celular.

**Descripción**
La información sale del overlay y pasa a un bloque fijo debajo del póster. El overlay se queda solo con las acciones (estado y eliminar) y sigue apareciendo con hover o foco.

| Decisión | Origen |
| --- | --- |
| Título, año y calificación debajo del póster, siempre visibles | Feedback del profesor |
| Las acciones siguen en el overlay sobre el póster | Criterio propio: mantiene el póster limpio y las acciones a mano |
| Calificación personal con estrellas (en lugar de «4/5» con una sola estrella) | Criterio propio: mismo lenguaje visual que el detalle |
| Si el título no tiene calificación personal, no se muestran estrellas `[SUPUESTO]` | Criterio propio: estrellas vacías se leerían como «calificada con 0» |
| Si no hay año (tarjetas de mi lista, D-12), la línea muestra solo lo disponible | Decisión aceptada en D-12 |
| Título cortado a 2 líneas con puntos suspensivos | Criterio propio: las tarjetas de una fila quedan alineadas |
| Toda la tarjeta (póster e información) sigue siendo un solo enlace al detalle | Criterio propio: conserva teclado, clic medio y «abrir en pestaña» |
| El esqueleto de carga reserva también el espacio de la información | Criterio propio: evita saltos de layout al terminar de cargar |

**Criterios de aceptación**
- [ ] DADO una fila o la grilla de búsqueda, CUANDO se carga, ENTONCES cada tarjeta muestra su título debajo del póster sin interacción.
- [ ] DADO un resultado de búsqueda con año, CUANDO se muestra, ENTONCES se ve el año debajo del título.
- [ ] DADO un título de mi lista con calificación personal, CUANDO se muestra su tarjeta, ENTONCES se ven estrellas con esa calificación.
- [ ] DADO un título sin calificación personal, CUANDO se muestra su tarjeta, ENTONCES no aparecen estrellas.
- [ ] DADO un título muy largo, CUANDO se muestra, ENTONCES ocupa como máximo dos líneas y las tarjetas de la fila quedan alineadas.
- [ ] DADO una tarjeta, CUANDO el usuario pasa el mouse o la enfoca con teclado, ENTONCES aparecen las acciones sobre el póster.
- [ ] DADO una pantalla táctil, CUANDO se muestra la tarjeta, ENTONCES las acciones están visibles sin hover.
- [ ] DADO una tarjeta, CUANDO el usuario hace click en el póster o en el título, ENTONCES navega al detalle.

**Definition of Done**
- Criterios verificados en el navegador (escritorio y ancho de celular).
- `npm run build` y `npm run lint` sin errores; sin `any`.
- Sin colores ni tamaños sueltos: solo tokens de `:root`.

**Dependencias:** ninguna.

### Actualización 2026-11-11 — el título ya no reserva dos líneas

Decisión de Milo al revisar las tarjetas en el navegador: el título deja de reservar siempre el alto de dos líneas (`min-height` en `.card__title`). Se mantiene el máximo de dos líneas con puntos suspensivos.

| Decisión | Origen |
| --- | --- |
| Un título de una línea ocupa solo una línea; el bloque de información de esa tarjeta es más bajo | Criterio propio: la reserva dejaba un hueco vacío bajo la mayoría de los títulos |
| El «alineadas» del criterio de títulos largos pasa a referirse a los pósters: siguen alineados arriba y con el mismo alto; la información debajo ya no tiene el mismo alto en todas | Consecuencia de la decisión anterior |

- [ ] DADO un título de una sola línea, CUANDO se muestra su tarjeta, ENTONCES el bloque de información no reserva el espacio de una segunda línea.
- [ ] DADO una fila con títulos de una y de dos líneas, CUANDO se muestra, ENTONCES los pósters quedan alineados arriba y con el mismo alto.

---

## E1-D02 — Selector de estado en lugar del botón de avanzar

**Tipo:** Mejora (UI/UX + regla de dominio) · **Prioridad:** Alta · **Deuda:** D-02

**Historia de usuario**
> Como usuario, quiero elegir directamente el estado de una película (pendiente, en progreso o vista), para corregirlo cuando me equivoco o cuando vuelvo a verla.

**Descripción**
El botón que avanza el estado se reemplaza por un selector (`<select>` nativo) con los tres estados. Se elimina la regla de avance lineal: cualquier estado puede pasar a cualquier otro, y un título que no está en la lista se puede agregar directamente en cualquier estado. El mismo selector se usa en las tarjetas y en el detalle. Eliminar sigue siendo un botón aparte.

| Decisión | Origen |
| --- | --- |
| Transición libre entre los tres estados | Feedback del profesor |
| Se elimina `siguienteEstado` del dominio, porque ya no hay orden que verificar | Consecuencia de la decisión anterior |
| Agregar directamente en cualquier estado (por ejemplo, «vista» al registrar algo que ya vi) | Criterio propio |
| `<select>` nativo, con estilo alineado al resto de la página (color del estado, mismo radio y tipografía) | Criterio propio: accesible por teclado y lector de pantalla, abre el selector del sistema en el celular y no lo recorta el `overflow` de la tarjeta |
| Sin el título en la lista, el selector muestra «Agregar a…» como opción inicial | Criterio propio |
| Elegir el estado actual no hace ninguna petición | Criterio propio |
| «Quitar de mi lista» no es una opción del selector; sigue como botón aparte | Criterio propio: una acción destructiva no se mezcla con un cambio de estado |
| El selector se deshabilita mientras hay una petición en curso para ese título | Mantiene el comportamiento actual de `busy` |

**Criterios de aceptación**
- [ ] DADO un título que no está en mi lista, CUANDO elijo cualquiera de los tres estados, ENTONCES se agrega a mi lista con ese estado.
- [ ] DADO un título en «vista», CUANDO elijo «en progreso» o «pendiente», ENTONCES su estado cambia y la tarjeta pasa a la fila correspondiente.
- [ ] DADO un título en cualquier estado, CUANDO elijo el estado que ya tiene, ENTONCES no ocurre ningún cambio.
- [ ] DADO un cambio de estado en curso, CUANDO espero la respuesta, ENTONCES el selector de ese título no se puede usar.
- [ ] DADO el detalle de un título, CUANDO cambio el estado con su selector, ENTONCES se comporta igual que en las tarjetas.
- [ ] DADO el detalle mientras la lista aún carga, CUANDO intento cambiar el estado, ENTONCES el selector está deshabilitado.
- [ ] DADO el selector, CUANDO lo uso solo con teclado, ENTONCES puedo enfocarlo, abrirlo y elegir un estado.
- [ ] DADO un título con calificación y comentario, CUANDO cambio su estado, ENTONCES conserva su calificación y su comentario.

**Definition of Done**
- Criterios verificados en el navegador.
- No queda código muerto del flujo lineal (`siguienteEstado`, etiquetas de «pasar a…», variante botón de la pill si queda sin uso).
- `npm run build` y `npm run lint` sin errores; sin `any`.

**Dependencias:** E1-D01 (el selector vive en el overlay rediseñado de la tarjeta).

### Actualización 2026-11-11 — el selector pasa solo al detalle; las tarjetas alternan «+» y papelera

Todo lo anterior se conserva como registro de lo que se construyó y se probó. Al verlo funcionando se decidió simplificar las tarjetas, así que esta actualización **reemplaza lo anterior solo en las tarjetas del inicio y de la búsqueda**. En el detalle el selector sigue exactamente igual.

| Decisión | Origen |
| --- | --- |
| El selector de estado deja de estar en las tarjetas (inicio y búsqueda); sigue en el detalle | Pedido de Milo |
| Una tarjeta de un título fuera de mi lista muestra un botón «+» que lo agrega como «por ver»: así aparece en «Agregadas recientemente» y en «Pendientes» | Pedido de Milo |
| Una tarjeta de un título de mi lista muestra solo la papelera. El «+» y la papelera ocupan el mismo lugar (arriba a la derecha) y uno reemplaza al otro | Pedido de Milo |
| Cambiar el estado de un título ya agregado se hace en el detalle | Consecuencia: conserva lo que pidió el profesor (volver de «vista» a «viendo») |
| Ambos botones son de ícono (`.icon-btn`, `Plus` y `Trash2`) con nombre accesible que nombra el título | Criterio propio: son acciones rápidas sobre el póster (`DESIGN.md` §4) |
| El snackbar sigue confirmando: «“Dune” agregada a Pendientes» y «“Dune” quitada de tu lista» | Mantiene E1-D03 |
| Quitar desde la tarjeta sigue sin pedir confirmación | Sin cambios |

**Criterios de aceptación de la actualización.** Se suman a los anteriores. Los de selector en tarjetas (primeros ocho) siguen vigentes solo para el selector del **detalle**; en las tarjetas los reemplazan estos.

- [ ] DADO una tarjeta de un título que no está en mi lista, en el inicio o en la búsqueda, CUANDO la veo, ENTONCES tiene un botón «+» y no tiene selector de estado.
- [ ] DADO esa tarjeta, CUANDO pulso «+», ENTONCES el título se agrega como «por ver», aparece en «Agregadas recientemente» y en «Pendientes», y la tarjeta pasa a mostrar la papelera.
- [ ] DADO una tarjeta de un título de mi lista, CUANDO la veo, ENTONCES tiene solo la papelera: ni «+» ni selector.
- [ ] DADO esa tarjeta, CUANDO pulso la papelera, ENTONCES el título se quita de mi lista y, si la tarjeta sigue a la vista (búsqueda), vuelve a mostrar «+».
- [ ] DADO una acción en curso sobre un título, CUANDO espero la respuesta, ENTONCES el botón de esa tarjeta no se puede usar.
- [ ] DADO el detalle de un título, CUANDO lo abro, ENTONCES conserva el selector de estado con los tres estados.

**Definition of Done de la actualización**
- El selector de la tarjeta (su variante `tarjeta` y las reglas `.card__estado`) no queda como código muerto: se elimina.
- Criterios comprobados en el navegador.
- `npm run build` y `npm run lint` sin errores; sin `any`.

---

## E1-D03 — Snackbar de notificaciones

**Tipo:** Mejora (UI/UX) · **Prioridad:** Alta · **Deuda:** D-03, D-09

**Historia de usuario**
> Como usuario, quiero un mensaje breve cuando agrego, cambio de estado o quito un título, para confirmar que la acción se guardó sin tener que buscar el cambio en la pantalla.

**Descripción**
Un snackbar (aviso flotante en la parte inferior de la pantalla) reutilizable por cualquier parte de la app mediante un servicio de notificaciones. Esta versión lo usa para confirmar las acciones sobre la lista y para mostrar sus errores.

| Decisión | Origen |
| --- | --- |
| Mensaje de confirmación al agregar | Feedback del profesor |
| También al cambiar de estado y al quitar de la lista | Criterio propio: misma respuesta para toda acción sobre la lista |
| Mensajes que nombran el título y el destino: «“Dune” agregada a Pendientes», «“Dune” movida a Vistas», «“Dune” quitada de tu lista» | Criterio propio |
| Componente genérico con API `notificar({ tipo, mensaje })`, tipos `exito` y `error` | Pedido de Milo: reutilizable para otras funciones (por ejemplo, E2) |
| Los errores de acción sobre la lista pasan del aviso arriba de la página al snackbar | Criterio propio (D-09): el aviso de arriba no se ve si el usuario está abajo en una fila |
| Un solo aviso a la vez; uno nuevo reemplaza al anterior | Criterio propio: evita una pila de avisos tras varias acciones seguidas |
| Se cierra solo a los pocos segundos y tiene botón de cerrar | Criterio propio |
| Abajo al centro en escritorio; en celular ocupa el ancho con margen lateral | Pedido de Milo: responsivo |
| Anunciado a lectores de pantalla (`status` para éxito, `alert` para error) | Criterio propio: accesibilidad |

**Criterios de aceptación**
- [ ] DADO un título que no está en mi lista, CUANDO lo agrego con un estado, ENTONCES aparece un aviso que nombra el título y la lista a la que fue.
- [ ] DADO un título de mi lista, CUANDO cambio su estado, ENTONCES aparece un aviso que nombra el título y el nuevo estado.
- [ ] DADO un título de mi lista, CUANDO lo quito, ENTONCES aparece un aviso que confirma que se quitó.
- [ ] DADO una acción sobre la lista que falla, CUANDO llega el error, ENTONCES aparece un aviso de error, distinto visualmente del de éxito.
- [ ] DADO un aviso visible, CUANDO hago otra acción, ENTONCES el aviso nuevo reemplaza al anterior.
- [ ] DADO un aviso visible, CUANDO pasan unos segundos o presiono cerrar, ENTONCES desaparece.
- [ ] DADO un ancho de celular, CUANDO aparece un aviso, ENTONCES se ve completo, sin scroll horizontal, sin tapar el header.
- [ ] DADO un lector de pantalla, CUANDO aparece un aviso, ENTONCES se anuncia su texto.

**Definition of Done**
- Criterios verificados en el navegador (escritorio y ancho de celular).
- El servicio de notificaciones no depende de la lista: cualquier pantalla puede usarlo.
- Respeta `prefers-reduced-motion` en su animación de entrada.
- `npm run build` y `npm run lint` sin errores; sin `any`.

**Dependencias:** E1-D02 (los mensajes usan el estado elegido en el selector).

---

## E1-D04 — Navegación de filas con flechas

**Tipo:** Mejora (UI/UX) · **Prioridad:** Media · **Deuda:** D-04

**Historia de usuario**
> Como usuario, quiero botones de flecha para recorrer cada fila del inicio, para navegarlas sin depender de una barra de scroll.

**Descripción**
Las filas del inicio ocultan la barra de scroll horizontal y muestran dos botones (anterior y siguiente) **encima de las tarjetas**, en los bordes izquierdo y derecho de la fila, con el mismo estilo `icon-btn` e íconos de lucide. El desplazamiento táctil y con trackpad sigue funcionando. La grilla de búsqueda no cambia.

| Decisión | Origen |
| --- | --- |
| Ocultar la barra de scroll y navegar con flechas | Criterio propio |
| Flechas sobre los bordes de la fila, encima de las tarjetas | Pedido de Milo: consistente con las apps de streaming |
| Centradas en la altura del póster, no de la tarjeta completa | Criterio propio: la información de abajo (E1-D01) no las descentra |
| En escritorio aparecen al pasar el mouse por la fila o al enfocarlas con teclado | Criterio propio: mismo patrón de aparición que las acciones de la tarjeta |
| En pantallas táctiles no se muestran; se navega deslizando | Criterio propio: el gesto ya es natural y las flechas taparían pósters que se tocan |
| Cada click avanza casi un ancho visible de la fila, con desplazamiento suave | Criterio propio |
| La flecha de un extremo se oculta al llegar a ese extremo | Criterio propio: una flecha deshabilitada encima de un póster solo estorba |
| Si todas las tarjetas caben, no se muestran flechas | Criterio propio |
| Desplazamiento instantáneo con `prefers-reduced-motion` | Criterio propio: accesibilidad |

**Criterios de aceptación**
- [ ] DADO una fila con más tarjetas de las que caben, CUANDO se muestra, ENTONCES no se ve barra de scroll.
- [ ] DADO una fila desplazable en escritorio, CUANDO paso el mouse sobre ella, ENTONCES aparecen las flechas sobre los bordes, a media altura del póster.
- [ ] DADO una fila al inicio de su recorrido, CUANDO se muestran las flechas, ENTONCES solo aparece «siguiente».
- [ ] DADO una fila, CUANDO presiono «siguiente», ENTONCES la fila avanza y se ven tarjetas nuevas.
- [ ] DADO una fila en su extremo final, CUANDO llego ahí, ENTONCES solo aparece «anterior».
- [ ] DADO una fila cuyas tarjetas caben completas, CUANDO paso el mouse, ENTONCES no aparecen flechas.
- [ ] DADO una pantalla táctil, CUANDO deslizo la fila con el dedo, ENTONCES se desplaza y no hay flechas encima de los pósters.
- [ ] DADO el teclado, CUANDO llego con Tab a una flecha y presiono Enter, ENTONCES la fila se desplaza; cada flecha tiene un nombre accesible.
- [ ] DADO las flechas visibles, CUANDO hago click en una, ENTONCES la fila se desplaza y no se abre el detalle de la tarjeta de abajo.
- [ ] DADO un cambio de tamaño de la ventana, CUANDO termina, ENTONCES las flechas se actualizan según la nueva posición y el nuevo ancho.

**Definition of Done**
- Criterios verificados en el navegador (escritorio y ancho de celular).
- La lógica de desplazamiento vive en un hook, no en el componente de la fila.
- `npm run build` y `npm run lint` sin errores; sin `any`.

**Dependencias:** E1-D01 (las flechas se centran en el póster de la tarjeta rediseñada).

### Actualización 2026-11-11 — el foco no se pierde al llegar al extremo

Hallazgo de la prueba en un navegador real: como la flecha del extremo se **omite** (no se deshabilita), con el teclado la flecha que tenía el foco desaparecía al llegar al final y el foco se perdía (pasaba al `body`), dejando a la persona sin dónde continuar. Lo anterior se conserva; se agrega:

| Decisión | Origen |
| --- | --- |
| Si la flecha que tiene el foco desaparece porque se llegó a ese extremo, el foco pasa a la flecha contraria | Hallazgo de la prueba; patrón habitual en carruseles |
| Solo se mueve el foco si se perdió (quedó en el `body`): si la persona ya se fue a otro control, no se le quita | Criterio propio |

- [ ] DADO el teclado, CUANDO uso una flecha hasta llegar al extremo de la fila, ENTONCES el foco pasa a la flecha contraria y no se pierde.

### Actualización 2026-11-11 (2) — la fila vuelve al inicio cuando llega una tarjeta nueva

Pedido de Milo: al agregar un título, entra primero en «Agregadas recientemente»; si la fila estaba desplazada, la tarjeta nueva quedaba fuera de la vista. Se agrega:

| Decisión | Origen |
| --- | --- |
| Cuando aparece una tarjeta **nueva** al principio de una fila, la fila vuelve al inicio (con desplazamiento suave, o inmediato con `prefers-reduced-motion`) | Pedido de Milo |
| Una tarjeta es «nueva» si la primera de ahora no estaba antes en la fila. Si la primera cambia porque se quitó la que estaba, o porque se reordenó, no hay nada nuevo que mostrar y la fila no se mueve | Criterio propio: evita saltos que nadie pidió |
| Vale para todas las filas, no solo «Agregadas recientemente»: es la que más lo necesita porque lo nuevo entra siempre al principio | Criterio propio: una sola regla, sin casos especiales |

- [ ] DADO la fila «Agregadas recientemente» desplazada, CUANDO agrego un título nuevo, ENTONCES la fila vuelve al inicio y se ve la tarjeta nueva.
- [ ] DADO una fila desplazada, CUANDO se quita una tarjeta, ENTONCES la fila no vuelve al inicio.

---

## E1-D05 — Escala tipográfica centralizada

**Tipo:** Refactor (estilos) · **Prioridad:** Media · **Deuda:** D-13

**Historia de usuario**
> Como desarrollador, quiero que todos los tamaños de fuente salgan de una escala definida por dos variables, para ajustar la tipografía de toda la app desde un solo lugar y mantenerla consistente.

**Descripción**
Hoy `index.css` tiene 25 declaraciones `font-size` con 9 valores sueltos distintos. Se reemplazan por una escala modular: dos variables raíz y pasos derivados de ellas con `calc()`. Los componentes solo usan los pasos; nunca un valor literal.

```
--font-base: 0.875rem    tamaño del texto de interfaz (el más usado hoy)
--font-ratio: 1.2        cuánto crece cada paso

--fs-sm   = base / ratio      ≈ 0.73rem   meta, etiquetas chicas
--fs-base = base              = 0.875rem  texto de interfaz
--fs-md   = base × ratio      ≈ 1.05rem   subtítulos, créditos
--fs-lg   = md × ratio        ≈ 1.26rem
--fs-xl   = lg × ratio        ≈ 1.51rem
--fs-2xl  = xl × ratio        ≈ 1.81rem
--fs-3xl  = 2xl × ratio       ≈ 2.18rem
--fs-4xl  = 3xl × ratio       ≈ 2.61rem
```

Equivalencias con los valores actuales:

| Hoy | Paso | Diferencia |
| --- | --- | --- |
| 0.75rem | `--fs-sm` | −0.3 px |
| 0.8125rem (título de tarjeta) | `--fs-base` | +1 px, se lee mejor debajo del póster |
| 0.875rem | `--fs-base` | igual |
| 1.0625rem, 1.125rem | `--fs-md` | −0.2 px y −1.2 px |
| 1.75rem | `--fs-2xl` | +1 px |
| `clamp(1.25rem, 3vw, 1.75rem)` | `clamp(var(--fs-lg), 3vw, var(--fs-2xl))` | ≈ igual |
| `clamp(1.5rem, 4vw, 2.25rem)` | `clamp(var(--fs-xl), 4vw, var(--fs-3xl))` | ≈ igual |
| `clamp(1.75rem, 4vw, 2.75rem)` | `clamp(var(--fs-2xl), 4vw, var(--fs-4xl))` | −2 px en el máximo |

| Decisión | Origen |
| --- | --- |
| Dos variables raíz (`--font-base`, `--font-ratio`) controlan toda la escala | Pedido de Milo |
| Pasos con nombre (`--fs-*`) en lugar de calcular en cada regla | Criterio propio: las reglas siguen siendo legibles y el valor se cambia en un solo lugar |
| Prefijo `--fs-` y no `--text-` | Criterio propio: `--text`, `--text-strong` y `--text-soft` ya son tokens de color |
| Ratio 1.2 con base 0.875rem | Criterio propio: es la combinación que más se acerca a los tamaños actuales (diferencias de 2 px o menos) |
| `calc()` encadenado y no `pow()` | Criterio propio: soporte más amplio en navegadores |
| Los tamaños de íconos y estrellas (props de lucide) quedan fuera | Criterio propio: son medidas de ícono, no de texto |

**Criterios de aceptación**
- [ ] DADO `index.css`, CUANDO se busca `font-size`, ENTONCES fuera de `:root` todas las declaraciones usan un paso `--fs-*` (directo o dentro de `clamp()`).
- [ ] DADO un cambio de `--font-base` o `--font-ratio`, CUANDO se recarga la app, ENTONCES todos los textos cambian de tamaño en proporción.
- [ ] DADO cualquier pantalla, CUANDO se compara con la versión anterior, ENTONCES la jerarquía visual (h1 > h2 > texto > meta) se mantiene.

**Definition of Done**
- Criterios verificados en el navegador en las cuatro pantallas.
- `npm run build` y `npm run lint` sin errores.
- La escala queda lista para documentarse en `DESIGN.md`.

**Dependencias:** ninguna.

---

## Notas

**Orden recomendado:** E1-D05 → E1-D01 → E1-D02 → E1-D03 → E1-D04.

| Ticket | Depende de | Motivo |
| --- | --- | --- |
| E1-D05 | — | Va primero para que los componentes nuevos (selector, snackbar, flechas) nazcan usando la escala |
| E1-D01 | — | Cambia la estructura de la tarjeta sobre la que se apoyan los demás |
| E1-D02 | E1-D01 | El selector va en el overlay rediseñado |
| E1-D03 | E1-D02 | Los mensajes nombran el estado elegido |
| E1-D04 | E1-D01 | Independiente en lógica; se hace al final para ajustar al alto final de la tarjeta |

- Un commit por ticket, con el id en el mensaje, después del commit de este documento.
- El README (capturas y descripción del overlay, «Enregable 3») se actualiza al cierre del entregable.
- Fuera de alcance de estos tickets: D-05, D-06, D-10, D-11 (siguen pendientes en `ESTADO-INICIAL.md`).
