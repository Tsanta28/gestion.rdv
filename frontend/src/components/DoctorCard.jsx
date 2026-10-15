import Avatar from './Avatar'

export default function DoctorCard({ docteur, children }) {
  const disponible = docteur.est_disponible !== false
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={docteur.photo} name={`${docteur.user.first_name} ${docteur.user.last_name}`} size="md" />
          <div className="min-w-0">
            <p className="font-medium truncate">Dr. {docteur.user.first_name} {docteur.user.last_name}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400">{docteur.specialite}</p>
          </div>
        </div>
        <span
          title={disponible ? 'Disponible' : 'Indisponible'}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
            disponible
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${disponible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {disponible ? 'Disponible' : 'Indisponible'}
        </span>
      </div>
      {docteur.disponibilite && <p className="text-xs text-gray-400 mt-3">{docteur.disponibilite}</p>}
      {docteur.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{docteur.description}</p>}
      {children}
    </div>
  )
}
