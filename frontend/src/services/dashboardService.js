import api from './api'

export const getDashboard = (role) => api.get(`/dashboard/${role}/`).then((r) => r.data)
export const getAdminStats = () => api.get('/admin/stats/').then((r) => r.data)
export const listUsers = (params = {}) => api.get('/admin/utilisateurs/', { params }).then((r) => r.data)
export const toggleUserActive = (id) => api.patch(`/admin/utilisateurs/${id}/activer/`).then((r) => r.data)
export const createUser = (payload) => api.post('/admin/utilisateurs/', payload).then((r) => r.data)
export const updateUser = (id, payload) => api.put(`/admin/utilisateurs/${id}/`, payload).then((r) => r.data)
export const deleteUser = (id) => api.delete(`/admin/utilisateurs/${id}/`)
