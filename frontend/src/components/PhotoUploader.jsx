import { useRef, useState } from 'react'
import { User, Upload, X } from 'lucide-react'

const MAX_SIZE = 2 * 1024 * 1024 // 2 Mo
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png']

export default function PhotoUploader({ value, onChange, name = '' }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value

  function validateAndSet(file) {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setError('Format non supporté (JPG ou PNG uniquement).')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Fichier trop volumineux (max 2 Mo).')
      return
    }
    setError('')
    onChange(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-2 border-dashed transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Aperçu" className="w-full h-full rounded-full object-cover" />
        ) : initials ? (
          <span className="text-lg font-semibold text-gray-400">{initials}</span>
        ) : (
          <User size={28} className="text-gray-300" />
        )}
        {previewUrl && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); setError('') }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow"
            title="Retirer la photo"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Upload size={14} /> Télécharger une photo
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG/PNG, 2 Mo max. Glisser-déposer possible.</p>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>
    </div>
  )
}
