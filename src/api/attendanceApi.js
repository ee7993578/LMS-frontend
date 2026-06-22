import api from "./axios";

// Backend: AttendanceController -> /api/attendance
// AttendanceDTO: { id, studentId, studentName, libraryId, libraryName, attendanceDate,
//                  attendanceStatus, shiftStart, shiftEnd, totalStudyMinutes, totalBreakMinutes }
// AttendanceStatus enum: IN | OUT

export const punch = () => api.post("/api/attendance/student/punch");
export const punchWithQR = (qrValue) =>
  api.post("/api/attendance/student/qrpunch", null, { params: { qrValue } });

export const getAttendanceByStudentAndDate = (studentId, date) =>
  api.get(`/api/attendance/student/${studentId}`, { params: { date } });

// hasRole LIBRARY_ADMIN
export const getLibraryAttendanceByDate = (date) =>
  api.get("/api/attendance/library", { params: { date } });

export const getAttendanceByDateRange = (startDate, endDate) =>
  api.get("/api/attendance/student/range", { params: { startDate, endDate } });

export const getMonthAttendance = () => api.get("/api/attendance/student/month");
