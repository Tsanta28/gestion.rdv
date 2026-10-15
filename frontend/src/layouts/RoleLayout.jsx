import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { listAppointments } from '../services/appointmentService'

export default function RoleLayout() {
  const { role } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Statuts qui necessitent une action de la part de l'utilisateur connecte :
    // - docteur/admin/secretaire : nouvelles demandes et RDV en_attente
    // - patient : propositions de creneaux recues a confirmer
    const statutsParRole = {
      admin: 'demande_envoyee,en_attente',
      secretaire: 'demande_envoyee,en_attente',
      docteur: 'demande_envoyee',
      patient: 'proposition_envoyee',
    }
    const statut = statutsParRole[role]
    if (statut) {
      listAppointments({ statut })
        .then((data) => setPendingCount((data.results ?? data).length))
        .catch(() => {})
    }
  }, [role])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onToggleMobileMenu={() => setMobileOpen((o) => !o)} pendingCount={pendingCount} />
      <div className="flex">
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          badgeCount={pendingCount}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
