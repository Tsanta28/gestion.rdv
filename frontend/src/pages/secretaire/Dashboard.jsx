import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/dashboardService'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'
import { CalendarCheck, Clock3, UserPlus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const STATUT_LABELS = { en_attente: 'En attente', confirme: 'Confirmé', annule: 'Annulé', termine: 'Terminé' }
const COLORS = { en_attente: '#f59e0b', confirme: '#3b82f6', annule: '#ef4444', termine: '#10b981' }

export default function SecretaireDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard('secretaire').then(setData)
  }, [])

  if (!data) return <Loader />

  const statutData = data.rdv_par_statut.map((s) => ({
    name: STATUT_LABELS[s.statut] || s.statut,
    value: s.total,
    key: s.statut,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Vue d'ensemble du jour</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="RDV aujourd'hui" value={data.rdv_du_jour} icon={CalendarCheck} />
        <StatCard label="Demandes en attente" value={data.demandes_en_attente} accent="amber" icon={Clock3} />
        <StatCard label="Nouveaux patients (7j)" value={data.nouveaux_patients_7j} accent="emerald" icon={UserPlus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Rendez-vous des 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.rdv_par_jour}>
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Répartition par statut</h2>
          {statutData.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun rendez-vous pour le moment.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statutData} dataKey="value" nameKey="name" outerRadius={85} label>
                  {statutData.map((s) => <Cell key={s.key} fill={COLORS[s.key] || '#94a3b8'} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
