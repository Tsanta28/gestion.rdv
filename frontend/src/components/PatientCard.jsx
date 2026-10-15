import Avatar from './Avatar'

export default function PatientCard({ patient, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <Avatar src={patient.photo} name={`${patient.user.first_name} ${patient.user.last_name}`} size="md" />
        <div>
          <p className="font-medium">{patient.user.first_name} {patient.user.last_name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.user.email}</p>
        </div>
      </div>
      {patient.groupe_sanguin && (
        <p className="text-xs text-gray-400 mt-2">Groupe sanguin : {patient.groupe_sanguin}</p>
      )}
      {children}
    </div>
  )
}
