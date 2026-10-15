import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateMe } from '../../services/authService'
import { getMyDoctorProfile, updateMyDoctorProfile } from '../../services/doctorService'
import PhotoUploader from '../../components/PhotoUploader'
import PasswordChangeForm from '../../components/PasswordChangeForm'
import SpecialtyCombobox from '../../components/SpecialtyCombobox'
import ToggleSwitch from '../../components/ToggleSwitch'
import WeeklyScheduleEditor from '../../components/WeeklyScheduleEditor'
import Loader from '../../components/Loader'
import { useToast } from '../../components/Toast'

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialite: z.string().optional(),
  description: z.string().optional(),
  disponibilite: z.string().optional(),
  photo: z.any().optional(),
})

export default function DocteurProfile() {
  const { user, setUser, refreshPhoto } = useAuth()
  const [docteurData, setDocteurData] = useState(null)
  const [estDisponible, setEstDisponible] = useState(true)
  const [planning, setPlanning] = useState({})
  const [savingStatus, setSavingStatus] = useState(false)
  const { push } = useToast()

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  function load() {
    getMyDoctorProfile().then((data) => {
      setDocteurData(data)
      setEstDisponible(data.est_disponible)
      setPlanning(data.disponibilites || {})
      reset({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        email: data.user.email,
        phone: data.user.phone,
        address: data.user.address,
        specialite: data.specialite || '',
        description: data.description || '',
        disponibilite: data.disponibilite || '',
      })
    })
  }
  useEffect(load, [reset])

  async function handleToggleDisponible(value) {
    setEstDisponible(value)
    setSavingStatus(true)
    try {
      await updateMyDoctorProfile({ est_disponible: value })
      push(value ? 'Statut mis à jour : disponible ✅' : 'Statut mis à jour : indisponible', 'success')
    } catch {
      push('Erreur lors de la mise à jour du statut.', 'error')
      setEstDisponible(!value)
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleSavePlanning() {
    try {
      await updateMyDoctorProfile({ disponibilites: planning })
      push('Planning mis à jour avec succès ✅', 'success')
    } catch {
      push('Erreur lors de la mise à jour du planning.', 'error')
    }
  }

  async function onSubmit(values) {
    try {
      await updateMe({
        first_name: values.first_name, last_name: values.last_name,
        email: values.email, phone: values.phone, address: values.address,
      })
      const payload = {
        first_name: values.first_name, last_name: values.last_name, phone: values.phone,
        specialite: values.specialite, description: values.description, disponibilite: values.disponibilite,
      }
      if (values.photo instanceof File) payload.photo = values.photo
      await updateMyDoctorProfile(payload)
      setUser((u) => ({ ...u, first_name: values.first_name, last_name: values.last_name, email: values.email }))
      refreshPhoto('docteur')
      push('Profil mis à jour avec succès ✅', 'success')
    } catch {
      push('Erreur lors de la mise à jour du profil.', 'error')
    }
  }

  if (!docteurData) return <Loader />

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <div className="flex items-center gap-2">
          {savingStatus && <Loader2 size={14} className="animate-spin text-gray-400" />}
          <ToggleSwitch checked={estDisponible} onChange={handleToggleDisponible} labelOn="Disponible" labelOff="Indisponible" />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-4">
        Ce statut est visible par les patients et la secrétaire sur votre fiche.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <PhotoUploader value={field.value ?? docteurData.photo} onChange={field.onChange} name={`${user?.first_name} ${user?.last_name}`} />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Prénom" {...register('first_name')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input placeholder="Nom" {...register('last_name')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        </div>
        <input type="email" placeholder="Email" {...register('email')} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Téléphone" {...register('phone')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input placeholder="Adresse" {...register('address')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        </div>

        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 pt-2">Informations professionnelles</h2>
        <Controller
          control={control}
          name="specialite"
          render={({ field }) => <SpecialtyCombobox value={field.value} onChange={field.onChange} />}
        />
        <textarea placeholder="Disponibilité (résumé affiché aux patients, ex : Lun-Ven 08h-17h, Sam 09h-12h)" rows={2} {...register('disponibilite')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        <textarea placeholder="Description (parcours, approche...)" rows={3} {...register('description')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />

        <button type="submit" disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Enregistrer
        </button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Horaires de travail</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Ce planning détaillé n'est visible que par vous-même et par la secrétaire ; il sert à calculer vos créneaux disponibles.
        </p>
        <WeeklyScheduleEditor value={planning} onChange={setPlanning} />
        <button onClick={handleSavePlanning}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
          Enregistrer le planning
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-3">Changer le mot de passe</h2>
        <PasswordChangeForm />
      </div>
    </div>
  )
}
