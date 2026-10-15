import { useEffect, useRef, useState } from 'react'
import { Stethoscope, ChevronDown, Check } from 'lucide-react'
import { SPECIALITES } from '../utils/specialites'

/**
 * Combo/select recherchable pour la specialite d'un docteur.
 * Si "Autre" est choisi, un champ libre apparait (value reste la saisie libre).
 */
export default function SpecialtyCombobox({ value, onChange, placeholder = 'Sélectionner une spécialité' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customMode, setCustomMode] = useState(value && !SPECIALITES.includes(value))
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = SPECIALITES.filter((s) => s.toLowerCase().includes(search.toLowerCase()))

  function select(spec) {
    if (spec === 'Autre') {
      setCustomMode(true)
      onChange('')
    } else {
      setCustomMode(false)
      onChange(spec)
    }
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Stethoscope size={16} className="text-primary-500 shrink-0" />
        <span className={`flex-1 truncate ${value ? '' : 'text-gray-400'}`}>
          {customMode ? (value || 'Spécialité personnalisée') : (value || placeholder)}
        </span>
        <ChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-transparent focus:outline-none text-sm"
          />
          <ul className="max-h-56 overflow-y-auto text-sm">
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => select(s)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                >
                  {s}
                  {value === s && <Check size={14} className="text-primary-600" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-2 text-gray-400">Aucun résultat</li>}
          </ul>
        </div>
      )}

      {customMode && (
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Précisez la spécialité"
          className="mt-2 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      )}
    </div>
  )
}
