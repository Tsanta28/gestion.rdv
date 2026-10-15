import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <header className="px-6 py-5 flex justify-between items-center">
        <p className="font-bold text-primary-700 text-lg">Clinique+</p>
        <div className="space-x-3">
          <Link to="/login" className="text-sm font-medium text-primary-700">Connexion</Link>
          <Link to="/register" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-lg">
            S'inscrire
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 max-w-2xl">
          Prenez rendez-vous avec vos médecins, simplement.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl">
          Une plateforme unique pour les patients, docteurs, secrétaires et
          administrateurs de la clinique.
        </p>
        <Link
          to="/register"
          className="mt-8 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
        >
          Créer un compte patient
        </Link>
      </main>
    </div>
  )
}
