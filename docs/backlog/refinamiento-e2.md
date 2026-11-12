# Refinamiento de E2 con la IA

Ejercicio de «poke-holes» sobre el [PRD](../prd/PRD.md): la IA propone casos borde que el PRD no resolvía y el autor decide cada uno. Todo caso se **acepta** (entra como criterio de una historia) o se **rechaza** con una razón escrita; ninguno queda sin decidir.

- **Fecha:** 2026-11-10
- **Cómo se leyó:** los casos se agrupan por tema. «Dónde queda» apunta al criterio de [`historias-e2.md`](historias-e2.md), a una regla del PRD o a la spec.

## Tiempo disponible

| # | Caso borde propuesto | Decisión | Razón | Dónde queda |
| --- | --- | --- | --- | --- |
| RF-01 | Tiempo exacto en los extremos: 30 y 600 | Aceptado | Son los límites de la regla; un error de «menor que» contra «menor o igual» se esconde ahí. | HU-01-C1, RN-02 |
| RF-02 | Tiempo justo fuera del rango: 29 y 601 | Aceptado | Es el otro lado del límite. | HU-01-C2 |
| RF-03 | Tiempo vacío, con decimales o con texto | Aceptado | La regla pide un entero; hay que decir qué pasa con lo que no lo es. | HU-01-C3 |
| RF-04 | Tiempo con ceros a la izquierda («090») | Rechazado | El campo numérico lo normaliza a 90; no cambia ninguna regla ni ningún resultado. | — |
| RF-05 | Cambiar el tiempo disponible cuando ya hay una sesión armada que deja de caber | Aceptado | Si se borra la sesión se pierde trabajo; si se acepta, se rompe la regla. Se conserva, se indica cuánto se pasa y no se guarda hasta corregir. | HU-02-C8 |

## Duración y películas candidatas

| # | Caso borde propuesto | Decisión | Razón | Dónde queda |
| --- | --- | --- | --- | --- |
| RF-06 | Película cuya duración es exactamente el tiempo disponible | Aceptado | Es el caso del límite exacto (RN-06) con una sola película y sin pausa. | HU-01-C5, HU-02-C2 |
| RF-07 | Película más larga que el tiempo disponible | Aceptado | No cabe ni sola, así que no se ofrece (SUP-03). Ofrecerla solo para rechazarla ensucia la lista. | HU-01-C5 |
| RF-08 | Película con duración 0 o ausente en TMDB | Aceptado | Una duración de 0 minutos rompería las cuentas. Se trata como «sin duración conocida» (SUP-08). | HU-01-C6, HU-02-C9 |
| RF-09 | La lista «por ver» está vacía | Aceptado | Es un estado distinto de «ninguna cabe»: la acción que la persona necesita es otra (agregar películas). | HU-01-C10 |
| RF-10 | Hay películas por ver, pero ninguna cabe | Aceptado | La persona necesita saber que el problema es el tiempo, no su lista. | HU-01-C11 |
| RF-11 | La consulta de duraciones falla por conexión | Aceptado | No es lo mismo que «sin duración»: la primera se resuelve reintentando (SUP-09). | HU-01-C9 |
| RF-12 | La consulta falla solo para algunas películas | Aceptado | Se muestran las que se pudieron consultar y las demás quedan con el error y la opción de reintentar. Bloquear toda la pantalla por una película es peor. | HU-01-C9 |
| RF-13 | La lista «por ver» es muy grande (cientos de películas) | Aceptado | Es un riesgo de rendimiento, no de comportamiento. Cómo se consulta en lotes se decide en la spec (PA-03). | Spec |
| RF-14 | Una serie en estado «por ver» | Rechazado | Las series son no-alcance (RN-03). Se filtran y no aparecen. | HU-01-C4 |
| RF-15 | Orden de las que caben | Aceptado | Sin una regla, el orden cambiaría entre visitas. Más antigua primero, desempate por título (DEC-02). | HU-01-C7 |

## Armar la sesión

| # | Caso borde propuesto | Decisión | Razón | Dónde queda |
| --- | --- | --- | --- | --- |
| RF-16 | Sesión de una sola película: ¿lleva pausa? | Aceptado | Es el caso donde se suele sumar una pausa de más. Pausas = películas − 1 (RN-05). | HU-02-C2 |
| RF-17 | Sesión que ocupa exactamente el tiempo disponible | Aceptado | Es RN-06 sobre varias películas. | HU-02-C5 |
| RF-18 | Película que no cabe en lo que queda, aunque sí cabe sola | Aceptado | Es el caso central de «armar»: se rechaza con explicación y diciendo cuántos minutos faltan (PA-02). | HU-02-C4 |
| RF-19 | Quitar una película del medio de la sesión | Aceptado | Hay que recalcular las pausas, no solo restar la duración. | HU-02-C6 |
| RF-20 | Agregar dos veces la misma película a una sesión | Aceptado | No tiene sentido ver la misma película dos veces seguidas en una noche (SUP-02). | HU-02-C7 |
| RF-21 | Reordenar las películas dentro de la sesión | Rechazado | No cambia la duración total ni ninguna regla; es una mejora cómoda, no necesaria. Queda el orden en que se agregan (SUP-05). | — |
| RF-22 | La lista cambia mientras armo (por ejemplo, en otra pestaña paso una película a «vista») | Rechazado | La pantalla lee la lista al abrirse y no se sincroniza entre pestañas; sincronizar es otra funcionalidad. Al guardar, la sesión conserva lo que se armó (RN-10). | — |
| RF-23 | Cerrar sesión o recargar con una sesión armada sin guardar | Rechazado | Guardar borradores es una funcionalidad aparte. Lo armado y no guardado se pierde, y la pantalla ya ofrece guardar. | — |

## Guardar y consultar

| # | Caso borde propuesto | Decisión | Razón | Dónde queda |
| --- | --- | --- | --- | --- |
| RF-24 | Guardar una sesión vacía | Aceptado | No hay nada que guardar (SUP-01). | HU-03-C2 |
| RF-25 | Nombre con solo espacios | Aceptado | Se trata como vacío para usar el nombre por defecto. | HU-03-C5 |
| RF-26 | Nombre de más de 60 caracteres | Aceptado | El límite de SUP-06 hay que hacerlo cumplir y explicarlo. | HU-03-C4 |
| RF-27 | Nombre con símbolos, emojis o texto con forma de código | Aceptado | Debe verse como se escribió y nunca interpretarse. | HU-03-C11 |
| RF-28 | Dos sesiones con el mismo nombre | Rechazado | SUP-06 lo permite: el nombre es una etiqueta, no una clave. Impedirlo obliga a inventar un mensaje de conflicto sin ganar nada. | — |
| RF-29 | Doble clic en «Guardar» | Aceptado | Sin protección se duplicaría la sesión. | HU-03-C10 |
| RF-30 | Falla el guardado | Aceptado | La persona no debe perder lo que armó por un fallo de conexión. | HU-03-C9 |
| RF-31 | Misma película en dos sesiones guardadas | Aceptado | Es DEC-01. | HU-03-C7 |
| RF-32 | Quitar de mi lista una película que está en una sesión guardada | Aceptado | Es DEC-04: la sesión no cambia. | HU-04-C4 |
| RF-33 | Cambiar de estado una película de una sesión guardada | Aceptado | Misma razón que RF-32: la sesión es un plan histórico. | HU-04-C5 |
| RF-34 | Editar o eliminar una sesión guardada | Rechazado | Es DEC-03. Se arma una nueva si el plan cambia. | HU-04-C6 |
| RF-35 | Programar la sesión para una fecha y hora | Rechazado | Es un recordatorio, y los recordatorios son no-alcance. | — |
| RF-36 | Límite de sesiones guardadas o de películas por sesión | Rechazado | SUP-07: el tiempo disponible ya limita el tamaño de una sesión y ninguna regla pide un tope. | — |
| RF-37 | Nombre por defecto y zona horaria | Aceptado | «Noche del 11 de nov» usa el día local de la persona, no el del servidor (SUP-06). | HU-03-C5 |

## Privacidad

| # | Caso borde propuesto | Decisión | Razón | Dónde queda |
| --- | --- | --- | --- | --- |
| RF-38 | Una persona abre por su dirección la sesión de otra | Aceptado | La privacidad no puede depender de que la pantalla no muestre el enlace. | HU-05-C3 |
| RF-39 | Una persona intenta modificar o eliminar una sesión ajena sin usar la pantalla | Aceptado | La protección debe estar en los datos, no solo en la interfaz. | HU-05-C4 |
| RF-40 | Una persona intenta guardar una sesión a nombre de otra | Aceptado | Es la falsificación del dueño. | HU-05-C5 |
| RF-41 | Intentar leer o guardar sin haber iniciado sesión | Aceptado | RN-01 vale también fuera de la pantalla. | HU-05-C1, HU-05-C6 |

## Resumen

- **Casos propuestos:** 41.
- **Aceptados:** 32. Entran como criterios de HU-01 a HU-05, o pasan a la spec (RF-13).
- **Rechazados:** 9 (RF-04, RF-14, RF-21, RF-22, RF-23, RF-28, RF-34, RF-35, RF-36), cada uno con su razón.
- **Efecto en el PRD:** ninguno. Los casos aceptados usan decisiones y supuestos ya escritos (DEC-01 a DEC-05, SUP-01 a SUP-09). PA-01 queda resuelto con este documento.
