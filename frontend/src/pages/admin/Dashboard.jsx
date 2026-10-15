import { useEffect, useState } from 'react'
import { getDashboard } from '../../services/dashboardService'
import StatCard from '../../components/StatCard'
import Loader from '../../components/Loader'
import { Users, Stethoscope, UserCog, CalendarCheck } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6']

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard('admin').then(setData)
  }, [])

  if (!data) return <Loader />

  const statutData = data.rdv_par_statut.map((s) => ({ name: s.statut, total: s.total }))
  const specData = data.rdv_par_specialite.map((s) => ({ name: s.docteur__specialite || 'N/A', value: s.total }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistiques globales</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Patients" value={data.total_patients} icon={Users} />
        <StatCard label="Docteurs" value={data.total_docteurs} accent="emerald" icon={Stethoscope} />
        <StatCard label="Secrétaires" value={data.total_secretaires} accent="amber" icon={UserCog} />
        <StatCard label="Rendez-vous" value={data.total_rendezvous} accent="rose" icon={CalendarCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">RDV par statut</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statutData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold mb-4">RDV par spécialité</h2>
          {specData.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune donnée pour le moment.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={specData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {specData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 mt-6">
        <h2 className="font-semibold mb-4">Activité des 14 derniers jours</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.rdv_par_jour}>
            <XAxis dataKey="jour" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
