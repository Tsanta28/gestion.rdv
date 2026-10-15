import { useState } from 'react'
import Modal from './Modal'
import { proposerCreneaux } from '../services/appointmentService'
import { useToast } from './Toast'

export default function ProposerCreneauModal({ rdv, onClose, onDone }) {
  const [slots, setSlots] = useState([{ date: '', heure: '' }])
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()

  function updateSlot(i, field, value) {
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, [field]: value } : slot)))
  }
  function addSlot() {
    if (slots.length < 3) setSlots((s) => [...s, { date: '', heure: '' }])
  }
  function removeSlot(i) {
    setSlots((s) => s.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const creneaux = slots.filter((s) => s.date && s.heure).map((s) => `${s.date}T${s.heure}:00`)
    if (creneaux.length === 0) {
      push('Ajoutez au moins un créneau.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await proposerCreneaux(rdv.id, creneaux)
      push('Proposition envoyée au patient ✅', 'success')
      onDone()
    } catch {
      push("Erreur lors de l'envoi de la proposition.", 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={!!rdv} onClose={onClose} title="Proposer un autre créneau">
      {rdv && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pour {rdv.patient?.user?.first_name} {rdv.patient?.user?.last_name} — proposez 1 à 3 créneaux alternatifs.
          </p>
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="date" value={slot.date} onChange={(e) => updateSlot(i, 'date', e.target.value)} required
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                <input type="time" value={slot.heure} onChange={(e) => updateSlot(i, 'heure', e.target.value)} required
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                {slots.length > 1 && (
                  <button type="button" onClick={() => removeSlot(i)} className="text-rose-600 text-sm px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          {slots.length < 3 && (
            <button type="button" onClick={addSlot} className="text-sm text-primary-600 dark:text-primary-400">
              + Ajouter un créneau
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
            {submitting ? 'Envoi...' : 'Envoyer la proposition'}
          </button>
        </form>
      )}
    </Modal>
  )
}
