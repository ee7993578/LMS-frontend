import api from "./axios";

// ---- Seat CRUD ----
export const createSeat = (payload) => api.post("/api/admin/seat/create", payload);
export const updateSeat = (id, payload) => api.put(`/api/admin/seat/update/${id}`, payload);
export const deleteSeat = (id) => api.delete(`/api/admin/seat/delete/${id}`);
export const getAllSeats = () => api.get("/api/admin/seat/all");
export const getSeatById = (id) => api.get(`/api/admin/seat/${id}`);
export const searchSeats = (keyword) => api.get("/api/admin/seat/search", { params: { keyword } });

// ---- Legacy allotment ----
export const allotSeat = (studentId, seatId, planId) =>
  api.put("/api/admin/seat/allotment", null, { params: { studentId, seatId, planId } });
export const deallocateSeat = (studentId) =>
  api.put(`/api/admin/seat/deallocate/${studentId}`);

// ---- Fixed-hour allocation ----
export const allocateFixed = (studentId, seatId, planId, slotId) =>
  api.post("/api/admin/seat/allocate/fixed", null, {
    params: { studentId, seatId, planId, slotId },
  });

// ---- Flexible-hour allocation ----
export const allocateFlexible = (studentId, seatId, planId, startTime, endTime) =>
  api.post("/api/admin/seat/allocate/flexible", null, {
    params: { studentId, seatId, planId, startTime, endTime },
  });

// ---- Availability ----
export const getAvailableSeatsForSlot = (slotId) =>
  api.get(`/api/admin/seat/available/slot/${slotId}`);
export const getAvailableSeatsForFlex = (startTime, endTime) =>
  api.get("/api/admin/seat/available/flex", { params: { startTime, endTime } });

// ---- Allocation management ----
export const getActiveAllocations = () => api.get("/api/admin/seat/allocations/active");
export const getAllocationHistory = () => api.get("/api/admin/seat/allocations/history");
export const deallocateByAllocationId = (id) =>
  api.put(`/api/admin/seat/allocations/${id}/deallocate`);

// ---- Seat-specific allocations (who is allocated and when) ----
export const getSeatAllocations = (seatId) =>
  api.get(`/api/admin/seat/${seatId}/allocations`);
