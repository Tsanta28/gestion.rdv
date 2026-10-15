import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/authService'
import api from '../services/api'

const AuthContext = createContext(null)

async function fetchProfilePhoto(role) {
  try {
    if (role === 'docteur') {
      const { data } = await api.get('/docteurs/me/')
      return data.photo || null
    }
    if (role === 'patient') {
      const { data } = await api.get('/patients/me/')
      return data.photo || null
    }
  } catch {
    return null
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshPhoto = useCallback(async (role) => {
    const url = await fetchProfilePhoto(role)
    setPhoto(url)
  }, [])

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('access')
      if (token) {
        try {
          const me = await authService.fetchMe()
          setUser(me)
          localStorage.setItem('user', JSON.stringify(me))
          refreshPhoto(me.role)
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(username, password) {
    const data = await authService.login(username, password)
    setUser(data.user)
    refreshPhoto(data.user.role)
    return data.user
  }

  async function logout() {
    await authService.logout()
    setUser(null)
    setPhoto(null)
  }

  const value = { user, role: user?.role, photo, refreshPhoto, loading, login, logout, setUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider')
  return ctx
}
