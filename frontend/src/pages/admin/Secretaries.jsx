import { useEffect, useState } from 'react'
import { listUsers, createUser, updateUser, deleteUser } from '../../services/dashboardService'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import Loader from '../../components/Loader'
import ActionButtons from '../../components/ActionButtons'
import PasswordInput from '../../components/PasswordInput'
import { useToast } from '../../components/Toast'

export default function AdminSecretaries() {
  const [users, setUsers] = useState(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'secretaire' })
  const { push } = useToast()

  function load() {
    listUsers({ role: 'secretaire' }).then((data) => setUsers(data.results ?? data))
  }
  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createUser(form)
      push('Secrétaire créée avec succès ✅', 'success')
      setOpen(false)
      setForm({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'secretaire' })
      load()
    } catch {
      push('Erreur lors de la création.', 'error')
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    try {
      await updateUser(editing.id, editing)
      push('Modifié avec succès ✅', 'success')
      setEditing(null)
      load()
    } catch {
      push('Erreur lors de la modification.', 'error')
    }
  }

  async function handleDelete() {
    await deleteUser(deleting.id)
    push('Secrétaire supprimée.', 'success')
    setDeleting(null)
    load()
  }

  if (!users) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Secrétaires</h1>
        <button onClick={() => setOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md">
          + Nouvelle secrétaire
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
            <p className="font-medium">{u.first_name} {u.last_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ActionButtons onEdit={() => setEditing({ ...u })} onDelete={() => setDeleting(u)} />
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle secrétaire">
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
          <PasswordInput placeholder="Mot de passe" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors">
            Créer
          </button>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier la secrétaire">
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing.first_name} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                placeholder="Prénom" className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
              <input value={editing.last_name} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                placeholder="Nom" className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            </div>
            <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              placeholder="Email" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
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
        title="Supprimer la secrétaire"
        message={deleting ? `Supprimer ${deleting.first_name} ${deleting.last_name} ?` : ''}
      />
    </div>
  )
}
