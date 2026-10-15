import { useState } from 'react'
import Modal from './Modal'
import { accepterProposition, refuserDemande } from '../services/appointmentService'
import { useToast } from './Toast'

export default function PropositionRecueModal({ rdv, onClose, onDone }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()

  const propositions = (rdv?.propositions || []).filter((p) => p.statut === 'en_attente')

  async function handleAccept() {
    if (!selected) return
    setSubmitting(true)
    try {
      await accepterProposition(rdv.id, selected)
      push('Créneau confirmé ✅', 'success')
      onDone()
    } catch {
      push("Erreur lors de la confirmation.", 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRefuse() {
    setSubmitting(true)
    try {
      await refuserDemande(rdv.id)
      push('Proposition refusée.', 'success')
      onDone()
    } catch {
      push('Erreur.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={!!rdv} onClose={onClose} title="Proposition de créneau reçue">
      {rdv && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dr. {rdv.docteur?.user?.last_name} vous propose {propositions.length > 1 ? 'les créneaux suivants' : 'le créneau suivant'} :
          </p>
          <div className="space-y-2">
            {propositions.map((p) => (
              <label key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer ${
                selected === p.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <input type="radio" name="creneau" checked={selected === p.id} onChange={() => setSelected(p.id)} />
                <span className="text-sm">{new Date(p.date_heure_proposee).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefuse} disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60">
              Refuser
            </button>
            <button onClick={handleAccept} disabled={submitting || !selected}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              Accepter ce créneau
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
