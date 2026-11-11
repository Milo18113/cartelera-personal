# Entregable 4 — Mi Cartelera: Noche de película

> **Vence:** 11 de noviembre de 2026, 23:59

## 1. Descripción general del proyecto

**Noche de película** es una funcionalidad nueva para Mi Cartelera Personal. El usuario indica cuánto tiempo tiene libre y la app le muestra qué películas de su lista «por ver» caben en ese tiempo. Con ellas arma una sesión y la guarda para después.

Cada estudiante la construye sobre su propio Proyecto 3, **sin reescribirlo**, siguiendo el proceso de los talleres de harness engineering y spec-driven development. Antes de escribir código nuevo, entiende y documenta lo que ya existe; después especifica la épica, la implementa por tickets con un agente de IA, la verifica y la audita.

En este proyecto el código no es el único entregable. Se evalúa también la cadena de documentos que lo justifica: PRD, historias, criterios, tickets, specs, sistema de diseño, verificación y auditoría. **El historial de git debe mostrar cada documento antes que el código que lo implementa.**

### 1.1 Objetivo de aprendizaje

Demostrar la capacidad de hacer evolucionar una aplicación existente con un agente de IA de forma controlada:

- Preparar el entorno del agente (harness) en un proyecto que no lo tenía.
- Documentar lo que ya existe antes de cambiarlo.
- Especificar un cambio con criterios verificables y decisiones del cliente registradas.
- Implementar por tickets, con la lógica de negocio en funciones puras y probadas.
- Aplicar un sistema de diseño coherente con lo que el proyecto ya usa.
- Verificar contra la spec y dejar constancia de lo que se cumplió y de lo que no.

### 1.2 Tecnologías requeridas

| Capa | Tecnología | Uso en el proyecto |
| --- | --- | --- |
| Base | Proyecto 3 (React + TypeScript + Vite) | Punto de partida; se evoluciona, no se reescribe |
| Agente | Claude Code | Implementación guiada por specs |
| Harness | `AGENTS.md`, `CLAUDE.md`, skill `/commit`, hook de formato con Prettier | Contexto y reglas del agente |
| API externa | TMDB, endpoint de detalle de película | Duración (runtime) de cada película |
| Base de datos | Supabase (PostgreSQL) con RLS | Sesiones guardadas por usuario |
| Tests | Vitest | Regla de negocio de la épica, sin base de datos |
| Estilos | Bootstrap (el del Proyecto 3), documentado en `DESIGN.md` | Sistema de diseño del proyecto |

### 1.3 La épica: ficha del cliente

Esta ficha es el punto de partida del PRD de la épica. **Tiene huecos a propósito:** encontrarlos con la IA y resolverlos es parte del proyecto.

#### Ficha de hechos — Noche de película (Mi Cartelera Personal)

- **Quién lo usa:** el mismo usuario de Mi Cartelera, con su cuenta y su lista.
- **Problema:** tiene muchas películas «por ver», pero cuando tiene un rato libre no sabe cuáles caben en ese tiempo. Empieza algo que no alcanza a terminar.
- **Qué quiere:** decir cuánto tiempo tiene, ver qué películas de su lista caben, armar una sesión con una o varias y guardarla para esa noche.
- **Regla del cliente:** una sesión cabe si la suma de las duraciones, más las pausas entre películas, no supera el tiempo disponible.
- **Éxito:** el usuario termina lo que empieza.
- **NO-alcance:**
  - Series.
  - Ver con amigos o compartir sesiones.
  - Recordatorios y notificaciones.
  - Sincronizar con plataformas de streaming o calendarios.
  - Recomendar películas que no están en su lista.

#### Decisiones del cliente ya tomadas

Van en «Reglas de negocio» del PRD.

| Tema | Decisión |
| --- | --- |
| Tiempo disponible | Número entero de minutos, entre 30 y 600 |
| Qué entra en una sesión | Solo películas de la lista del usuario en estado «por ver» |
| Pausas | 10 minutos entre una película y la siguiente; no hay pausa antes de la primera ni después de la última |
| Límite exacto | Una sesión que ocupa exactamente el tiempo disponible **sí** cabe |
| Duración | Se toma de TMDB. Una película sin duración conocida no se puede agregar, y la app explica por qué |
| Estado de los títulos | Guardar una sesión no cambia el estado de sus películas: siguen «por ver» |

#### Puntos que decide cada estudiante

Cada uno se resuelve en el PRD, como decisión justificada o como `[SUPUESTO]`, y se refleja en los criterios:

1. ¿Una película puede estar en dos sesiones guardadas?
2. ¿En qué orden se muestran las películas que caben?
3. ¿Se puede modificar una sesión después de guardarla?
4. Si el usuario elimina de su lista una película que está en una sesión guardada, ¿qué pasa con esa sesión?
5. ¿Una sesión tiene nombre o fecha?

Los casos borde que la IA proponga en el refinamiento (poke-holes) y no estén en esta lista **se deciden igual**: se aceptan o se rechazan con una razón escrita.

### 1.4 Requisitos obligatorios

#### A. Harness y punto de partida

- **Harness en el repositorio:**
  - `AGENTS.md` de 40 líneas o menos, con la regla «ninguna funcionalidad sin spec» y las reglas de claves.
  - `CLAUDE.md` que lo importe.
  - Skill `/commit` con `disable-model-invocation`.
  - Hook `PostToolUse` que formatee con Prettier.
- **Estado inicial:** `docs/ESTADO-INICIAL.md`, escrito con el agente en **plan mode**. Describe qué hace hoy el Proyecto 3, su stack, sus inconsistencias, sus riesgos y la deuda pendiente.
- **Nada se reescribe.** Las funciones del Proyecto 3 siguen funcionando igual al final del proyecto.

#### B. Especificación

- **PRD** en `docs/prd/`: el producto completo, con el Proyecto 3 como épica **E1** (ya construida) y Noche de película como épica **E2**. Incluye problema, usuarios, alcance, no-alcance, reglas de negocio, supuestos y puntos abiertos. Sin tablas, componentes ni librerías.
- **Backlog** en `docs/backlog/`:
  - Al menos 3 historias de E2 en formato «Como / quiero / para», que pasen INVEST.
  - Criterios DADO / CUANDO / ENTONCES sin detalle técnico.
  - Registro del refinamiento con la IA: cada caso borde propuesto, aceptado o rechazado con su razón.
  - Tickets con tipo, Definition of Done y dependencias.
- **Spec de la épica** en `docs/specs/`. Incluye:
  - El modelo de datos con su migración SQL y sus políticas RLS.
  - Las funciones puras del dominio.
  - Los servicios.
  - Los componentes.
  - Los criterios con DEBE / NO DEBE.
  - Una tabla criterio → verificación.
  - Una tabla ticket → archivos.
- **Sistema de diseño:**
  - `DESIGN.md` en la raíz, coherente con Bootstrap: cómo se personaliza, qué componentes se usan y qué está prohibido.
  - Su brand board en `docs/diseno/brand-board.html`.
  - Criterios de diseño verificables con id.
  - La spec de interfaz cita `DESIGN.md` por nombre, sin copiar valores.

#### C. Funcionalidad de la épica

- **Pantalla «Noche de película»**, accesible solo con sesión iniciada.
- **Tiempo disponible:** el usuario lo indica y la app lo valida según las decisiones del cliente.
- **Qué cabe:**
  - La app muestra las películas «por ver» que caben en ese tiempo, cada una con su duración.
  - Las que no tienen duración aparecen como no disponibles, con el motivo.
  - Mientras se consulta TMDB, hay estados de carga y de error.
- **Armar la sesión:**
  - El usuario agrega y quita películas, y ve en todo momento la duración total (pausas incluidas) y el tiempo restante.
  - Si una película no cabe en lo que queda, la app no la agrega y explica por qué.
- **Guardar y consultar:** la sesión se guarda en Supabase, y el usuario ve sus sesiones guardadas con su detalle.
- **Seguridad real:** políticas RLS que impiden que un usuario vea o modifique las sesiones de otro. Se demuestra con **dos cuentas**.

#### D. Calidad y verificación

- **La regla vive en el dominio.** El cálculo de «cabe» está en una función pura de `src/dominio/`, sin llamadas a red ni a Supabase, que recibe el tiempo, las duraciones y la pausa.
- **Tests con Vitest** de esa regla, incluidos los bordes:
  - Sesión que ocupa exactamente el tiempo.
  - Una sola película (sin pausa).
  - Película sin duración.
  - Tiempo fuera del rango permitido.
- **TypeScript sin `any`.** Los componentes no llaman a Supabase ni a TMDB; lo hacen los servicios.
- **Secretos:** la API key de TMDB y las claves de Supabase, solo en variables de entorno y nunca en el repositorio.
- **Verificación en el navegador:** `docs/VERIFICACION.md` de la épica, con la columna «resultado obtenido» llenada por el estudiante.
- **Auditoría:** `docs/AUDITORIA.md`, con cada criterio en estado «cumple», «no cumple» o «sin verificar», y su evidencia.
- **Historial:** commits que muestren el orden **harness → estado inicial → PRD → backlog → specs → código → verificación**.

### 1.5 Requisitos opcionales (puntos extra)

Cada opcional sigue el mismo proceso: su historia, sus criterios y su lugar en la spec, **antes del código**.

- **«Llenar mi noche»:** un botón que propone una combinación de películas que aprovecha el tiempo disponible, con su propia función pura y sus tests.
- **Filtro por género** al buscar qué cabe.
- **Marcar una sesión como realizada**, con sus películas pasando a «vista». Requiere documentar la decisión, porque contradice una regla actual.
- **Validación también en la base de datos**, para que una sesión que no cabe no se pueda guardar ni saltándose el frontend.
- **Revisión adversarial:** un subagente que revise cada cambio antes del commit.
- **App publicada** en GitHub Pages o Vercel, con un enlace funcional.

## 2. Guía paso a paso de entrega

El proyecto se entrega en el **mismo repositorio del Proyecto 3**. Hay tres checkpoints y una entrega final.

En cada checkpoint subes a D2L dos cosas: **el enlace al commit** y **una nota corta** con lo que completaste y lo que quedó pendiente. Los checkpoints sirven para recibir retroalimentación antes de seguir; lo que se corrige después de uno se corrige de arriba hacia abajo (documento primero, código después).

### Checkpoint 1 — Harness, estado inicial y diseño

**Objetivo:** que el agente entienda tu proyecto antes de tocarlo.

- [ ] `AGENTS.md`, `CLAUDE.md`, la skill `/commit` y el hook de formato, funcionando.
- [ ] `docs/ESTADO-INICIAL.md` escrito en plan mode, revisado y corregido por ti.
- [ ] La deuda heredada del Proyecto 3 registrada como lista de pendientes, sin corregirla todavía.
- [ ] `DESIGN.md` coherente con tu uso actual de Bootstrap, y su brand board en `docs/diseno/brand-board.html`.
- [ ] La app del Proyecto 3 sigue funcionando igual que antes.

### Checkpoint 2 — Especificación de la épica

**Objetivo:** que la épica esté completamente especificada antes de escribir una línea de su código.

- [ ] PRD con E1 (existente) y E2 (Noche de película), con los cinco puntos que decides resueltos y justificados.
- [ ] Historias, criterios DADO / CUANDO / ENTONCES y registro del refinamiento con la IA.
- [ ] Tickets con tipo, Definition of Done y dependencias.
- [ ] Spec de la épica con modelo de datos, RLS, funciones puras, componentes y las tablas criterio → verificación y ticket → archivos.
- [ ] **Ningún archivo de código de la épica en este commit.**

### Checkpoint 3 — Implementación

**Objetivo:** la épica construida ticket por ticket, siguiendo la spec.

- [ ] Función pura de «cabe» en `src/dominio/` con sus tests en verde, incluidos los bordes.
- [ ] Migración y políticas RLS aplicadas en Supabase.
- [ ] Servicios de Supabase y TMDB separados de los componentes.
- [ ] Pantalla «Noche de película» completa y fiel a `DESIGN.md`.
- [ ] `docs/VERIFICACION.md` con tus resultados en el navegador.
- [ ] Un commit por ticket, con el id del ticket en el mensaje.

### Entrega final

- [ ] `docs/AUDITORIA.md` con cada criterio auditado y su evidencia.
- [ ] Lo que la auditoría encontró, corregido de arriba hacia abajo, o registrado como pendiente con su razón.
- [ ] README actualizado con la sección de la épica, cómo correr los tests y cómo está armado el harness.

> **Vence el 11 de noviembre de 2026, 23:59**
