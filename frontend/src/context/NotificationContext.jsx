import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService'

const NotificationContext = createContext(null)
const POLL_INTERVAL_MS = 20000

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  const refresh = useCallback(() => {
    if (!user) return
    // L'API renvoie une reponse paginee ({results: [...]}) : il faut la
    // depaqueter, sinon `notifications` devient un objet et tout appel a
    // .filter()/.map() plus bas plante (et fait disparaitre toute l'appli,
    // puisque ce contexte englobe App entier).
    listNotifications()
      .then((data) => setNotifications(data.results ?? data))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }
    refresh()
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [user, refresh])

  async function markRead(id) {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, lu: true } : n)))
    try {
      await markNotificationRead(id)
    } catch {
      refresh()
    }
  }

  async function markAllRead() {
    setNotifications((list) => list.map((n) => ({ ...n, lu: true })))
    try {
      await markAllNotificationsRead()
    } catch {
      refresh()
    }
  }

  const unreadCount = notifications.filter((n) => !n.lu).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications doit etre utilise dans un NotificationProvider')
  return ctx
}
