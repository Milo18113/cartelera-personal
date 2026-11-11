---
name: commit
description: Crea un commit con lo pendiente del repositorio usando el formato del proyecto.
disable-model-invocation: true
argument-hint: '[id del ticket, ej. E2-T03]'
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

# /commit

Crea **un** commit con el trabajo pendiente. Nunca hace push.

## Pasos

1. Corre `git status --short`, `git diff` y `git diff --staged` para ver qué cambió, y `git log --oneline -5` para seguir el estilo de los mensajes.
2. Si hay secretos o archivos que no deben versionarse (`.env`, `dbpass.txt`, `*.zip`, claves), detente y avisa. No los agregues.
3. Si el diff mezcla documentos (`docs/`, `*.md`) con código (`src/`, `scripts/`), propón dividirlo en commits separados: el historial debe mostrar cada documento antes del código que lo implementa.
4. Agrega los archivos por nombre. Nunca `git add -A` ni `git add .`.
5. Escribe el mensaje en español con el formato `tipo(ticket): resumen en imperativo`.
   - Tipos: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`.
   - El ticket es `$ARGUMENTS` si el usuario lo dio; si el commit no es de un ticket, se omite el paréntesis.
   - Primera línea de 72 caracteres o menos. Si el porqué no es obvio, va en el cuerpo.
6. Termina el mensaje con la línea `Co-Authored-By` que indique el entorno.
7. Muestra el hash y la primera línea del commit. No hagas push, `--amend` ni `--no-verify`.

## Ejemplos

- `docs: PRD con las épicas E1 y E2`
- `feat(E2-T03): función pura que decide si una sesión cabe`
- `fix(E2-T05): validar el tiempo disponible entre 30 y 600 minutos`
