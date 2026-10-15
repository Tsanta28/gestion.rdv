export const STATUT_STYLES = {
  demande_envoyee: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  en_attente: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  proposition_envoyee: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  confirme: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  refuse: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  annule: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  termine: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}
export const STATUT_LABELS = {
  demande_envoyee: 'Demande envoyée',
  en_attente: 'En attente',
  proposition_envoyee: 'Proposition envoyée',
  confirme: 'Confirmé',
  refuse: 'Refusé',
  annule: 'Annulé',
  termine: 'Terminé',
}

export default function AppointmentCard({ rdv, children, highlighted = false }) {
  const date = new Date(rdv.date_heure)
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
      highlighted ? 'border-primary-400 ring-2 ring-primary-200 dark:ring-primary-900' : 'border-gray-100 dark:border-gray-800'
    }`}>
      <div>
        <p className="font-medium">
          {rdv.docteur?.user ? `Dr. ${rdv.docteur.user.last_name}` : ''}
          {rdv.patient?.user ? ` — ${rdv.patient.user.first_name} ${rdv.patient.user.last_name}` : ''}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          {' · '}{rdv.duree} min
        </p>
        {rdv.motif && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{rdv.motif}</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUT_STYLES[rdv.statut]}`}>
          {STATUT_LABELS[rdv.statut]}
        </span>
        {children}
      </div>
    </div>
  )
}
