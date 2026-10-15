import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDoctors } from '../../services/doctorService'
import DoctorCard from '../../components/DoctorCard'
import SpecialtyCombobox from '../../components/SpecialtyCombobox'
import Loader from '../../components/Loader'

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState(null)
  const [specialite, setSpecialite] = useState('')

  useEffect(() => {
    listDoctors(specialite ? { specialite } : {}).then((data) => setDoctors(data.results ?? data))
  }, [specialite])

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Nos docteurs</h1>
        <div className="w-full sm:w-64">
          <SpecialtyCombobox value={specialite} onChange={setSpecialite} placeholder="Filtrer par spécialité" />
        </div>
      </div>
      {!doctors ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <Link key={d.id} to={`/patient/docteurs/${d.id}`}>
              <DoctorCard docteur={d} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
