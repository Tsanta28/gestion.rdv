import Modal from './Modal'

const STATUT_LABELS = {
  demande_envoyee: 'Demande envoyée', en_attente: 'En attente', proposition_envoyee: 'Proposition envoyée',
  confirme: 'Confirmé', refuse: 'Refusé', annule: 'Annulé', termine: 'Terminé',
}

export default function AppointmentDetailModal({ rdv, onClose, children }) {
  return (
    <Modal open={!!rdv} onClose={onClose} title="Détails du rendez-vous">
      {rdv && (
        <>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400">Patient</dt><dd>{rdv.patient?.user?.first_name} {rdv.patient?.user?.last_name}</dd></div>
            <div><dt className="text-gray-400">Docteur</dt><dd>Dr. {rdv.docteur?.user?.first_name} {rdv.docteur?.user?.last_name} ({rdv.docteur?.specialite})</dd></div>
            <div><dt className="text-gray-400">Date</dt><dd>{new Date(rdv.date_heure).toLocaleString('fr-FR')}</dd></div>
            <div><dt className="text-gray-400">Durée</dt><dd>{rdv.duree} min</dd></div>
            <div><dt className="text-gray-400">Motif</dt><dd>{rdv.motif || '—'}</dd></div>
            <div><dt className="text-gray-400">Statut</dt><dd>{STATUT_LABELS[rdv.statut]}</dd></div>
            {rdv.notes_docteur && <div><dt className="text-gray-400">Notes du docteur</dt><dd>{rdv.notes_docteur}</dd></div>}
          </dl>
          {children}
        </>
      )}
    </Modal>
  )
}
