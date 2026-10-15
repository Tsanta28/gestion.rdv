import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listAppointments } from '../../services/appointmentService'
import AppointmentCard from '../../components/AppointmentCard'
import Loader from '../../components/Loader'
import PropositionRecueModal from '../../components/PropositionRecueModal'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'

export default function PatientAppointments() {
  const [rdvs, setRdvs] = useState(null)
  const [responding, setResponding] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  function load() {
    listAppointments().then((data) => setRdvs(data.results ?? data))
  }
  useEffect(load, [])

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && rdvs) {
      const found = rdvs.find((r) => String(r.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [rdvs, searchParams, setSearchParams])

  if (!rdvs) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes rendez-vous</h1>
      {rdvs.length === 0 ? (
        <p className="text-gray-400">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {rdvs.map((r) => (
            <AppointmentCard key={r.id} rdv={r} highlighted={String(r.id) === searchParams.get('view')}>
              {r.statut === 'proposition_envoyee' && (
                <button onClick={() => setResponding(r)} className="text-xs px-2 py-1 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                  Voir la proposition
                </button>
              )}
            </AppointmentCard>
          ))}
        </div>
      )}

      <PropositionRecueModal
        rdv={responding}
        onClose={() => setResponding(null)}
        onDone={() => { setResponding(null); load() }}
      />
      <AppointmentDetailModal rdv={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
