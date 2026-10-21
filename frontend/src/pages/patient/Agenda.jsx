import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { getAgendaPatient } from '../../services/agendaService'
import { listDoctors } from '../../services/doctorService'
import Loader from '../../components/Loader'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'
import DemandeRdvModal from '../../components/DemandeRdvModal'

const locales = { fr }
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
})

const MESSAGES = {
  next: 'Suivant', previous: 'Précédent', today: "Aujourd'hui",
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  noEventsInRange: 'Aucun rendez-vous sur cette période.',
}

const STATUT_COLORS = {
  demande_envoyee: '#38bdf8',
  en_attente: '#f59e0b',
  proposition_envoyee: '#f97316',
  confirme: '#10b981',
  refuse: '#ef4444',
  annule: '#ef4444',
  termine: '#94a3b8',
}
const STATUT_LABELS = {
  demande_envoyee: 'Demande envoyée', en_attente: 'En attente', proposition_envoyee: 'Proposition reçue',
  confirme: 'Confirmé', refuse: 'Refusé', annule: 'Annulé', termine: 'Terminé',
}

export default function PatientAgenda() {
  const [doctors, setDoctors] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [rdvs, setRdvs] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [demande, setDemande] = useState(null) // { docteur, date }

  useEffect(() => {
    listDoctors().then((data) => setDoctors(data.results ?? data))
  }, [])

  function load() {
    getAgendaPatient().then(setRdvs)
  }
  useEffect(load, [])

  const events = useMemo(() => {
    if (!rdvs) return []
    return rdvs.map((r) => ({
      id: r.id,
      title: `Dr. ${r.docteur.user.last_name} — ${STATUT_LABELS[r.statut]}`,
      start: new Date(r.date_heure),
      end: new Date(new Date(r.date_heure).getTime() + r.duree * 60000),
      resource: r,
    }))
  }, [rdvs])

  function handleSelectSlot(slotInfo) {
    if (!selectedDoctorId) return
    const docteur = doctors.find((d) => String(d.id) === selectedDoctorId)
    if (!docteur) return
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)
    if (slotInfo.start < aujourdhui) return // date passee : on ignore le clic
    const dateStr = slotInfo.start.toISOString().slice(0, 10)
    setDemande({ docteur, date: dateStr })
  }

  if (!doctors || !rdvs) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Mon agenda</h1>
        <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Sélectionner un docteur pour demander un RDV</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>Dr. {d.user.first_name} {d.user.last_name} ({d.specialite})</option>
          ))}
        </select>
      </div>

      {selectedDoctorId ? (
        <p className="text-xs text-gray-400 mb-3">Cliquez sur une date du calendrier pour demander un rendez-vous avec ce docteur.</p>
      ) : (
        <p className="text-xs text-gray-400 mb-3">Sélectionnez un docteur ci-dessus pour pouvoir cliquer sur une date et demander un rendez-vous.</p>
      )}

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {Object.entries(STATUT_LABELS).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUT_COLORS[k] }} />
            {label}
          </span>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4" style={{ height: 640 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={MESSAGES}
          culture="fr"
          views={['month', 'week', 'day']}
          defaultView="month"
          selectable={!!selectedDoctorId}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: STATUT_COLORS[event.resource.statut] || '#0ea5e9',
              borderRadius: 6, border: 'none', color: 'white',
            },
          })}
          onSelectEvent={(event) => setViewing(event.resource)}
          style={{ height: '100%' }}
        />
      </div>

      <AppointmentDetailModal rdv={viewing} onClose={() => setViewing(null)} />
      <DemandeRdvModal
        open={!!demande}
        docteur={demande?.docteur}
        date={demande?.date}
        onClose={() => setDemande(null)}
        onDone={() => { setDemande(null); load() }}
      />
    </div>
  )
}
