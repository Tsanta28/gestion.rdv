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

export default function AdminAgendas() {
  const [doctors, setDoctors] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [specialite, setSpecialite] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [rdvs, setRdvs] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    listDoctors().then((data) => setDoctors(data.results ?? data))
  }, [])

  useEffect(() => {
    const params = {}
    if (selectedDoctorId) params.docteur = selectedDoctorId
    if (specialite) params.specialite = specialite
    if (statutFilter) params.statut = statutFilter
    getAgendaTous(params).then(setRdvs)
  }, [selectedDoctorId, specialite, statutFilter])

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

  if (!doctors || !rdvs) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Agendas</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Tous les docteurs (vue globale)</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>Dr. {d.user.first_name} {d.user.last_name} ({d.specialite})</option>
          ))}
        </select>
        <SpecialtyCombobox value={specialite} onChange={setSpecialite} placeholder="Filtrer par spécialité" />
        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

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

      <p className="text-xs text-gray-400 mt-3">
        Export PDF / CSV : à venir dans une prochaine itération.
      </p>

      <AppointmentDetailModal rdv={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
