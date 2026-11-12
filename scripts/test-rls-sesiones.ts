/**
 * Prueba de seguridad de «Noche de película» contra el proyecto real de Supabase.
 *
 * Hermano de scripts/test-rls.ts (que no se modifica): habla directo con la API REST, sin pasar
 * por la interfaz, con el token de dos usuarios de prueba. Demuestra que las sesiones guardadas
 * están protegidas en la base de datos y no solo en el frontend (HU-05), que son de solo lectura
 * (DEC-03) y que guardar es atómico.
 *
 * Como las sesiones no se pueden eliminar (ni siquiera sus dueños), el script NO puede limpiar
 * lo que crea. Al terminar imprime el SQL que borra a los usuarios de prueba: sus sesiones caen
 * por cascada.
 *
 * Requisitos: haber aplicado docs/migrations/001_sesiones.sql, tener "Confirm email" desactivado
 * (si no, el registro no devuelve sesión) y VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.
 *
 * Uso, desde la raíz del proyecto:
 *   node --experimental-strip-types scripts/test-rls-sesiones.ts
 */
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'

interface Respuesta {
  status: number
  json: unknown
}

interface Usuario {
  email: string
  userId: string
  token: string
}

interface PeliculaFila {
  tmdb_id: number
  titulo: string
  orden: number
}

interface SesionFila {
  id: number
  nombre: string
  sesion_peliculas?: PeliculaFila[]
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
    env[limpia.slice(0, igual).trim()] = limpia
      .slice(igual + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
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

function sesiones(json: unknown): SesionFila[] {
  return Array.isArray(json) ? (json as SesionFila[]) : []
}

function mensajeDeError(json: unknown): string {
  const mensaje = (json as { message?: string } | null)?.message
  return mensaje ?? JSON.stringify(json)
}

// --- Datos y atajos ------------------------------------------------------------------

const pelicula = (tmdbId: number, titulo: string, minutos: number) => ({
  tmdb_id: tmdbId,
  titulo,
  poster_url: null,
  duracion_min: minutos,
})

// guardar_sesion devuelve el id de la sesión como un número JSON.
function guardar(
  usuario: Usuario | null,
  nombre: string,
  tiempo: number,
  peliculas: unknown[],
): Promise<Respuesta> {
  return api('POST', '/rest/v1/rpc/guardar_sesion', {
    token: usuario?.token,
    cuerpo: { p_nombre: nombre, p_tiempo_disponible: tiempo, p_peliculas: peliculas },
  })
}

function idDe(respuesta: Respuesta): number | undefined {
  return typeof respuesta.json === 'number' ? respuesta.json : undefined
}

async function contarSesiones(usuario: Usuario): Promise<number> {
  const { json } = await api('GET', '/rest/v1/sesiones?select=id', { token: usuario.token })
  return sesiones(json).length
}

// --- Usuarios de prueba --------------------------------------------------------------

async function registrar(etiqueta: string): Promise<Usuario> {
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

// Una operación denegada puede verse de dos formas: un error HTTP (4xx) o un éxito que no
// afectó ninguna fila. Las dos significan «no me dejó»; lo que importa es lo segundo de cada
// verificación: que el dato original sigue intacto.
function denegada(respuesta: Respuesta): boolean {
  return respuesta.status >= 400 || sesiones(respuesta.json).length === 0
}

// Antes de crear usuarios se comprueba que la migración esté aplicada: si no, el script
// dejaría cuentas de prueba sin usar.
async function migracionAplicada(): Promise<boolean> {
  const { status } = await api('GET', '/rest/v1/sesiones?select=id&limit=1')
  // Con la tabla creada una petición anónima da 200 (sin filas) o un error de permisos; sin la
  // tabla, PostgREST responde 404.
  return status !== 404
}

async function main(): Promise<void> {
  if (!(await migracionAplicada())) {
    console.error(
      'La tabla sesiones no existe en este proyecto de Supabase.\n' +
        'Aplica primero docs/migrations/001_sesiones.sql (SQL Editor → New query → pegar → Run).',
    )
    process.exit(1)
  }

  const a = await registrar('a')
  const b = await registrar('b')
  console.log(`Usuario A: ${a.email}\nUsuario B: ${b.email}\n`)

  // 1 y 2. Cada persona guarda su sesión con la función guardar_sesion.
  const guardarA = await guardar(a, 'Noche de A', 120, [pelicula(1, 'Uno', 100)])
  const idA = idDe(guardarA)
  verificar(
    'A guarda su sesión',
    guardarA.status === 200 && idA !== undefined,
    `HTTP ${guardarA.status}, id=${idA}`,
  )

  const guardarB = await guardar(b, 'Noche de B', 200, [
    pelicula(2, 'Dos', 90),
    pelicula(3, 'Tres', 100),
  ])
  const idB = idDe(guardarB)
  verificar(
    'B guarda su sesión',
    guardarB.status === 200 && idB !== undefined,
    `HTTP ${guardarB.status}, id=${idB}`,
  )

  if (idA === undefined || idB === undefined) {
    throw new Error('No se pudieron crear las sesiones de prueba: no se puede seguir.')
  }

  // 3 y 4. Sin sesión iniciada no se guarda ni se ve nada.
  const anonimoGuarda = await guardar(null, 'x', 60, [pelicula(9, 'X', 90)])
  verificar(
    'Sin sesión, guardar_sesion es rechazada',
    anonimoGuarda.status >= 400 && idDe(anonimoGuarda) === undefined,
    `HTTP ${anonimoGuarda.status}: ${mensajeDeError(anonimoGuarda.json)}`,
  )

  const anonimoLee = await api('GET', '/rest/v1/sesiones?select=id')
  verificar(
    'Sin sesión no se ve ninguna sesión',
    anonimoLee.status >= 400 || sesiones(anonimoLee.json).length === 0,
    `HTTP ${anonimoLee.status}, ${sesiones(anonimoLee.json).length} filas`,
  )

  // 5. Cada quien ve únicamente lo suyo, con sus películas.
  const lecturaA = await api(
    'GET',
    '/rest/v1/sesiones?select=id,nombre,sesion_peliculas(tmdb_id,titulo,orden)',
    {
      token: a.token,
    },
  )
  const filasA = sesiones(lecturaA.json)
  verificar(
    'A solo ve su sesión, con sus películas',
    filasA.length === 1 && filasA[0].id === idA && filasA[0].sesion_peliculas?.length === 1,
    `${filasA.length} sesión(es) visibles para A`,
  )

  // 6 y 7. B no puede leer lo de A, ni por id ni por las películas.
  const bLeeAjena = await api('GET', `/rest/v1/sesiones?id=eq.${idA}`, { token: b.token })
  verificar(
    'B no ve la sesión de A pidiéndola por id',
    bLeeAjena.status === 200 && sesiones(bLeeAjena.json).length === 0,
    `HTTP ${bLeeAjena.status}, ${sesiones(bLeeAjena.json).length} filas`,
  )

  const bLeePeliculas = await api('GET', `/rest/v1/sesion_peliculas?sesion_id=eq.${idA}`, {
    token: b.token,
  })
  verificar(
    'B no ve las películas de la sesión de A',
    bLeePeliculas.status === 200 && sesiones(bLeePeliculas.json).length === 0,
    `HTTP ${bLeePeliculas.status}, ${sesiones(bLeePeliculas.json).length} filas`,
  )

  // 8 y 9. B no puede modificar ni eliminar la sesión de A.
  const bModifica = await api('PATCH', `/rest/v1/sesiones?id=eq.${idA}`, {
    token: b.token,
    cuerpo: { nombre: 'hackeada por B' },
  })
  verificar('B no puede modificar la sesión de A', denegada(bModifica), `HTTP ${bModifica.status}`)

  const bElimina = await api('DELETE', `/rest/v1/sesiones?id=eq.${idA}`, { token: b.token })
  verificar('B no puede eliminar la sesión de A', denegada(bElimina), `HTTP ${bElimina.status}`)

  // 10. Ni siquiera el dueño puede modificar o eliminar su sesión: son de solo lectura (DEC-03).
  const aModifica = await api('PATCH', `/rest/v1/sesiones?id=eq.${idA}`, {
    token: a.token,
    cuerpo: { nombre: 'cambiada por su dueña' },
  })
  verificar(
    'A tampoco puede modificar su propia sesión (solo lectura)',
    denegada(aModifica),
    `HTTP ${aModifica.status}`,
  )

  const aElimina = await api('DELETE', `/rest/v1/sesiones?id=eq.${idA}`, { token: a.token })
  verificar(
    'A tampoco puede eliminar su propia sesión (solo lectura)',
    denegada(aElimina),
    `HTTP ${aElimina.status}`,
  )

  const aModificaPeliculas = await api('PATCH', `/rest/v1/sesion_peliculas?sesion_id=eq.${idA}`, {
    token: a.token,
    cuerpo: { titulo: 'cambiada' },
  })
  verificar(
    'Las películas de una sesión guardada tampoco se modifican',
    denegada(aModificaPeliculas),
    `HTTP ${aModificaPeliculas.status}`,
  )

  const intactaA = await api(
    'GET',
    `/rest/v1/sesiones?id=eq.${idA}&select=id,nombre,sesion_peliculas(tmdb_id,titulo,orden)`,
    {
      token: a.token,
    },
  )
  const intacta = sesiones(intactaA.json)[0]
  verificar(
    'La sesión de A sigue intacta (existe, mismo nombre y misma película)',
    intacta?.nombre === 'Noche de A' && intacta.sesion_peliculas?.[0]?.titulo === 'Uno',
    `nombre actual: "${intacta?.nombre}"`,
  )

  // 11 y 12. B no puede falsificar al dueño.
  const bFalsificaSesion = await api('POST', '/rest/v1/sesiones', {
    token: b.token,
    cuerpo: { user_id: a.userId, nombre: 'a nombre de A', tiempo_disponible: 60 },
  })
  verificar(
    'B no puede insertar una sesión a nombre de A',
    bFalsificaSesion.status >= 400,
    `HTTP ${bFalsificaSesion.status}: ${mensajeDeError(bFalsificaSesion.json)}`,
  )

  const bColaPelicula = await api('POST', '/rest/v1/sesion_peliculas', {
    token: b.token,
    cuerpo: { sesion_id: idA, tmdb_id: 77, titulo: 'Colada', duracion_min: 90, orden: 9 },
  })
  verificar(
    'B no puede insertar películas en la sesión de A',
    bColaPelicula.status >= 400,
    `HTTP ${bColaPelicula.status}: ${mensajeDeError(bColaPelicula.json)}`,
  )

  // 13. Guardar es atómico: una película repetida falla y no deja una sesión a medias.
  const antes = await contarSesiones(a)
  const repetida = await guardar(a, 'Repetida', 300, [
    pelicula(5, 'Cinco', 90),
    pelicula(5, 'Cinco otra vez', 90),
  ])
  const despues = await contarSesiones(a)
  verificar(
    'Una película repetida falla y no deja una sesión a medias',
    repetida.status >= 400 && despues === antes,
    `HTTP ${repetida.status}, sesiones de A: ${antes} antes y ${despues} después`,
  )

  // 14. Los límites se hacen cumplir en la base, no solo en la interfaz.
  const invalidos: [string, Promise<Respuesta>][] = [
    ['nombre vacío', guardar(a, '', 120, [pelicula(6, 'Seis', 90)])],
    ['nombre de 61 caracteres', guardar(a, 'x'.repeat(61), 120, [pelicula(6, 'Seis', 90)])],
    ['tiempo de 29 minutos', guardar(a, 'ok', 29, [pelicula(6, 'Seis', 90)])],
    ['tiempo de 601 minutos', guardar(a, 'ok', 601, [pelicula(6, 'Seis', 90)])],
    ['duración de 0 minutos', guardar(a, 'ok', 120, [pelicula(6, 'Seis', 0)])],
    ['sesión sin películas', guardar(a, 'ok', 120, [])],
  ]
  for (const [nombre, promesa] of invalidos) {
    const respuesta = await promesa
    verificar(
      `Se rechaza: ${nombre}`,
      respuesta.status >= 400,
      `HTTP ${respuesta.status}: ${mensajeDeError(respuesta.json)}`,
    )
  }
  verificar(
    'Los intentos rechazados no dejaron nada guardado',
    (await contarSesiones(a)) === antes,
    `sesiones de A: ${await contarSesiones(a)}`,
  )

  // Contraste: los límites exactos sí se aceptan, y el orden de las películas se conserva.
  const limites = await guardar(a, 'x'.repeat(60), 30, [pelicula(7, 'Siete', 20)])
  verificar(
    'Se aceptan los límites exactos (nombre de 60, tiempo 30)',
    limites.status === 200,
    `HTTP ${limites.status}`,
  )

  const conOrden = await guardar(a, 'Con orden', 300, [
    pelicula(21, 'Primera', 60),
    pelicula(22, 'Segunda', 70),
    pelicula(23, 'Tercera', 80),
  ])
  const idOrden = idDe(conOrden)
  const lecturaOrden = await api(
    'GET',
    `/rest/v1/sesion_peliculas?sesion_id=eq.${idOrden}&select=titulo,orden&order=orden`,
    { token: a.token },
  )
  const ordenLeido = (Array.isArray(lecturaOrden.json) ? (lecturaOrden.json as PeliculaFila[]) : [])
    .map((fila) => `${fila.orden}:${fila.titulo}`)
    .join(',')
  verificar(
    'El orden en que se agregaron se guarda como 1, 2, 3',
    ordenLeido === '1:Primera,2:Segunda,3:Tercera',
    ordenLeido,
  )

  // Contraste: cada dueño sí ve y guarda lo suyo (descarta que todo falle por error de config).
  verificar(
    'B también ve únicamente la suya',
    (await contarSesiones(b)) === 1,
    `sesiones de B: ${await contarSesiones(b)}`,
  )

  const fallos = resultados.filter((r) => !r.ok)
  console.log(
    `\n${resultados.length - fallos.length}/${resultados.length} verificaciones correctas.`,
  )
  console.log(
    '\nLas sesiones no se pueden eliminar, así que este script no limpia lo que crea. Para borrar\n' +
      'los usuarios de prueba y, por cascada, sus sesiones (SQL Editor):\n' +
      "  delete from auth.users where email like 'rls-test-%@example.com';",
  )
  process.exitCode = fallos.length === 0 ? 0 : 1
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
