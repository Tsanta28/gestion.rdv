import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listAppointments, accepterDemande, refuserDemande, updateAppointmentStatus } from '../../services/appointmentService'
import AppointmentCard from '../../components/AppointmentCard'
import Loader from '../../components/Loader'
import { useToast } from '../../components/Toast'
import ProposerCreneauModal from '../../components/ProposerCreneauModal'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'

export default function DocteurAppointments() {
  const [rdvs, setRdvs] = useState(null)
  const [proposing, setProposing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const { push } = useToast()
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

  async function handleAccepter(id) {
    try {
      await accepterDemande(id)
      push('Rendez-vous confirmé ✅', 'success')
      load()
    } catch {
      push('Erreur lors de la confirmation.', 'error')
    }
  }

  async function handleRefuser(id) {
    try {
      await refuserDemande(id)
      push('Demande refusée.', 'success')
      load()
    } catch {
      push('Erreur.', 'error')
    }
  }

  async function handleTerminer(id) {
    try {
      await updateAppointmentStatus(id, 'termine')
      push('Rendez-vous marqué terminé.', 'success')
      load()
    } catch {
      push('Erreur.', 'error')
    }
  }

  if (!rdvs) return <Loader />

  const demandes = rdvs.filter((r) => ['demande_envoyee', 'proposition_envoyee'].includes(r.statut))
  const autres = rdvs.filter((r) => !['demande_envoyee', 'proposition_envoyee'].includes(r.statut))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes rendez-vous</h1>

      {demandes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Demandes en attente ({demandes.length})
          </h2>
          <div className="space-y-3">
            {demandes.map((r) => (
              <AppointmentCard key={r.id} rdv={r} highlighted={String(r.id) === searchParams.get('view')}>
                {r.statut === 'demande_envoyee' && (
                  <>
                    <button onClick={() => handleAccepter(r.id)} className="text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                      Accepter
                    </button>
                    <button onClick={() => setProposing(r)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Proposer un créneau
                    </button>
                    <button onClick={() => handleRefuser(r.id)} className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      Refuser
                    </button>
                  </>
                )}
                {r.statut === 'proposition_envoyee' && (
                  <span className="text-xs text-gray-400 italic">En attente de la réponse du patient</span>
                )}
              </AppointmentCard>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Tous les rendez-vous
      </h2>
      <div className="space-y-3">
        {autres.map((r) => (
          <AppointmentCard key={r.id} rdv={r} highlighted={String(r.id) === searchParams.get('view')}>
            {r.statut === 'confirme' && (
              <button onClick={() => handleTerminer(r.id)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                Marquer terminé
              </button>
            )}
          </AppointmentCard>
        ))}
      </div>

      <ProposerCreneauModal
        rdv={proposing}
        onClose={() => setProposing(null)}
        onDone={() => { setProposing(null); load() }}
      />
      <AppointmentDetailModal rdv={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
