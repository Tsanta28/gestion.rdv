import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'

function IconBtn({ title, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Colonne d'actions reutilisable : Voir / Modifier / Activer-Desactiver / Supprimer.
 * Ne rend que les boutons dont le handler correspondant est fourni.
 */
export default function ActionButtons({ onView, onEdit, onToggle, isActive, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {onView && (
        <IconBtn title="Voir détails" onClick={onView} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Eye size={16} />
        </IconBtn>
      )}
      {onEdit && (
        <IconBtn title="Modifier" onClick={onEdit} className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30">
          <Pencil size={16} />
        </IconBtn>
      )}
      {onToggle && (
        <IconBtn
          title={isActive ? 'Désactiver' : 'Activer'}
          onClick={onToggle}
          className={isActive ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
        >
          {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </IconBtn>
      )}
      {onDelete && (
        <IconBtn title="Supprimer" onClick={onDelete} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
          <Trash2 size={16} />
        </IconBtn>
      )}
    </div>
  )
}
