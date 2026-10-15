/**
 * Prueba de Row Level Security contra el proyecto real de Supabase.
 *
 * Demuestra que RLS protege los datos en la base de datos y no solo en el frontend:
 * habla directo con la API REST (sin pasar por la UI) usando el token de cada usuario.
 *
 * Crea dos usuarios de prueba, intenta leer/editar/borrar/falsificar filas ajenas y
 * limpia sus propias filas al terminar. Los usuarios quedan en auth.users (ver el final).
 *
 * Requisitos: "Confirm email" desactivado (si no, el registro no devuelve sesión) y
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.
 *
 * Uso, desde la raíz del proyecto:
 *   node --experimental-strip-types scripts/test-rls.ts
 */
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

interface Respuesta {
  status: number
  json: unknown
}

interface Sesion {
  email: string
  userId: string
  token: string
}

interface Fila {
  id: number
  user_id: string
  comentario: string | null
}

interface Resultado {
  nombre: string
  ok: boolean
  detalle: string
}

// --- Configuración -------------------------------------------------------------------

function leerEnv(): Record<string, string> {
  const texto = readFileSync(new URL('../.env', import.meta.url), 'utf-8')
  const env: Record<string, string> = {}
  for (const linea of texto.split(/\r?\n/)) {
    const limpia = linea.trim()
    if (!limpia || limpia.startsWith('#')) continue
    const igual = limpia.indexOf('=')
    if (igual === -1) continue
    env[limpia.slice(0, igual).trim()] = limpia.slice(igual + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = leerEnv()
// Se acepta la URL con "/rest/v1/" al final por si se copió del endpoint REST.
const BASE = (env.VITE_SUPABASE_URL ?? '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const KEY = env.VITE_SUPABASE_ANON_KEY ?? ''

if (!BASE || !KEY) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env')
  process.exit(1)
}

// --- Cliente HTTP mínimo -------------------------------------------------------------

// Sin token se envía solo `apikey` (petición anónima). La publishable key no es un JWT,
// por eso nunca se manda como Bearer: solo el token del usuario va en Authorization.
async function api(
  metodo: string,
  ruta: string,
  opciones: { token?: string; cuerpo?: unknown } = {},
): Promise<Respuesta> {
  const headers: Record<string, string> = {
    apikey: KEY,
    'Content-Type': 'application/json',
    // Hace que PATCH/DELETE devuelvan las filas afectadas: [] significa "RLS no me dejó tocar nada".
    Prefer: 'return=representation',
  }
  if (opciones.token) headers.Authorization = `Bearer ${opciones.token}`

  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers,
    body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
  })

  return { status: respuesta.status, json: parsear(await respuesta.text()) }
}

// Las respuestas de error de la API a veces no son JSON: en ese caso se devuelve el texto.
function parsear(texto: string): unknown {
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err
    return texto
  }
}

function filas(json: unknown): Fila[] {
  return Array.isArray(json) ? (json as Fila[]) : []
}

function mensajeDeError(json: unknown): string {
  const mensaje = (json as { message?: string } | null)?.message
  return mensaje ?? JSON.stringify(json)
}

// --- Usuarios de prueba --------------------------------------------------------------

async function registrar(etiqueta: string): Promise<Sesion> {
  const email = `rls-test-${etiqueta}-${Date.now()}@example.com`
  const password = `Rls-${randomBytes(8).toString('hex')}`

  const { status, json } = await api('POST', '/auth/v1/signup', { cuerpo: { email, password } })
  if (status >= 400) throw new Error(`No se pudo registrar a ${etiqueta}: ${mensajeDeError(json)}`)

  const datos = json as { access_token?: string; user?: { id: string } } | null
  if (!datos?.access_token || !datos.user) {
    throw new Error(
      'El registro no devolvió sesión: desactiva "Confirm email" en ' +
        'Authentication → Sign In / Providers → Email y vuelve a correr el script.',
    )
  }
  return { email, userId: datos.user.id, token: datos.access_token }
}

// --- Verificaciones ------------------------------------------------------------------

const resultados: Resultado[] = []

function verificar(nombre: string, ok: boolean, detalle: string): void {
  resultados.push({ nombre, ok, detalle })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nombre}\n        ${detalle}`)
}

async function main(): Promise<void> {
  const a = await registrar('a')
  const b = await registrar('b')
  console.log(`Usuario A: ${a.email}\nUsuario B: ${b.email}\n`)

  const nuevaFila = (titulo: string, comentario: string) => ({
    tmdb_id: 680,
    titulo,
    tipo_contenido: 'pelicula',
    estado: 'por_ver',
    comentario,
  })

  let filaA: Fila | undefined
  let filaB: Fila | undefined

  try {
    // 0. Cada usuario puede crear su propia fila (user_id llega por default auth.uid()).
    const insertA = await api('POST', '/rest/v1/mi_lista', {
      token: a.token,
      cuerpo: nuevaFila('RLS test A', 'original de A'),
    })
    filaA = filas(insertA.json)[0]
    verificar(
      'A inserta su propia fila',
      insertA.status === 201 && filaA?.user_id === a.userId,
      `HTTP ${insertA.status}`,
    )

    const insertB = await api('POST', '/rest/v1/mi_lista', {
      token: b.token,
      cuerpo: nuevaFila('RLS test B', 'original de B'),
    })
    filaB = filas(insertB.json)[0]
    verificar(
      'B inserta su propia fila',
      insertB.status === 201 && filaB?.user_id === b.userId,
      `HTTP ${insertB.status}`,
    )

    if (!filaA || !filaB) throw new Error('No se pudieron crear las filas base; no se puede seguir.')

    // 1. Lectura
    const anonimo = await api('GET', '/rest/v1/mi_lista?select=*')
    verificar(
      'Sin sesión no se ve ninguna fila',
      filas(anonimo.json).length === 0,
      `HTTP ${anonimo.status}, ${filas(anonimo.json).length} filas`,
    )

    const listaB = await api('GET', '/rest/v1/mi_lista?select=*', { token: b.token })
    const soloDeB = filas(listaB.json).every((f) => f.user_id === b.userId)
    verificar(
      'B solo ve sus propias filas',
      soloDeB && filas(listaB.json).length === 1,
      `${filas(listaB.json).length} fila(s) visibles para B`,
    )

    const lecturaDirecta = await api('GET', `/rest/v1/mi_lista?id=eq.${filaA.id}`, { token: b.token })
    verificar(
      'B no puede leer la fila de A pidiéndola por id',
      filas(lecturaDirecta.json).length === 0,
      `${filas(lecturaDirecta.json).length} filas devueltas`,
    )

    // 2. Edición
    const editar = await api('PATCH', `/rest/v1/mi_lista?id=eq.${filaA.id}`, {
      token: b.token,
      cuerpo: { comentario: 'hackeado por B' },
    })
    verificar(
      'B no puede editar la fila de A',
      filas(editar.json).length === 0,
      `${filas(editar.json).length} filas afectadas`,
    )

    // 3. Borrado
    const borrar = await api('DELETE', `/rest/v1/mi_lista?id=eq.${filaA.id}`, { token: b.token })
    verificar(
      'B no puede borrar la fila de A',
      filas(borrar.json).length === 0,
      `${filas(borrar.json).length} filas afectadas`,
    )

    // La prueba que cierra el círculo: A sigue viendo su fila intacta.
    const releerA = await api('GET', `/rest/v1/mi_lista?id=eq.${filaA.id}`, { token: a.token })
    const intacta = filas(releerA.json)[0]
    verificar(
      'La fila de A sigue intacta (existe y su comentario no cambió)',
      intacta?.comentario === 'original de A',
      `comentario actual: "${intacta?.comentario ?? '(fila inexistente)'}"`,
    )

    // 4. Falsificación de dueño
    const falsificar = await api('POST', '/rest/v1/mi_lista', {
      token: b.token,
      cuerpo: { ...nuevaFila('Falsa', 'x'), tmdb_id: 1, user_id: a.userId },
    })
    verificar(
      'B no puede insertar una fila a nombre de A',
      falsificar.status >= 400,
      `HTTP ${falsificar.status}: ${mensajeDeError(falsificar.json)}`,
    )

    const reasignar = await api('PATCH', `/rest/v1/mi_lista?id=eq.${filaB.id}`, {
      token: b.token,
      cuerpo: { user_id: a.userId },
    })
    verificar(
      'B no puede reasignar su propia fila a A',
      reasignar.status >= 400,
      `HTTP ${reasignar.status}: ${mensajeDeError(reasignar.json)}`,
    )

    const insertarAnonimo = await api('POST', '/rest/v1/mi_lista', {
      cuerpo: { ...nuevaFila('Anónima', 'x'), tmdb_id: 2, user_id: a.userId },
    })
    verificar(
      'Sin sesión no se puede insertar',
      insertarAnonimo.status >= 400,
      `HTTP ${insertarAnonimo.status}: ${mensajeDeError(insertarAnonimo.json)}`,
    )

    // 5. Contraste: cada dueño sí puede editar lo suyo (descarta que todo falle por error de config).
    const editarPropia = await api('PATCH', `/rest/v1/mi_lista?id=eq.${filaA.id}`, {
      token: a.token,
      cuerpo: { comentario: 'editado por su dueño' },
    })
    verificar(
      'A sí puede editar su propia fila',
      filas(editarPropia.json)[0]?.comentario === 'editado por su dueño',
      `HTTP ${editarPropia.status}`,
    )
  } finally {
    // Limpieza: cada usuario borra lo suyo con su propio token (RLS lo permite).
    if (filaA) await api('DELETE', `/rest/v1/mi_lista?id=eq.${filaA.id}`, { token: a.token })
    if (filaB) await api('DELETE', `/rest/v1/mi_lista?id=eq.${filaB.id}`, { token: b.token })
  }

  const fallos = resultados.filter((r) => !r.ok)
  console.log(`\n${resultados.length - fallos.length}/${resultados.length} verificaciones correctas.`)
  console.log(
    '\nLos usuarios de prueba siguen en auth.users. Para borrarlos (SQL Editor):\n' +
      "  delete from auth.users where email like 'rls-test-%@example.com';",
  )
  process.exitCode = fallos.length === 0 ? 0 : 1
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
