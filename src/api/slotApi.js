import api from "./axios";

// Backend: SlotController -> /api/admin/slot (hasRole LIBRARY_ADMIN)
// SlotDTO: { id, slotName, startTime, endTime, durationHours, planId, planName, libraryId }

export const createSlot = (payload) => api.post("/api/admin/slot", payload);
export const updateSlot = (id, payload) => api.put(`/api/admin/slot/${id}`, payload);
export const deleteSlot = (id) => api.delete(`/api/admin/slot/${id}`);
export const getAllSlots = () => api.get("/api/admin/slot");
export const getSlotsByPlan = (planId) => api.get(`/api/admin/slot/plan/${planId}`);
export const autoGenerateSlots = (planId) => api.post(`/api/admin/slot/auto-generate/${planId}`);
