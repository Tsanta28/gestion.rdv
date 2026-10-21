import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDoctor } from '../../services/doctorService'
import { createAppointment, getAvailability } from '../../services/appointmentService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import { useToast } from '../../components/Toast'

const AUJOURD_HUI = new Date().toISOString().slice(0, 10)

function extraireMessageErreur(err, fallback) {
  const data = err.response?.data
  if (!data) return fallback
  return data.date_heure?.[0] || data.detail || Object.values(data).flat()[0] || fallback
}

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
      push(extraireMessageErreur(err, 'Erreur lors de la prise de rendez-vous.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!docteur) return <Loader />

  const disponible = docteur.est_disponible !== false

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4">
        <Avatar src={docteur.photo} name={`${docteur.user.first_name} ${docteur.user.last_name}`} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">Dr. {docteur.user.first_name} {docteur.user.last_name}</h1>
          <p className="text-primary-600 dark:text-primary-400">{docteur.specialite}</p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
            disponible
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${disponible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {disponible ? 'Disponible' : 'Indisponible actuellement'}
          </span>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-4">{docteur.description || docteur.biographie || 'Aucune description renseignée.'}</p>

      <form onSubmit={handleBook} className="mt-8 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
        <h2 className="font-semibold">Prendre rendez-vous</h2>
        {!disponible && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Ce docteur est actuellement marqué comme indisponible. Vous pouvez tout de même envoyer une demande, qui sera traitée dès son retour.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" value={date} min={AUJOURD_HUI} onChange={(e) => setDate(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Heure</label>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required
              className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
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
            className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        </div>
        <button type="submit" disabled={submitting}
          className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-60">
          {submitting ? 'Envoi...' : 'Confirmer la demande'}
        </button>
      </form>
    </div>
  )
}
