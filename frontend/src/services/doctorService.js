import api from './api'

export const listDoctors = (params = {}) => api.get('/docteurs/', { params }).then((r) => r.data)
export const getDoctor = (id) => api.get(`/docteurs/${id}/`).then((r) => r.data)

function toFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (key === 'disponibilites' && typeof value === 'object') {
      fd.append(key, JSON.stringify(value))
    } else {
      fd.append(key, value)
    }
  })
  return fd
}

export const createDoctor = (payload) => {
  const hasFile = payload.photo instanceof File
  const body = hasFile ? toFormData(payload) : payload
  return api.post('/docteurs/', body).then((r) => r.data)
}

export const updateDoctor = (id, payload) => {
  const hasFile = payload.photo instanceof File
  const body = hasFile ? toFormData(payload) : payload
  return api.put(`/docteurs/${id}/`, body).then((r) => r.data)
}

export const deleteDoctor = (id) => api.delete(`/docteurs/${id}/`)

export const getMyDoctorProfile = () => api.get('/docteurs/me/').then((r) => r.data)
export const updateMyDoctorProfile = (payload) => {
  const hasFile = payload.photo instanceof File
  const body = hasFile ? toFormData(payload) : payload
  return api.put('/docteurs/me/', body).then((r) => r.data)
}

export const getCreneauxLibres = (docteurId, date) =>
  api.get(`/docteurs/${docteurId}/creneaux-libres/`, { params: { date } }).then((r) => r.data)
