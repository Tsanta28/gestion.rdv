import api from './api'

export const getDocteurPatientDetails = (patientId) =>
  api.get(`/docteur/patients/${patientId}/details/`).then((r) => r.data)

export const getPatientMesConsultations = () =>
  api.get('/patient/mes-consultations/').then((r) => r.data)
