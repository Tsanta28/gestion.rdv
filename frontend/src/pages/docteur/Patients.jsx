import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPatients } from '../../services/patientService'
import PatientCard from '../../components/PatientCard'
import Loader from '../../components/Loader'
import { Eye } from 'lucide-react'

export default function DocteurPatients() {
  const [patients, setPatients] = useState(null)

  useEffect(() => {
    listPatients().then((data) => setPatients(data.results ?? data))
  }, [])

  if (!patients) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes patients</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p) => (
          <PatientCard key={p.id} patient={p}>
            <Link
              to={`/docteur/patients/${p.id}`}
              className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Eye size={14} /> Voir détails
            </Link>
          </PatientCard>
        ))}
      </div>
    </div>
  )
}
