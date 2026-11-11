// Hook PostToolUse (Edit|Write): formatea con Prettier el archivo que el agente acaba de tocar.
// Claude Code entrega los datos de la herramienta por stdin como JSON.
//
// Nunca bloquea al agente: si Prettier falla (por ejemplo, un error de sintaxis a mitad de una
// edición) avisa por stderr y sale con 0. Con --ignore-unknown, los tipos de archivo que Prettier
// no conoce (.sql, .png) pasan sin tocarse; .prettierignore excluye el resto (*.md, lockfile).
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

const proyecto = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd())

let entrada = ''
for await (const trozo of process.stdin) entrada += trozo

let archivo
try {
  archivo = JSON.parse(entrada)?.tool_input?.file_path
} catch (error) {
  // Entrada que no es JSON: no es una llamada de herramienta que sepamos formatear.
  process.stderr.write(`format.mjs: stdin inválido (${error.message})\n`)
  process.exit(0)
}
if (typeof archivo !== 'string') process.exit(0)

const absoluto = isAbsolute(archivo) ? archivo : resolve(proyecto, archivo)
const relativo = relative(proyecto, absoluto)
// Un archivo fuera del repositorio no es nuestro para formatear.
if (relativo.startsWith('..') || isAbsolute(relativo)) process.exit(0)
if (!existsSync(absoluto)) process.exit(0)

// Se invoca el binario de Prettier con el mismo Node que corre el hook: evita npx.cmd y los
// problemas de shell entre Git Bash y PowerShell en Windows.
const prettier = join(proyecto, 'node_modules', 'prettier', 'bin', 'prettier.cjs')
if (!existsSync(prettier)) {
  process.stderr.write('format.mjs: Prettier no está instalado (npm install)\n')
  process.exit(0)
}

const resultado = spawnSync(process.execPath, [prettier, '--write', '--ignore-unknown', absoluto], {
  cwd: proyecto,
  encoding: 'utf8',
})
if (resultado.status !== 0) {
  process.stderr.write(`format.mjs: Prettier falló en ${relativo}\n${resultado.stderr}`)
}
process.exit(0)
