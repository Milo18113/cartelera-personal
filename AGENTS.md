# AGENTS.md — Mi Cartelera Personal

React 19 + TypeScript + Vite · Supabase (Auth y Postgres con RLS) · TMDB · CSS propio · Vitest

## Regla principal
- **Ninguna funcionalidad sin spec.** Antes de codear, el cambio tiene historia, criterios y lugar en `docs/specs/`. Si falta, se escribe primero y se espera la aprobación del usuario.
- Orden de trabajo y de commits: harness → estado inicial → PRD → backlog → specs → código → verificación. Cada documento va antes del código que lo implementa.
- Un ticket por commit, con su id en el mensaje.

## Claves y secretos
- La API key de TMDB y las claves de Supabase viven solo en variables de entorno (`.env`, ignorado por git). `.env.example` lleva los nombres, nunca los valores.
- Jamás la clave `service_role` en el frontend. Jamás claves en código, docs, commits o mensajes.
- No leer ni mostrar `.env` ni `dbpass.txt`.

## Arquitectura
- `src/domain/`: tipos y reglas de negocio puras. Sin React, red ni Supabase. Es lo que prueba Vitest.
- `src/infrastructure/`: único lugar que habla con Supabase y TMDB.
- `src/hooks/`, `src/lista/`, `src/auth/`: orquestan estado y acciones.
- `src/components/`, `src/pages/`: presentación. No llaman a Supabase ni a TMDB.

## Código
- TypeScript sin `any` (tampoco implícito). `async/await` sobre `.then()`. Solo componentes funcionales con hooks.
- Estilos: CSS propio en `src/index.css`, solo con tokens de `:root` (ver `DESIGN.md`). Sin librerías de estilos nuevas.
- Íconos de `lucide-react` con `ICON_PROPS`.
- Los comentarios explican el porqué y no se borran. Tocar solo lo necesario, sin refactors ajenos.

## Comandos
- `npm run dev` · `npm run build` (typecheck + build) · `npm run lint` · `npm test` (Vitest)

## Git
- Los commits los hace el agente siguiendo `.claude/skills/commit/SKILL.md`, sin esperar a que el usuario escriba `/commit`. Nunca hace push: es siempre manual.
