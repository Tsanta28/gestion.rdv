import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listUsers, toggleUserActive, updateUser, deleteUser } from '../../services/dashboardService'
import SearchBar from '../../components/SearchBar'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import ActionButtons from '../../components/ActionButtons'
import { useToast } from '../../components/Toast'

const ROLE_LABELS = { admin: 'Admin', secretaire: 'Secrétaire', docteur: 'Docteur', patient: 'Patient' }

export default function AdminUsers() {
  const [users, setUsers] = useState(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { push } = useToast()

  function load() {
    listUsers().then((data) => setUsers(data.results ?? data))
  }
  useEffect(load, [])

  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && users) {
      const found = users.find((u) => String(u.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [users, searchParams, setSearchParams])

  async function handleToggle(id) {
    try {
      await toggleUserActive(id)
      push('Statut mis à jour ✅', 'success')
      load()
    } catch {
      push('Erreur.', 'error')
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
    try {
      await deleteUser(deleting.id)
      push('Utilisateur supprimé.', 'success')
      setDeleting(null)
      load()
    } catch {
      push('Erreur lors de la suppression.', 'error')
    }
  }

  const filtered = (users || []).filter((u) =>
    `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase())
  )

  if (!users) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <SearchBar value={q} onChange={setQ} />
      </div>

      {/* Vue tableau (desktop) */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 text-left sticky top-0">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${i % 2 ? 'bg-gray-50/40 dark:bg-gray-900' : ''}`}>
                <td className="px-4 py-3">{u.first_name} {u.last_name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                    {u.is_active ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActionButtons
                    onView={() => setViewing(u)}
                    onEdit={() => setEditing({ ...u })}
                    onToggle={() => handleToggle(u.id)}
                    isActive={u.is_active}
                    onDelete={() => setDeleting(u)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue cards (mobile) */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{u.first_name} {u.last_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400 mt-1">{ROLE_LABELS[u.role]}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full h-fit ${u.is_active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                {u.is_active ? 'Actif' : 'Désactivé'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ActionButtons
                onView={() => setViewing(u)}
                onEdit={() => setEditing({ ...u })}
                onToggle={() => handleToggle(u.id)}
                isActive={u.is_active}
                onDelete={() => setDeleting(u)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal detail */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Détails de l'utilisateur">
        {viewing && (
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-400">Nom</dt><dd>{viewing.first_name} {viewing.last_name}</dd></div>
            <div><dt className="text-gray-400">Email</dt><dd>{viewing.email}</dd></div>
            <div><dt className="text-gray-400">Téléphone</dt><dd>{viewing.phone || '—'}</dd></div>
            <div><dt className="text-gray-400">Rôle</dt><dd>{ROLE_LABELS[viewing.role]}</dd></div>
            <div><dt className="text-gray-400">Inscrit le</dt><dd>{new Date(viewing.date_joined).toLocaleDateString('fr-FR')}</dd></div>
          </dl>
        )}
      </Modal>

      {/* Modal edition */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier l'utilisateur">
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
            <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              placeholder="Téléphone" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent">
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
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
        title="Supprimer l'utilisateur"
        message={deleting ? `Supprimer définitivement ${deleting.first_name} ${deleting.last_name} ? Cette action est irréversible.` : ''}
      />
    </div>
  )
}
