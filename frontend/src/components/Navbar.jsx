import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Bell, LogOut, UserCircle, Settings, Search, Stethoscope, User, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { listDoctors } from '../services/doctorService'
import { listPatients } from '../services/patientService'
import { listAppointments } from '../services/appointmentService'
import Avatar from './Avatar'

export default function Navbar({ onToggleMobileMenu, pendingCount = 0 }) {
  const { user, role, photo, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ docteurs: [], patients: [], rdvs: [] })
  const [activeIndex, setActiveIndex] = useState(-1)
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setQuery('')
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setActiveIndex(-1)
    if (query.trim().length < 2) {
      setResults({ docteurs: [], patients: [], rdvs: [] })
      return
    }
    const t = setTimeout(async () => {
      const q = query.toLowerCase()
      try {
        const docs = await listDoctors().catch(() => [])
        const docList = (docs.results ?? docs ?? []).filter((d) =>
          `${d.user.first_name} ${d.user.last_name} ${d.specialite}`.toLowerCase().includes(q)
        ).slice(0, 4)

        let patList = []
        if (['admin', 'secretaire', 'docteur'].includes(role)) {
          const pats = await listPatients().catch(() => [])
          patList = (pats.results ?? pats ?? []).filter((p) =>
            `${p.user.first_name} ${p.user.last_name} ${p.user.email}`.toLowerCase().includes(q)
          ).slice(0, 4)
        }

        let rdvList = []
        if (['admin', 'secretaire', 'docteur', 'patient'].includes(role)) {
          const rdvs = await listAppointments().catch(() => [])
          rdvList = (rdvs.results ?? rdvs ?? []).filter((r) =>
            `${r.patient?.user?.first_name} ${r.patient?.user?.last_name} ${r.docteur?.user?.last_name} ${r.motif}`
              .toLowerCase().includes(q)
          ).slice(0, 3)
        }

        setResults({ docteurs: docList, patients: patList, rdvs: rdvList })
      } catch {
        setResults({ docteurs: [], patients: [], rdvs: [] })
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, role])

  const flatResults = useMemo(() => {
    const items = []
    results.patients.forEach((p) => items.push({ type: 'patient', data: p }))
    results.docteurs.forEach((d) => items.push({ type: 'docteur', data: d }))
    results.rdvs.forEach((r) => items.push({ type: 'rdv', data: r }))
    return items
  }, [results])

  function goToResult(item) {
    setQuery('')
    if (item.type === 'patient') {
      const patientId = item.data.id
      const userId = item.data.user.id
      if (role === 'admin') navigate(`/admin/utilisateurs?view=${userId}`)
      else if (role === 'secretaire') navigate(`/secretaire/patients?view=${patientId}`)
      else if (role === 'docteur') navigate(`/docteur/patients/${patientId}`)
    } else if (item.type === 'docteur') {
      const id = item.data.id
      if (role === 'admin') navigate(`/admin/docteurs?view=${id}`)
      else if (role === 'secretaire') navigate(`/secretaire/docteurs?view=${id}`)
      else if (role === 'patient') navigate(`/patient/docteurs/${id}`)
    } else if (item.type === 'rdv') {
      navigate(`/${role}/rendezvous?view=${item.data.id}`)
    }
  }

  function handleKeyDown(e) {
    if (flatResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      goToResult(flatResults[activeIndex])
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
  const hasResults = flatResults.length > 0

  return (
    <header className="h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggleMobileMenu} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu size={20} />
        </button>
        <Link to={role ? `/${role}/dashboard` : '/'} className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
            <Stethoscope size={16} />
          </span>
          <span className="font-bold text-primary-700 dark:text-primary-300 hidden sm:inline">Clinique+</span>
        </Link>
      </div>

      {/* Recherche globale */}
      <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un patient, un docteur, un RDV..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {query.length >= 2 && hasResults && (
          <div className="absolute mt-1 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden text-sm z-30">
            <ul className="max-h-80 overflow-y-auto">
              {flatResults.map((item, i) => {
                const isActive = i === activeIndex
                const Icon = item.type === 'patient' ? User : item.type === 'docteur' ? Stethoscope : CalendarCheck
                const label = item.type === 'patient'
                  ? `${item.data.user.first_name} ${item.data.user.last_name}`
                  : item.type === 'docteur'
                    ? `Dr. ${item.data.user.first_name} ${item.data.user.last_name} — ${item.data.specialite}`
                    : `${item.data.patient?.user?.first_name} ${item.data.patient?.user?.last_name} avec Dr. ${item.data.docteur?.user?.last_name}`
                return (
                  <li key={`${item.type}-${item.data.id}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goToResult(item)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer ${
                        isActive ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={15} className="text-primary-500 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => { navigate(`/${role}/dashboard`); setQuery('') }}
              className="w-full text-center text-xs text-primary-600 dark:text-primary-400 py-2 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Voir tous les résultats
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Basculer le thème"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg p-3 text-sm">
              {pendingCount > 0 ? (
                <p>{pendingCount} rendez-vous nécessite{pendingCount > 1 ? 'nt' : ''} votre attention.</p>
              ) : (
                <p className="text-gray-400">Aucune notification.</p>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2">
            <Avatar src={photo} name={fullName} size="md" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{fullName}</p>
              <p className="text-xs text-gray-400 capitalize leading-tight">{role}</p>
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 text-sm z-30">
              <Link to={`/${role}/profil`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                <UserCircle size={16} /> Profil
              </Link>
              {role === 'admin' && (
                <Link to="/admin/parametres" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Settings size={16} /> Paramètres
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
