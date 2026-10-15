import api from './api'

export async function login(username, password) {
  const { data } = await api.post('/auth/login/', { username, password })
  localStorage.setItem('access', data.access)
  localStorage.setItem('refresh', data.refresh)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register/', payload)
  return data
}

export async function logout() {
  const refresh = localStorage.getItem('refresh')
  try {
    if (refresh) await api.post('/auth/logout/', { refresh })
  } finally {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
  }
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me/')
  return data
}

export async function updateMe(payload) {
  const { data } = await api.put('/auth/me/', payload)
  localStorage.setItem('user', JSON.stringify(data))
  return data
}
