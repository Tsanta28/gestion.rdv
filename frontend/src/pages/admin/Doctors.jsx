import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { listDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../services/doctorService'
import DoctorCard from '../../components/DoctorCard'
import Modal from '../../components/Modal'
import ConfirmModal from '../../components/ConfirmModal'
import Loader from '../../components/Loader'
import SpecialtyCombobox from '../../components/SpecialtyCombobox'
import ActionButtons from '../../components/ActionButtons'
import PhotoUploader from '../../components/PhotoUploader'
import PasswordInput from '../../components/PasswordInput'
import Avatar from '../../components/Avatar'
import { useToast } from '../../components/Toast'
import { Loader2 } from 'lucide-react'

const createSchema = z.object({
  username: z.string().min(3, "Nom d'utilisateur trop court"),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  specialite: z.string().min(2, 'Spécialité requise'),
  numero_ordre: z.string().min(1, "Numéro d'ordre requis"),
  description: z.string().optional(),
  disponibilite: z.string().optional(),
  photo: z.any().optional(),
})

const editSchema = createSchema.omit({ password: true, username: true, email: true }).extend({
  password: z.string().optional(),
})

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { push } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const createForm = useForm({ resolver: zodResolver(createSchema), defaultValues: { specialite: '' } })
  const editForm = useForm({ resolver: zodResolver(editSchema) })

  function load() {
    listDoctors().then((data) => setDoctors(data.results ?? data))
  }
  useEffect(load, [])

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId && doctors) {
      const found = doctors.find((d) => String(d.id) === viewId)
      if (found) setViewing(found)
      setSearchParams({}, { replace: true })
    }
  }, [doctors, searchParams, setSearchParams])

  useEffect(() => {
    if (editing) {
      editForm.reset({
        first_name: editing.user.first_name,
        last_name: editing.user.last_name,
        specialite: editing.specialite,
        numero_ordre: editing.numero_ordre,
        description: editing.description,
        disponibilite: editing.disponibilite,
      })
    }
  }, [editing]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(values) {
    try {
      await createDoctor(values)
      push('Docteur créé avec succès ✅', 'success')
      setOpen(false)
      createForm.reset()
      load()
    } catch {
      push("Erreur lors de la création (numéro d'ordre déjà utilisé ?).", 'error')
    }
  }

  async function handleEdit(values) {
    try {
      const payload = { ...values }
      if (!payload.password) delete payload.password
      if (!(payload.photo instanceof File)) delete payload.photo
      await updateDoctor(editing.id, payload)
      push('Modifié avec succès ✅', 'success')
      setEditing(null)
      load()
    } catch {
      push('Erreur lors de la modification.', 'error')
    }
  }

  async function handleDelete() {
    await deleteDoctor(deleting.id)
    push('Docteur supprimé.', 'success')
    setDeleting(null)
    load()
  }

  if (!doctors) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Docteurs</h1>
        <button onClick={() => setOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md">
          + Nouveau docteur
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <DoctorCard key={d.id} docteur={d}>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <ActionButtons
                onView={() => setViewing(d)}
                onEdit={() => setEditing(d)}
                onDelete={() => setDeleting(d)}
              />
            </div>
          </DoctorCard>
        ))}
      </div>

      {/* Creation */}
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau docteur">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-3">
          <Controller
            control={createForm.control}
            name="photo"
            render={({ field }) => (
              <PhotoUploader value={field.value} onChange={field.onChange} name={createForm.watch('first_name') + ' ' + createForm.watch('last_name')} />
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" {...createForm.register('first_name')}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <input placeholder="Nom" {...createForm.register('last_name')}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          </div>
          <div>
            <input placeholder="Nom d'utilisateur" {...createForm.register('username')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            {createForm.formState.errors.username && <p className="text-xs text-rose-600 mt-1">{createForm.formState.errors.username.message}</p>}
          </div>
          <div>
            <input type="email" placeholder="Email" {...createForm.register('email')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            {createForm.formState.errors.email && <p className="text-xs text-rose-600 mt-1">{createForm.formState.errors.email.message}</p>}
          </div>
          <div>
            <PasswordInput placeholder="Mot de passe" {...createForm.register('password')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            {createForm.formState.errors.password && <p className="text-xs text-rose-600 mt-1">{createForm.formState.errors.password.message}</p>}
          </div>
          <Controller
            control={createForm.control}
            name="specialite"
            render={({ field }) => <SpecialtyCombobox value={field.value} onChange={field.onChange} />}
          />
          {createForm.formState.errors.specialite && <p className="text-xs text-rose-600">{createForm.formState.errors.specialite.message}</p>}
          <input placeholder="Numéro d'ordre" {...createForm.register('numero_ordre')}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <textarea placeholder="Disponibilité (ex : Lun-Ven 08h-17h, Sam 09h-12h)" rows={2} {...createForm.register('disponibilite')}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <textarea placeholder="Description (parcours, approche...)" rows={3} {...createForm.register('description')}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <button type="submit" disabled={createForm.formState.isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
            {createForm.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Créer
          </button>
        </form>
      </Modal>

      {/* Edition */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le docteur">
        {editing && (
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-3">
            <Controller
              control={editForm.control}
              name="photo"
              render={({ field }) => (
                <PhotoUploader value={field.value ?? editing.photo} onChange={field.onChange} name={`${editing.user.first_name} ${editing.user.last_name}`} />
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Prénom" {...editForm.register('first_name')}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
              <input placeholder="Nom" {...editForm.register('last_name')}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            </div>
            <Controller
              control={editForm.control}
              name="specialite"
              render={({ field }) => <SpecialtyCombobox value={field.value} onChange={field.onChange} />}
            />
            <input placeholder="Numéro d'ordre" {...editForm.register('numero_ordre')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <textarea placeholder="Disponibilité" rows={2} {...editForm.register('disponibilite')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <textarea placeholder="Description" rows={3} {...editForm.register('description')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <PasswordInput placeholder="Nouveau mot de passe (optionnel)" {...editForm.register('password')}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
            <button type="submit" disabled={editForm.formState.isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
              {editForm.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Enregistrer
            </button>
          </form>
        )}
      </Modal>

      {/* Details */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Détails du docteur">
        {viewing && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={viewing.photo} name={`${viewing.user.first_name} ${viewing.user.last_name}`} size="lg" />
              <div>
                <p className="font-medium">Dr. {viewing.user.first_name} {viewing.user.last_name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">{viewing.specialite}</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-400">Numéro d'ordre</dt><dd>{viewing.numero_ordre}</dd></div>
              <div><dt className="text-gray-400">Disponibilité</dt><dd>{viewing.disponibilite || '—'}</dd></div>
              <div><dt className="text-gray-400">Description</dt><dd>{viewing.description || '—'}</dd></div>
              <div><dt className="text-gray-400">Email</dt><dd>{viewing.user.email}</dd></div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Supprimer le docteur"
        message={deleting ? `Supprimer Dr. ${deleting.user.first_name} ${deleting.user.last_name} ? Cette action est irréversible.` : ''}
      />
    </div>
  )
}
