import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/dashboardService'
import StatCard from '../../components/StatCard'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import { CalendarCheck, CalendarDays, Users, Gauge } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DocteurDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard('docteur').then(setData)
  }, [])

  if (!data) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="RDV aujourd'hui" value={data.rdv_du_jour} icon={CalendarCheck} />
        <StatCard label="RDV cette semaine" value={data.rdv_de_la_semaine} accent="emerald" icon={CalendarDays} />
        <StatCard label="Patients uniques" value={data.patients_uniques} accent="amber" icon={Users} />
        <StatCard label="Taux d'occupation" value={`${data.taux_occupation}%`} accent="rose" icon={Gauge} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Rendez-vous cette semaine (Lun–Dim)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.rdv_par_jour}>
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Derniers patients accueillis</h2>
          {data.derniers_patients.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun patient accueilli pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {data.derniers_patients.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Avatar src={p.photo} name={p.nom} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.nom}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.date_heure).toLocaleDateString('fr-FR')}
                      {p.motif ? ` · ${p.motif}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
