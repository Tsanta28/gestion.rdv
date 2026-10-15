import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listDoctors } from '../../services/doctorService'
import DoctorCard from '../../components/DoctorCard'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'
import ActionButtons from '../../components/ActionButtons'
import Loader from '../../components/Loader'

export default function SecretaireDoctors() {
  const [doctors, setDoctors] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    listDoctors().then((data) => setDoctors(data.results ?? data))
  }, [])

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && doctors) {
      const found = doctors.find((d) => String(d.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [doctors, searchParams, setSearchParams])

  if (!doctors) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Docteurs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <DoctorCard key={d.id} docteur={d}>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ActionButtons onView={() => setViewing(d)} />
            </div>
          </DoctorCard>
        ))}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Détails du docteur">
        {viewing && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Avatar src={viewing.photo} name={`${viewing.user.first_name} ${viewing.user.last_name}`} size="lg" />
                <div>
                  <p className="font-medium">Dr. {viewing.user.first_name} {viewing.user.last_name}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">{viewing.specialite}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full h-fit ${
                viewing.est_disponible !== false
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
              }`}>
                {viewing.est_disponible !== false ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-400">Résumé disponibilité</dt><dd>{viewing.disponibilite || '—'}</dd></div>
              {viewing.disponibilites && Object.keys(viewing.disponibilites).length > 0 && (
                <div>
                  <dt className="text-gray-400">Planning hebdomadaire</dt>
                  <dd>
                    <ul className="mt-1 space-y-0.5">
                      {Object.entries(viewing.disponibilites).map(([jour, plages]) => (
                        <li key={jour} className="capitalize">{jour} : {plages.join(', ')}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              <div><dt className="text-gray-400">Description</dt><dd>{viewing.description || '—'}</dd></div>
              <div><dt className="text-gray-400">Email</dt><dd>{viewing.user.email}</dd></div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  )
}
