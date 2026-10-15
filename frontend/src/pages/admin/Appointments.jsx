import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listAppointments } from '../../services/appointmentService'
import AppointmentCard from '../../components/AppointmentCard'
import Loader from '../../components/Loader'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'

export default function AdminAppointments() {
  const [rdvs, setRdvs] = useState(null)
  const [statut, setStatut] = useState('')
  const [viewing, setViewing] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    listAppointments(statut ? { statut } : {}).then((data) => setRdvs(data.results ?? data))
  }, [statut])

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && rdvs) {
      const found = rdvs.find((r) => String(r.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [rdvs, searchParams, setSearchParams])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tous les rendez-vous</h1>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Tous les statuts</option>
          <option value="demande_envoyee">Demande envoyée</option>
          <option value="en_attente">En attente</option>
          <option value="proposition_envoyee">Proposition envoyée</option>
          <option value="confirme">Confirmé</option>
          <option value="refuse">Refusé</option>
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
      </div>
      {!rdvs ? <Loader /> : (
        <div className="space-y-3">
          {rdvs.map((r) => (
            <AppointmentCard key={r.id} rdv={r} highlighted={String(r.id) === searchParams.get('view')} />
          ))}
        </div>
      )}
      <AppointmentDetailModal rdv={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
