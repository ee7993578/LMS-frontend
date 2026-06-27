import api from "./axios";
export const getLibraryAuditLog = () => api.get("/api/libraryadmin/audit-log");
export const getSuperAuditLog   = () => api.get("/api/superadmin/audit-log");
