import api from "./axios";
export const getMyNotifications    = ()    => api.get("/api/notifications");
export const getUnreadCount        = ()    => api.get("/api/notifications/unread-count");
export const markRead              = (id)  => api.put(`/api/notifications/${id}/read`);
export const markAllRead           = ()    => api.put("/api/notifications/mark-all-read");
export const archiveNotification   = (id)  => api.put(`/api/notifications/${id}/archive`);
