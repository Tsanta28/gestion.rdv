import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listAppointments, updateAppointmentStatus, createAppointment } from '../../services/appointmentService'
import { listPatients } from '../../services/patientService'
import { listDoctors } from '../../services/doctorService'
import AppointmentCard from '../../components/AppointmentCard'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'
import ProposerCreneauModal from '../../components/ProposerCreneauModal'
import ReassignerDocteurModal from '../../components/ReassignerDocteurModal'
import SpecialtyCombobox from '../../components/SpecialtyCombobox'
import { useToast } from '../../components/Toast'

// La confirmation finale appartient au docteur (il valide ou refuse la
// demande) : la secretaire peut annuler, proposer un creneau, ou proposer
// un autre docteur tant que la demande est en attente de validation.
const ACTIONS = {
  confirme: [['termine', 'Terminer'], ['annule', 'Annuler']],
}

export default function SecretaireAppointments() {
  const [rdvs, setRdvs] = useState(null)
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [specialiteFiltre, setSpecialiteFiltre] = useState('')
  const [form, setForm] = useState({ patient_id: '', docteur_id: '', date: '', heure: '', motif: '' })
  const { push } = useToast()
  const [viewing, setViewing] = useState(null)
  const [proposing, setProposing] = useState(null)
  const [reassigning, setReassigning] = useState(null)
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
  useEffect(() => {
    if (open) {
      listPatients().then((d) => setPatients(d.results ?? d))
      listDoctors().then((d) => setDoctors(d.results ?? d))
    }
  }, [open])

  async function handleAction(id, statut) {
    try {
      await updateAppointmentStatus(id, statut)
      push('Statut mis à jour.', 'success')
      load()
    } catch {
      push('Erreur lors de la mise à jour.', 'error')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createAppointment({
        patient_id: form.patient_id,
        docteur_id: form.docteur_id,
        date_heure: `${form.date}T${form.heure}:00`,
        motif: form.motif,
      })
      push('Demande transmise au docteur pour validation ✅', 'success')
      setOpen(false)
      setForm({ patient_id: '', docteur_id: '', date: '', heure: '', motif: '' })
      setSpecialiteFiltre('')
      load()
    } catch {
      push('Erreur lors de la création.', 'error')
    }
  }

  const doctorsFiltres = specialiteFiltre
    ? doctors.filter((d) => d.specialite === specialiteFiltre)
    : doctors

  if (!rdvs) return <Loader />

  const aTraiter = rdvs.filter((r) => ['demande_envoyee', 'proposition_envoyee'].includes(r.statut))
  const autres = rdvs.filter((r) => !['demande_envoyee', 'proposition_envoyee'].includes(r.statut))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rendez-vous</h1>
        <button onClick={() => setOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nouveau rendez-vous
        </button>
      </div>

      {aTraiter.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            En attente de validation docteur ({aTraiter.length})
          </h2>
          <div className="space-y-3">
            {aTraiter.map((r) => (
              <AppointmentCard key={r.id} rdv={r} highlighted={String(r.id) === searchParams.get('view')}>
                {r.statut === 'demande_envoyee' && (
                  <>
                    <button onClick={() => setProposing(r)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Proposer un créneau
                    </button>
                    <button onClick={() => setReassigning(r)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Proposer un autre docteur
                    </button>
                  </>
                )}
                <button onClick={() => handleAction(r.id, 'annule')} className="text-xs px-2 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  Annuler
                </button>
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
            {(ACTIONS[r.statut] || []).map(([statut, label]) => (
              <button key={statut} onClick={() => handleAction(r.id, statut)}
                className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                {label}
              </button>
            ))}
          </AppointmentCard>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau rendez-vous">
        <form onSubmit={handleCreate} className="space-y-3">
          <select required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent">
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.user.first_name} {p.user.last_name}</option>
            ))}
          </select>

          <p className="text-xs text-gray-400">Si le patient ne connaît pas de docteur, filtrez par spécialité :</p>
          <SpecialtyCombobox value={specialiteFiltre} onChange={setSpecialiteFiltre} placeholder="Filtrer par spécialité (optionnel)" />

          <select required value={form.docteur_id} onChange={(e) => setForm({ ...form, docteur_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent">
            <option value="">Sélectionner un docteur</option>
            {doctorsFiltres.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.user.last_name} ({d.specialite}) {d.est_disponible === false ? '— indisponible' : ''}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <input type="time" required value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          </div>
          <textarea placeholder="Motif" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" rows={2} />
          <p className="text-xs text-gray-400">La demande sera transmise au docteur, qui devra la valider, la refuser ou proposer un autre créneau.</p>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium">
            Envoyer la demande au docteur
          </button>
        </form>
      </Modal>

      <ProposerCreneauModal rdv={proposing} onClose={() => setProposing(null)} onDone={() => { setProposing(null); load() }} />
      <ReassignerDocteurModal rdv={reassigning} onClose={() => setReassigning(null)} onDone={() => { setReassigning(null); load() }} />
      <AppointmentDetailModal rdv={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
