import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from './Toast'
import PasswordInput from './PasswordInput'

const schema = z.object({
  old_password: z.string().min(1, 'Ancien mot de passe requis'),
  new_password: z.string().min(6, 'Minimum 6 caractères'),
  confirm_password: z.string().min(6, 'Minimum 6 caractères'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
})

export default function PasswordChangeForm() {
  const { push } = useToast()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      await api.post('/auth/change-password/', {
        old_password: values.old_password,
        new_password: values.new_password,
      })
      push('Mot de passe modifié avec succès ✅', 'success')
      reset()
    } catch (err) {
      push(err.response?.data?.detail || 'Erreur lors du changement de mot de passe.', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <PasswordInput placeholder="Ancien mot de passe" {...register('old_password')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        {errors.old_password && <p className="text-xs text-rose-600 mt-1">{errors.old_password.message}</p>}
      </div>
      <div>
        <PasswordInput placeholder="Nouveau mot de passe" {...register('new_password')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        {errors.new_password && <p className="text-xs text-rose-600 mt-1">{errors.new_password.message}</p>}
      </div>
      <div>
        <PasswordInput placeholder="Confirmer le nouveau mot de passe" {...register('confirm_password')}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent" />
        {errors.confirm_password && <p className="text-xs text-rose-600 mt-1">{errors.confirm_password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-700 text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60">
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        Changer le mot de passe
      </button>
    </form>
  )
}
