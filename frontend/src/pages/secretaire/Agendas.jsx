import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getAgendaTous } from '../../services/agendaService'
import { listDoctors } from '../../services/doctorService'
import Loader from '../../components/Loader'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'
import ProposerCreneauModal from '../../components/ProposerCreneauModal'
import ReassignerDocteurModal from '../../components/ReassignerDocteurModal'
import SpecialtyCombobox from '../../components/SpecialtyCombobox'

const locales = { fr }
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
})

const MESSAGES = {
  next: 'Suivant', previous: 'Précédent', today: "Aujourd'hui",
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  noEventsInRange: 'Aucun rendez-vous sur cette période.',
}

const PALETTE = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function SecretaireAgendas() {
  const [doctors, setDoctors] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [specialite, setSpecialite] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [rdvs, setRdvs] = useState(null)
  const [selected, setSelected] = useState(null)
  const [proposing, setProposing] = useState(null)
  const [reassigning, setReassigning] = useState(null)

  useEffect(() => {
    listDoctors().then((data) => setDoctors(data.results ?? data))
  }, [])

  function load() {
    const params = {}
    if (selectedDoctorId) params.docteur = selectedDoctorId
    if (specialite) params.specialite = specialite
    if (statutFilter) params.statut = statutFilter
    getAgendaTous(params).then(setRdvs)
  }
  useEffect(load, [selectedDoctorId, specialite, statutFilter])

  const colorByDoctor = useMemo(() => {
    const map = {}
    ;(doctors || []).forEach((d, i) => { map[d.id] = PALETTE[i % PALETTE.length] })
    return map
  }, [doctors])

  const events = useMemo(() => {
    if (!rdvs) return []
    return rdvs.map((r) => ({
      id: r.id,
      title: `Dr. ${r.docteur.user.last_name} — ${r.patient.user.first_name} ${r.patient.user.last_name}`,
      start: new Date(r.date_heure),
      end: new Date(new Date(r.date_heure).getTime() + r.duree * 60000),
      resource: r,
    }))
  }, [rdvs])

  const selectedDoctor = doctors?.find((d) => String(d.id) === selectedDoctorId)

  if (!doctors || !rdvs) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Agendas des docteurs</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Tous les docteurs (vue globale)</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.user.first_name} {d.user.last_name} ({d.specialite}) {d.est_disponible === false ? '— indisponible' : ''}
            </option>
          ))}
        </select>
        <SpecialtyCombobox value={specialite} onChange={setSpecialite} placeholder="Filtrer par spécialité" />
        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
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

      {selectedDoctor && (
        <div className="mb-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-sm flex items-center justify-between">
          <span>
            Disponibilité : <strong>{selectedDoctor.disponibilite || 'non renseignée'}</strong>
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            selectedDoctor.est_disponible !== false
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            {selectedDoctor.est_disponible !== false ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
      )}

      {!selectedDoctorId && (
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {doctors.map((d) => (
            <span key={d.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorByDoctor[d.id] }} />
              Dr. {d.user.last_name}
            </span>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4" style={{ height: 640 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={MESSAGES}
          culture="fr"
          views={['month', 'week', 'day']}
          defaultView="week"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: colorByDoctor[event.resource.docteur.id] || '#0ea5e9',
              borderRadius: 6, border: 'none', color: 'white',
            },
          })}
          onSelectEvent={(event) => setSelected(event.resource)}
          style={{ height: '100%' }}
        />
      </div>

      <Modal_Actions
        selected={selected}
        onClose={() => setSelected(null)}
        onPropose={() => { setProposing(selected); setSelected(null) }}
        onReassign={() => { setReassigning(selected); setSelected(null) }}
      />

      <ProposerCreneauModal rdv={proposing} onClose={() => setProposing(null)} onDone={() => { setProposing(null); load() }} />
      <ReassignerDocteurModal rdv={reassigning} onClose={() => setReassigning(null)} onDone={() => { setReassigning(null); load() }} />
    </div>
  )
}

/** Variante du detail RDV avec actions rapides quand la demande est en attente de validation. */
function Modal_Actions({ selected, onClose, onPropose, onReassign }) {
  if (!selected) return <AppointmentDetailModal rdv={null} onClose={onClose} />
  const peutAgir = selected.statut === 'demande_envoyee'
  return (
    <AppointmentDetailModal
      rdv={selected}
      onClose={onClose}
    >
      {peutAgir && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onPropose} className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            Proposer un créneau
          </button>
          <button onClick={onReassign} className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            Proposer un autre docteur
          </button>
        </div>
      )}
    </AppointmentDetailModal>
  )
}
