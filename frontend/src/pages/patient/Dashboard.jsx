import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/dashboardService'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'
import { CalendarCheck, History, Clock3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function PatientDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard('patient').then(setData)
  }, [])

  if (!data) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mon tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Rendez-vous à venir" value={data.nb_rdv_a_venir} icon={CalendarCheck} />
        <StatCard label="Rendez-vous passés" value={data.nb_rdv_passes} accent="emerald" icon={History} />
        <StatCard
          label="Prochain rendez-vous"
          value={data.prochain_rdv ? new Date(data.prochain_rdv.date_heure).toLocaleDateString('fr-FR') : '—'}
          accent="amber"
          icon={Clock3}
        />
      </div>

      {data.prochain_rdv && (
        <div className="mt-6 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Prochain rendez-vous avec</p>
          <p className="font-medium">{data.prochain_rdv.docteur}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Mes rendez-vous (6 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.rdv_par_mois}>
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Docteurs les plus consultés</h2>
          {data.docteurs_favoris.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun rendez-vous pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {data.docteurs_favoris.map((d, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{d.docteur}</p>
                    <p className="text-gray-400 dark:text-gray-500">{d.specialite}</p>
                  </div>
                  <span className="text-primary-600 font-semibold">{d.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
