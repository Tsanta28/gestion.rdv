import api from './api'

export const listNotifications = () => api.get('/notifications/').then((r) => r.data)
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/lue/`).then((r) => r.data)
export const markAllNotificationsRead = () => api.patch('/notifications/tout-lire/')
