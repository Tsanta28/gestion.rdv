import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateMe } from '../../services/authService'
import Avatar from '../../components/Avatar'
import PasswordChangeForm from '../../components/PasswordChangeForm'
import { useToast } from '../../components/Toast'

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export default function SecretaireProfile() {
  const { user, setUser } = useAuth()
  const { push } = useToast()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name, last_name: user.last_name,
        email: user.email, phone: user.phone, address: user.address,
      })
    }
  }, [user, reset])

  async function onSubmit(values) {
    try {
      await updateMe(values)
      setUser((u) => ({ ...u, ...values }))
      push('Profil mis à jour avec succès ✅', 'success')
    } catch {
      push('Erreur lors de la mise à jour du profil.', 'error')
    }
  }

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={fullName} size="lg" />
          <p className="text-xs text-gray-400">La photo de profil n'est pas disponible pour ce rôle.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Prénom" {...register('first_name')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input placeholder="Nom" {...register('last_name')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        </div>
        <input type="email" placeholder="Email" {...register('email')} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Téléphone" {...register('phone')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
          <input placeholder="Adresse" {...register('address')} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        </div>
        <button type="submit" disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Enregistrer
        </button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="font-semibold mb-3">Changer le mot de passe</h2>
        <PasswordChangeForm />
      </div>
    </div>
  )
}
