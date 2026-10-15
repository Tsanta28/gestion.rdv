import api from './api'

export const listAppointments = (params = {}) => api.get('/rendezvous/', { params }).then((r) => r.data)
export const createAppointment = (payload) => api.post('/rendezvous/', payload).then((r) => r.data)
export const updateAppointmentStatus = (id, statut, notes_docteur) =>
  api.patch(`/rendezvous/${id}/statut/`, { statut, notes_docteur }).then((r) => r.data)
export const getAvailability = (docteurId, date) =>
  api.get('/rendezvous/disponibles/', { params: { docteur: docteurId, date } }).then((r) => r.data)
export const deleteAppointment = (id) => api.delete(`/rendezvous/${id}/`)

// Workflow de negociation
export const accepterDemande = (id) => api.patch(`/rendezvous/${id}/accepter/`).then((r) => r.data)
export const refuserDemande = (id) => api.patch(`/rendezvous/${id}/refuser/`).then((r) => r.data)
export const proposerCreneaux = (id, creneaux) =>
  api.post(`/rendezvous/${id}/proposer-creneau/`, { creneaux }).then((r) => r.data)
export const accepterProposition = (id, propositionId) =>
  api.patch(`/rendezvous/${id}/accepter-proposition/${propositionId}/`).then((r) => r.data)
export const reassignerDocteur = (id, docteurId, dateHeure) =>
  api.patch(`/rendezvous/${id}/reassigner/`, { docteur_id: docteurId, date_heure: dateHeure || undefined }).then((r) => r.data)

// Consultation
export const getConsultation = (rdvId) => api.get(`/rendezvous/${rdvId}/consultation/`).then((r) => r.data)
export const saveConsultation = (rdvId, payload) =>
  api.post(`/rendezvous/${rdvId}/consultation/`, payload).then((r) => r.data)
