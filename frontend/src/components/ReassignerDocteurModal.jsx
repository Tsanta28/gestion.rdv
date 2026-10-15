import { useEffect, useState } from 'react'
import Modal from './Modal'
import { listDoctors } from '../services/doctorService'
import { reassignerDocteur } from '../services/appointmentService'
import { useToast } from './Toast'

/** La secretaire propose un autre docteur (et optionnellement une autre date/heure) pour une demande en attente. */
export default function ReassignerDocteurModal({ rdv, onClose, onDone }) {
  const [doctors, setDoctors] = useState([])
  const [docteurId, setDocteurId] = useState('')
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()

  useEffect(() => {
    if (rdv) {
      listDoctors().then((data) => setDoctors((data.results ?? data).filter((d) => d.id !== rdv.docteur?.id)))
      setDocteurId('')
      setDate('')
      setHeure('')
    }
  }, [rdv])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!docteurId) {
      push('Sélectionnez un docteur.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const dateHeure = date && heure ? `${date}T${heure}:00` : undefined
      await reassignerDocteur(rdv.id, docteurId, dateHeure)
      push('Rendez-vous réassigné à un autre docteur ✅', 'success')
      onDone()
    } catch {
      push('Erreur lors de la réassignation.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={!!rdv} onClose={onClose} title="Proposer un autre docteur">
      {rdv && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pour {rdv.patient?.user?.first_name} {rdv.patient?.user?.last_name} — le rendez-vous repartira en attente de validation auprès du nouveau docteur.
          </p>
          <select required value={docteurId} onChange={(e) => setDocteurId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm">
            <option value="">Sélectionner un docteur</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>Dr. {d.user.first_name} {d.user.last_name} ({d.specialite})</option>
            ))}
          </select>
          <div>
            <p className="text-xs text-gray-400 mb-1">Nouvelle date/heure (optionnel — sinon la date initiale est conservée)</p>
            <div className="flex items-center gap-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
              <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
            {submitting ? 'Envoi...' : 'Réassigner'}
          </button>
        </form>
      )}
    </Modal>
  )
}
