import { useState, type FormEvent } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { ICON_PROPS } from './iconos'

interface SearchBarProps {
  // Texto con el que arranca el input (la búsqueda actual de la URL, si hay).
  inicial: string
}

export function SearchBar({ inicial }: SearchBarProps) {
  const [texto, setTexto] = useState(inicial)
  const navigate = useNavigate()

  // La búsqueda vive en la URL (/buscar?q=...): se puede compartir y el botón atrás funciona.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = texto.trim()
    if (!q) return
    navigate({ pathname: '/buscar', search: createSearchParams({ q }).toString() })
  }

  return (
    <form role="search" className="searchbar" onSubmit={handleSubmit}>
      <Search {...ICON_PROPS} aria-hidden="true" />
      <input
        type="search"
        aria-label="Buscar películas y series"
        placeholder="Buscar películas y series…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
    </form>
  )
}
