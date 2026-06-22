import api from "./axios";

// Backend: LibrarySettingsController -> /api/libraryadmin/settings
// LibraryDTO: { id, name, address, email, phone, website, status, allocationMode, ... }

export const getMyLibrary = () => api.get("/api/libraryadmin/settings");
export const updateLibrarySettings = (payload) => api.put("/api/libraryadmin/settings", payload);
