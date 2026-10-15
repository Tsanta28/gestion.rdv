import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAuth } from '../../context/AuthContext'
import { getAgendaDocteur } from '../../services/agendaService'
import { listDoctors } from '../../services/doctorService'
import Loader from '../../components/Loader'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'

const locales = { fr }
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales,
})

const STATUT_COLORS = {
  en_attente: '#f59e0b',
  confirme: '#10b981',
  annule: '#ef4444',
  termine: '#94a3b8',
}

const MESSAGES = {
  next: 'Suivant', previous: 'Précédent', today: "Aujourd'hui",
  month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda',
  noEventsInRange: 'Aucun rendez-vous sur cette période.',
}

export default function DocteurAgenda() {
  const { user } = useAuth()
  const [rdvs, setRdvs] = useState(null)
  const [statutFilter, setStatutFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    // L'API /auth/me/ ne renvoie pas l'id du profil docteur (seulement
    // l'id du User) : on le resout via la liste des docteurs (filtree
    // cote backend pour ne renvoyer que le docteur connecte).
    listDoctors().then((data) => {
      const list = data.results ?? data
      const mine = list.find((d) => d.user.id === user.id)
      if (mine) {
        getAgendaDocteur(mine.id, statutFilter ? { statut: statutFilter } : {}).then(setRdvs)
      } else {
        setRdvs([])
      }
    })
  }, [user, statutFilter])

  const events = useMemo(() => {
    if (!rdvs) return []
    return rdvs.map((r) => ({
      id: r.id,
      title: `${r.patient.user.first_name} ${r.patient.user.last_name}`,
      start: new Date(r.date_heure),
      end: new Date(new Date(r.date_heure).getTime() + r.duree * 60000),
      resource: r,
    }))
  }, [rdvs])

  if (!rdvs) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Mon agenda</h1>
        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {Object.entries(STATUT_COLORS).map(([k, color]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {{ en_attente: 'En attente', confirme: 'Confirmé', annule: 'Annulé', termine: 'Terminé' }[k]}
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
          defaultView="week"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: STATUT_COLORS[event.resource.statut] || '#3b82f6',
              borderRadius: 6, border: 'none', color: 'white',
            },
          })}
          onSelectEvent={(event) => setSelected(event.resource)}
          style={{ height: '100%' }}
        />
      </div>

      <AppointmentDetailModal rdv={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
