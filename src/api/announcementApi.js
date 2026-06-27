import api from "./axios";
export const getMyAnnouncements     = ()     => api.get("/api/libraryadmin/announcements");
export const getStudentAnnouncements= ()     => api.get("/api/student/announcements");
export const getAllAnnouncements     = ()     => api.get("/api/superadmin/announcements");
export const createAnnouncement     = (body) => api.post("/api/superadmin/announcements", body);
export const deactivateAnnouncement = (id)   => api.put(`/api/superadmin/announcements/${id}/deactivate`);
export const deleteAnnouncement     = (id)   => api.delete(`/api/superadmin/announcements/${id}`);
