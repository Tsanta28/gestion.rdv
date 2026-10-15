import api from './api'

function toFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    fd.append(key, value)
  })
  return fd
}

export const listPatients = (params = {}) => api.get('/patients/', { params }).then((r) => r.data)
export const getMyPatientProfile = () => api.get('/patients/me/').then((r) => r.data)

export const updateMyPatientProfile = (payload) => {
  const hasFile = payload.photo instanceof File
  const body = hasFile ? toFormData(payload) : payload
  return api.put('/patients/me/', body).then((r) => r.data)
}

export const createPatient = (payload) => api.post('/patients/', payload).then((r) => r.data)

export const updatePatient = (id, payload) => {
  const hasFile = payload.photo instanceof File
  const body = hasFile ? toFormData(payload) : payload
  return api.put(`/patients/${id}/`, body).then((r) => r.data)
}

export const deletePatient = (id) => api.delete(`/patients/${id}/`)
