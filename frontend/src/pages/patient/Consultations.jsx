import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPatientMesConsultations } from '../../services/consultationService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'

export default function PatientConsultations() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    getPatientMesConsultations().then(setItems)
  }, [])

  if (!items) return <Loader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mes consultations</h1>
      {items.length === 0 ? (
        <p className="text-gray-400">Vous n'avez pas encore consulté de docteur.</p>
      ) : (
        <div className="space-y-4">
          {items.map(({ docteur, derniere_consultation }) => (
            <div key={docteur.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={docteur.photo} name={`${docteur.user.first_name} ${docteur.user.last_name}`} size="md" />
                  <div>
                    <p className="font-medium">Dr. {docteur.user.first_name} {docteur.user.last_name}</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{docteur.specialite}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/patient/docteurs/${docteur.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                    Prendre un nouveau RDV
                  </Link>
                </div>
              </div>

              {derniere_consultation ? (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm space-y-1">
                  <p className="text-xs text-gray-400">
                    Dernière consultation le {new Date(derniere_consultation.date_heure).toLocaleDateString('fr-FR')}
                  </p>
                  <p><span className="text-gray-400">Diagnostic :</span> {derniere_consultation.diagnostic || '—'}</p>
                  <p><span className="text-gray-400">Prescription :</span> {derniere_consultation.prescription || '—'}</p>
                  {derniere_consultation.notes && <p><span className="text-gray-400">Notes :</span> {derniere_consultation.notes}</p>}
                </div>
              ) : (
                <p className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-400">
                  Aucun compte-rendu disponible pour le moment.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
