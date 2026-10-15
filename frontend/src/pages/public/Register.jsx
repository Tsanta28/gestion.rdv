import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      await login(form.username, form.password)
      navigate('/patient/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : "Erreur lors de l'inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-center text-primary-700">Créer un compte patient</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" value={form.first_name} onChange={(e) => update('first_name', e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
            <input placeholder="Nom" value={form.last_name} onChange={(e) => update('last_name', e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          </div>
          <input placeholder="Nom d'utilisateur" value={form.username} onChange={(e) => update('username', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => update('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => update('password', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg" />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-60">
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400 dark:text-gray-500 mt-6">
          Déjà un compte ? <Link to="/login" className="text-primary-600 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
