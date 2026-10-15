import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getCreneauxLibres } from '../services/doctorService'
import { createAppointment } from '../services/appointmentService'
import { useToast } from './Toast'

/** Modal "Nouvelle demande de rendez-vous" declenchee au clic sur une date/un creneau de l'agenda patient. */
export default function DemandeRdvModal({ open, onClose, onDone, docteur, date }) {
  const [slots, setSlots] = useState(null)
  const [heure, setHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()

  useEffect(() => {
    if (open && docteur && date) {
      setSlots(null)
      getCreneauxLibres(docteur.id, date).then(setSlots).catch(() => setSlots({ creneaux_configures: [], heures_deja_prises: [] }))
    }
  }, [open, docteur, date])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!heure) {
      push('Sélectionnez une heure.', 'error')
      return
    }
    setSubmitting(true)
    try {
      await createAppointment({
        docteur_id: docteur.id,
        date_heure: `${date}T${heure}:00`,
        motif,
      })
      push('Demande de rendez-vous envoyée ✅', 'success')
      setHeure('')
      setMotif('')
      onDone()
    } catch {
      push('Erreur lors de la demande.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle demande de rendez-vous">
      {docteur && date && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm">
            <p className="text-gray-400">Docteur</p>
            <p className="font-medium">Dr. {docteur.user.first_name} {docteur.user.last_name} — {docteur.specialite}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400">Date sélectionnée</p>
            <p className="font-medium">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {slots === null ? (
            <p className="text-sm text-gray-400">Chargement des créneaux...</p>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-2">Créneaux disponibles ce jour</p>
              {slots.creneaux_configures.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Aucun créneau configuré pour ce jour — vous pouvez tout de même proposer une heure.</p>
              ) : (
                <p className="text-xs text-gray-400 mb-2">{slots.creneaux_configures.join(', ')}</p>
              )}
              <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
              {slots.heures_deja_prises.length > 0 && (
                <p className="text-xs text-rose-500 mt-1">Déjà pris : {slots.heures_deja_prises.join(', ')}</p>
              )}
            </div>
          )}

          <textarea placeholder="Motif" rows={2} value={motif} onChange={(e) => setMotif(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />

          <button type="submit" disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
            {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>
      )}
    </Modal>
  )
}
