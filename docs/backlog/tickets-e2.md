# Tickets — E2 Noche de película

Cada ticket sale de una o más [historias](historias-e2.md) y se implementa **después** de que la spec (`docs/specs/`) lo describa. Un commit por ticket, con su id en el mensaje.

## Definition of Done común

Un ticket está terminado solo si, además de lo propio, cumple todo esto:

- Los criterios de las historias que cubre se cumplen y se comprueban.
- TypeScript sin `any`; `npm run build` y `npm run lint` sin errores.
- Los componentes no llaman a Supabase ni a TMDB: lo hacen los servicios.
- Ninguna clave en el código ni en el repositorio.
- La interfaz sigue [`DESIGN.md`](../../DESIGN.md) (criterios DS-01 a DS-12 que apliquen).
- Las funciones de E1 siguen funcionando igual.

Tipos: **Dominio** (regla pura), **Datos** (esquema y seguridad), **Infraestructura** (servicios), **UI** (pantallas), **Prueba** y **Documento**.

---

## E2-T01 — Regla de «cabe» y duración total

**Tipo:** Dominio · **Historias:** HU-01, HU-02 · **Dependencias:** ninguna

Funciones puras, sin red ni base de datos, que reciben el tiempo, las duraciones y la pausa: validar el tiempo disponible, calcular la duración total, decidir si una sesión cabe, calcular el tiempo restante y decidir si una película cabe en lo que queda (con los minutos que faltan o sobran). Incluye instalar y configurar Vitest.

**Definition of Done**
- Tests en verde de la regla, incluidos los bordes: sesión que ocupa exactamente el tiempo, una sola película (sin pausa), película sin duración, y tiempo fuera de rango (29, 30, 600, 601, no entero, vacío).
- Los ejemplos del PRD pasan: 90 + 100 + 120 con pausas es 330; 100 + 10 + 95 con 200 disponibles no cabe.
- El archivo no importa React, Supabase ni TMDB.
- `npm test` corre los tests y queda documentado en `AGENTS.md`.

## E2-T02 — Películas candidatas y su orden

**Tipo:** Dominio · **Historias:** HU-01 (C4 a C7, C10, C11) · **Dependencias:** T01

Función pura que, dada la lista de la persona y las duraciones conocidas, separa las películas que se ofrecen (por ver, película, con duración, que caben solas) de las no disponibles (con su motivo), y las ordena: la más antigua en la lista primero, desempate por título.

**Definition of Done**
- Tests: excluye series y otros estados; la duración igual al tiempo entra; 0 o ausente es «no disponible»; el orden y el desempate; distingue «lista vacía» de «ninguna cabe».

## E2-T03 — Esquema de sesiones y seguridad

**Tipo:** Datos · **Historias:** HU-03, HU-04, HU-05 · **Dependencias:** spec

Migración SQL con el modelo de sesiones y de las películas de cada sesión (que guardan título, duración y póster), y las políticas de seguridad por usuario.

**Definition of Done**
- Migración versionada en el repositorio y aplicada en Supabase.
- Seguridad por filas activada: cada persona solo lee y crea lo suyo.
- Sin política de modificar ni de eliminar (DEC-03).
- Nombre limitado a 60 caracteres y una película una sola vez por sesión, garantizados en la base.

## E2-T04 — Servicio de duración de películas

**Tipo:** Infraestructura · **Historias:** HU-01 · **Dependencias:** ninguna

Servicio que consulta a TMDB la duración de una película. Devuelve los minutos o «sin duración» (0 o ausente) y distingue un fallo de consulta, que se puede reintentar.

**Definition of Done**
- Soporta cancelar la petición y consultar varias películas con un límite de peticiones simultáneas (PA-03).
- El detalle de títulos de E1 sigue igual.
- Prueba del mapeo de duración: número, 0, ausente.

## E2-T05 — Servicio de sesiones

**Tipo:** Infraestructura · **Historias:** HU-03, HU-04 · **Dependencias:** T03

Servicio que guarda una sesión (nombre, tiempo disponible y películas), lista las sesiones de la persona de la más reciente a la más antigua y trae el detalle de una. No edita ni elimina.

**Definition of Done**
- Una sesión nunca queda guardada a medias: se guarda completa o no se guarda.
- Los errores llegan como mensajes legibles.
- Tipos propios del dominio, sin `any`.

## E2-T06 — Pantalla «Noche de película»: tiempo y películas que caben

**Tipo:** UI · **Historias:** HU-01, HU-05 (C1) · **Dependencias:** T01, T02, T04

Ruta protegida con enlace en el encabezado. Campo de tiempo con sus mensajes de validación, lista de películas que caben con su duración, no disponibles con su motivo, y estados de carga, error y vacío.

**Definition of Done**
- Criterios HU-01-C1 a C12 comprobados en el navegador.
- A 360 px de ancho no hay scroll horizontal (DS-07).
- Sin sesión iniciada, la ruta pide iniciar sesión.

## E2-T07 — Armar la sesión

**Tipo:** UI · **Historias:** HU-02 · **Dependencias:** T01, T06

Agregar y quitar películas con la duración total y el tiempo restante siempre visibles; rechazo con explicación cuando no caben; manejo del cambio de tiempo con una sesión armada.

**Definition of Done**
- Criterios HU-02-C1 a C10 comprobados en el navegador, incluido el ejemplo de 330 minutos.
- La interfaz solo muestra resultados de las funciones de T01; no repite cuentas.

## E2-T08 — Guardar la sesión

**Tipo:** UI · **Historias:** HU-03 · **Dependencias:** T05, T07

Campo de nombre, nombre por defecto, confirmación, error que conserva lo armado y protección contra doble envío.

**Definition of Done**
- Criterios HU-03-C1 a C11 comprobados en el navegador.
- Las películas guardadas siguen «por ver» en la lista de E1.

## E2-T09 — Sesiones guardadas: lista y detalle

**Tipo:** UI · **Historias:** HU-04 · **Dependencias:** T05

Pantalla con la lista de sesiones y pantalla de detalle, ambas protegidas, con estados de carga, error y vacío. Sin acciones de editar ni eliminar.

**Definition of Done**
- Criterios HU-04-C1 a C7 comprobados, incluida una sesión con una película que se quitó de la lista.

## E2-T10 — Prueba de seguridad con dos cuentas

**Tipo:** Prueba · **Historias:** HU-05 · **Dependencias:** T03

Extiende la prueba de RLS que ya existe en `scripts/test-rls.ts` para las sesiones: dos cuentas contra la API, sin pasar por la interfaz.

**Definition of Done**
- Comprueba HU-05-C2 a C6: la otra cuenta no ve, no abre por id, no modifica ni elimina, no guarda a nombre ajeno, y sin sesión no se lee ni se guarda.
- Incluye la comprobación contraria: cada dueño sí ve y guarda lo suyo.
- Limpia los datos que crea.
- La salida de la ejecución queda como evidencia.

## E2-T11 — Verificación en el navegador

**Tipo:** Documento · **Historias:** todas · **Dependencias:** T06 a T10

`docs/VERIFICACION.md`: cada criterio con los pasos para comprobarlo y la columna «resultado obtenido» que llena el estudiante. Incluye la lista de regresión de E1 de `docs/ESTADO-INICIAL.md`.

**Definition of Done**
- Todos los criterios de HU-01 a HU-05 tienen su fila y su resultado.
- La regresión de E1 está marcada.

## E2-T12 — Auditoría y cierre

**Tipo:** Documento · **Historias:** todas · **Dependencias:** T11

`docs/AUDITORIA.md` con cada criterio en «cumple», «no cumple» o «sin verificar» y su evidencia; lo que la auditoría encuentre se corrige de arriba hacia abajo o se registra como pendiente con su razón. Actualización del README.

**Definition of Done**
- Ningún criterio sin estado ni sin evidencia.
- README con la sección de la épica, cómo correr los tests y cómo está armado el harness.

---

## Notas

**Orden recomendado:** T01 → T02 → T04 → T03 → T05 → T06 → T07 → T08 → T09 → T10 → T11 → T12.

| Ticket | Depende de | Se puede hacer en paralelo con |
| --- | --- | --- |
| T01 | — | T03, T04 |
| T02 | T01 | T03, T04 |
| T03 | spec | T01, T02, T04 |
| T04 | — | T01, T02, T03 |
| T05 | T03 | T06 |
| T06 | T01, T02, T04 | T05 |
| T07 | T01, T06 | T05 |
| T08 | T05, T07 | T09 |
| T09 | T05 | T08 |
| T10 | T03 | T06 a T09 |
| T11 | T06 a T10 | — |
| T12 | T11 | — |

**Camino crítico:** T01 → T06 → T07 → T08 → T11 → T12.

**Riesgo:** T03 es el único que depende de aplicar algo en Supabase; conviene hacerlo temprano para descubrir problemas de permisos antes de la pantalla.

Los tickets de mejoras de E1 están aparte, en [`tickets-e1-mejoras-ui.md`](tickets-e1-mejoras-ui.md), y no bloquean ninguno de estos.
