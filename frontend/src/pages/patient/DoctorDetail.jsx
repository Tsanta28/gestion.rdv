import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDoctor } from '../../services/doctorService'
import { createAppointment, getAvailability } from '../../services/appointmentService'
import Loader from '../../components/Loader'
import { useToast } from '../../components/Toast'

export default function DoctorDetail() {
  const { id } = useParams()
  const [docteur, setDocteur] = useState(null)
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [motif, setMotif] = useState('')
  const [dispo, setDispo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    getDoctor(id).then(setDocteur)
  }, [id])

  useEffect(() => {
    if (date) getAvailability(id, date).then(setDispo)
  }, [id, date])

  async function handleBook(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAppointment({
        docteur_id: id,
        date_heure: `${date}T${heure}:00`,
        motif,
      })
      push('Rendez-vous demandé avec succès.', 'success')
      navigate('/patient/rendezvous')
    } catch (err) {
      push(err.response?.data?.detail || 'Erreur lors de la prise de rendez-vous.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!docteur) return <Loader />

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Dr. {docteur.user.first_name} {docteur.user.last_name}</h1>
      <p className="text-primary-600">{docteur.specialite}</p>
      <p className="text-gray-500 dark:text-gray-400 mt-2">{docteur.biographie || 'Aucune biographie renseignée.'}</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        {docteur.annees_experience} ans d'expérience · {docteur.tarif_consultation} Ar / consultation
      </p>

      <form onSubmit={handleBook} className="mt-8 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
        <h2 className="font-semibold">Prendre rendez-vous</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Heure</label>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          </div>
        </div>
        {dispo && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Créneaux du docteur ce jour : {dispo.creneaux_configures.join(', ') || 'aucun'}
          </p>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motif</label>
          <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={3}
            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
        </div>
        <button type="submit" disabled={submitting}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-60">
          {submitting ? 'Envoi...' : 'Confirmer la demande'}
        </button>
      </form>
    </div>
  )
}
