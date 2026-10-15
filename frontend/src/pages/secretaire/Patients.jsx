import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listPatients, createPatient, updatePatient, deletePatient } from '../../services/patientService'
import PatientCard from '../../components/PatientCard'
import SearchBar from '../../components/SearchBar'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import Loader from '../../components/Loader'
import ActionButtons from '../../components/ActionButtons'
import PhotoUploader from '../../components/PhotoUploader'
import Avatar from '../../components/Avatar'
import { useToast } from '../../components/Toast'

export default function SecretairePatients() {
  const [patients, setPatients] = useState(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '' })
  const { push } = useToast()

  function load() {
    listPatients().then((data) => setPatients(data.results ?? data))
  }
  useEffect(load, [])

  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && patients) {
      const found = patients.find((p) => String(p.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [patients, searchParams, setSearchParams])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createPatient(form)
      push('Patient créé avec succès ✅', 'success')
      setOpen(false)
      load()
    } catch {
      push('Erreur lors de la création du patient.', 'error')
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    try {
      const payload = {
        groupe_sanguin: editing.groupe_sanguin,
        antecedents_medicaux: editing.antecedents_medicaux,
        numero_assurance: editing.numero_assurance,
        date_naissance: editing.date_naissance || null,
        sexe: editing.sexe,
      }
      if (editing.photo instanceof File) payload.photo = editing.photo
      await updatePatient(editing.id, payload)
      push('Modifié avec succès ✅', 'success')
      setEditing(null)
      load()
    } catch {
      push('Erreur lors de la modification.', 'error')
    }
  }

  async function handleDelete() {
    await deletePatient(deleting.id)
    push('Patient supprimé.', 'success')
    setDeleting(null)
    load()
  }

  const filtered = (patients || []).filter((p) =>
    `${p.user.first_name} ${p.user.last_name} ${p.user.email}`.toLowerCase().includes(q.toLowerCase())
  )

  if (!patients) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Patients</h1>
        <div className="flex items-center gap-3">
          <SearchBar value={q} onChange={setQ} />
          <button onClick={() => setOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md">
            + Nouveau patient
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <PatientCard key={p.id} patient={p}>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ActionButtons
                onView={() => setViewing(p)}
                onEdit={() => setEditing({ ...p })}
                onDelete={() => setDeleting(p)}
              />
            </div>
          </PatientCard>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau patient">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <input placeholder="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          </div>
          <input placeholder="Nom d'utilisateur" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input type="password" placeholder="Mot de passe" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors">
            Créer
          </button>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Détails du patient">
        {viewing && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={viewing.photo} name={`${viewing.user.first_name} ${viewing.user.last_name}`} size="lg" />
              <p className="font-medium">{viewing.user.first_name} {viewing.user.last_name}</p>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-400">Email</dt><dd>{viewing.user.email}</dd></div>
              <div><dt className="text-gray-400">Groupe sanguin</dt><dd>{viewing.groupe_sanguin || '—'}</dd></div>
              <div><dt className="text-gray-400">N° assurance</dt><dd>{viewing.numero_assurance || '—'}</dd></div>
              <div><dt className="text-gray-400">Antécédents</dt><dd>{viewing.antecedents_medicaux || '—'}</dd></div>
            </dl>
          </div>
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le patient">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <PhotoUploader
              value={editing.photo}
              onChange={(file) => setEditing({ ...editing, photo: file })}
              name={`${editing.user.first_name} ${editing.user.last_name}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={editing.date_naissance || ''} onChange={(e) => setEditing({ ...editing, date_naissance: e.target.value })}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
              <select value={editing.sexe || ''} onChange={(e) => setEditing({ ...editing, sexe: e.target.value })}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent">
                <option value="">Sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <input placeholder="Groupe sanguin" value={editing.groupe_sanguin || ''} onChange={(e) => setEditing({ ...editing, groupe_sanguin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <input placeholder="N° assurance" value={editing.numero_assurance || ''} onChange={(e) => setEditing({ ...editing, numero_assurance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <textarea placeholder="Antécédents médicaux" rows={3} value={editing.antecedents_medicaux || ''} onChange={(e) => setEditing({ ...editing, antecedents_medicaux: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors">
              Enregistrer
            </button>
          </form>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Supprimer le patient"
        message={deleting ? `Supprimer ${deleting.user.first_name} ${deleting.user.last_name} ?` : ''}
      />
    </div>
  )
}
