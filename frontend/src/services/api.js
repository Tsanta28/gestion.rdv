import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Endpoints publics : ne jamais y attacher un token (meme perime/invalide),
// sinon un token obsolete en localStorage (ex: apres reinitialisation de la
// base de donnees) fait echouer le login lui-meme avec un 401 avant meme
// que les identifiants ne soient verifies.
const ENDPOINTS_PUBLICS = ['/auth/login/', '/auth/register/', '/auth/refresh/']

api.interceptors.request.use((config) => {
  const estPublic = ENDPOINTS_PUBLICS.some((p) => config.url?.includes(p))
  const token = localStorage.getItem('access')
  if (token && !estPublic) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let queue = []

function processQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const estPublic = ENDPOINTS_PUBLICS.some((p) => originalRequest?.url?.includes(p))
    if (!estPublic && error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        const refresh = localStorage.getItem('refresh')
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh })
        localStorage.setItem('access', data.access)
        processQueue(null, data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export default api
