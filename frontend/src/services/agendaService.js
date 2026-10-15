import api from './api'

export const getAgendaDocteur = (docteurId, params = {}) =>
  api.get(`/agenda/docteur/${docteurId}/`, { params }).then((r) => r.data)

export const getAgendaTous = (params = {}) =>
  api.get('/agenda/tous/', { params }).then((r) => r.data)

export const getAgendaPatient = (params = {}) =>
  api.get('/agenda/patient/', { params }).then((r) => r.data)
