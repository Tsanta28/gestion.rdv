import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, CalendarCheck, CalendarDays,
  UserCog, UsersRound, Settings, UserCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'

const MENUS = {
  admin: [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: UsersRound },
    { to: '/admin/docteurs', label: 'Docteurs', icon: Stethoscope },
    { to: '/admin/secretaires', label: 'Secrétaires', icon: UserCog },
    { to: '/admin/rendezvous', label: 'Rendez-vous', icon: CalendarCheck, badgeKey: 'en_attente' },
    { to: '/admin/agendas', label: 'Agendas', icon: CalendarDays },
    { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
    { to: '/admin/profil', label: 'Profil', icon: UserCircle },
  ],
  secretaire: [
    { to: '/secretaire/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/secretaire/rendezvous', label: 'Rendez-vous', icon: CalendarCheck, badgeKey: 'en_attente' },
    { to: '/secretaire/patients', label: 'Patients', icon: Users },
    { to: '/secretaire/docteurs', label: 'Docteurs', icon: Stethoscope },
    { to: '/secretaire/agendas', label: 'Agendas', icon: CalendarDays },
    { to: '/secretaire/profil', label: 'Profil', icon: UserCircle },
  ],
  docteur: [
    { to: '/docteur/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/docteur/agenda', label: 'Agenda', icon: CalendarDays },
    { to: '/docteur/rendezvous', label: 'Rendez-vous', icon: CalendarCheck, badgeKey: 'en_attente' },
    { to: '/docteur/patients', label: 'Patients', icon: Users },
    { to: '/docteur/profil', label: 'Profil', icon: UserCircle },
  ],
  patient: [
    { to: '/patient/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/patient/docteurs', label: 'Docteurs', icon: Stethoscope },
    { to: '/patient/rendezvous', label: 'Mes rendez-vous', icon: CalendarCheck, badgeKey: 'en_attente' },
    { to: '/patient/consultations', label: 'Consultations', icon: Users },
    { to: '/patient/agenda', label: 'Agenda', icon: CalendarDays },
    { to: '/patient/profil', label: 'Profil', icon: UserCircle },
  ],
}

export default function Sidebar({ role, collapsed, onToggleCollapse, badgeCount = 0, mobileOpen, onCloseMobile }) {
  const items = MENUS[role] || []

  const content = (
    <>
      <div className="flex items-center justify-between px-2 mb-2">
        {!collapsed && <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Menu</span>}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const badge = item.badgeKey === 'en_attente' && badgeCount > 0 ? badgeCount : null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border-l-4 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-0.5'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {badge && (
                <span className={`ml-auto text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5 ${collapsed ? 'absolute -top-1 -right-1' : ''}`}>
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className={`hidden lg:block shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-[calc(100vh-4rem)] sticky top-16 p-3 transition-all duration-300 ${
          collapsed ? 'w-[76px]' : 'w-60'
        }`}
      >
        {content}
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 p-3 shadow-xl animate-[slideIn_0.2s_ease-out]">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
