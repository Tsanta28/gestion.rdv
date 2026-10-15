import { createContext, useCallback, useContext } from 'react'
import toast from 'react-hot-toast'

// Fine couche au-dessus de react-hot-toast, pour garder la meme API
// (push(message, type)) utilisee dans le reste de l'application.
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const push = useCallback((message, type = 'info') => {
    if (type === 'success') toast.success(message)
    else if (type === 'error') toast.error(message)
    else toast(message)
  }, [])

  return <ToastContext.Provider value={{ push }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit etre utilise dans un ToastProvider')
  return ctx
}
