import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { SUPERADMIN_NAV, LIBRARY_ADMIN_NAV, STUDENT_NAV } from "./components/layout/navConfig";

// Landing
import PublicLayout from "./pages/landing/PublicLayout";
import Home from "./pages/landing/Home";
import FeaturesPage from "./pages/landing/FeaturesPage";
import PricingPage from "./pages/landing/PricingPage";
import TestimonialsPage from "./pages/landing/TestimonialsPage";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";
import FAQPage from "./pages/landing/FAQPage";
import Blog from "./pages/landing/Blog";
import Terms from "./pages/landing/Terms";
import Privacy from "./pages/landing/Privacy";

// Auth
import Login from "./pages/auth/Login";
import RegisterLibrary from "./pages/auth/RegisterLibrary";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OtpVerification from "./pages/auth/OtpVerification";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFactorAuth from "./pages/auth/TwoFactorAuth";
import SessionExpired from "./pages/auth/SessionExpired";

// Super Admin
import SuperAdminOverview from "./pages/superadmin/SuperAdminOverview";
import Libraries from "./pages/superadmin/Libraries";
import SuperAdminPlans from "./pages/superadmin/SuperAdminPlans";
import Billing from "./pages/superadmin/Billing";
import SuperAdminSettings from "./pages/superadmin/SuperAdminSettings";

// Library Admin
import LibraryAdminOverview from "./pages/libraryadmin/LibraryAdminOverview";
import Students from "./pages/libraryadmin/Students";
import SeatMap from "./pages/libraryadmin/SeatMap";
import SeatAllocation from "./pages/libraryadmin/SeatAllocation";
import ActiveAllocations from "./pages/libraryadmin/ActiveAllocations";
import SlotManagement from "./pages/libraryadmin/SlotManagement";
import AttendanceManagement from "./pages/libraryadmin/AttendanceManagement";
import FeeManagement from "./pages/libraryadmin/FeeManagement";
import PaymentSettings from "./pages/libraryadmin/PaymentSettings";
import PaymentVerification from "./pages/libraryadmin/PaymentVerification";
import Plans from "./pages/libraryadmin/Plans";
import Reports from "./pages/libraryadmin/Reports";
import QrAttendance from "./pages/libraryadmin/QrAttendance";
import LibraryAdminSettings from "./pages/libraryadmin/LibraryAdminSettings";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import PunchInOut from "./pages/student/PunchInOut";
import MyAttendance from "./pages/student/MyAttendance";
import FeeStatus from "./pages/student/FeeStatus";
import Deposit from "./pages/student/Deposit";
import PaymentProof from "./pages/student/PaymentProof";
import MySeat from "./pages/student/MySeat";
import Leaderboard from "./pages/student/Leaderboard";
import StudentProfile from "./pages/student/StudentProfile";
import TodoList from "./pages/student/TodoList";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            containerStyle={{ top: 76, right: 16 }}
            toastOptions={{
              style: {
                background: "#1a1d2e",
                color: "#e7eaf6",
                border: "1px solid rgba(99,102,241,0.2)",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#1a1d2e" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#1a1d2e" } },
            }}
          />
          <Routes>
            {/* Landing */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register-library" element={<RegisterLibrary />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/two-factor" element={<TwoFactorAuth />} />
            <Route path="/session-expired" element={<SessionExpired />} />

            {/* Super Admin */}
            <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
              <Route element={<DashboardLayout navItems={SUPERADMIN_NAV} role="SUPERADMIN" title="Super Admin" />}>
                <Route path="/superadmin" element={<SuperAdminOverview />} />
                <Route path="/superadmin/libraries" element={<Libraries />} />
                <Route path="/superadmin/plans" element={<SuperAdminPlans />} />
                <Route path="/superadmin/billing" element={<Billing />} />
                <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
              </Route>
            </Route>

            {/* Library Admin */}
            <Route element={<ProtectedRoute allowedRoles={["LIBRARY_ADMIN"]} />}>
              <Route element={<DashboardLayout navItems={LIBRARY_ADMIN_NAV} role="LIBRARY_ADMIN" title="Library Admin" />}>
                <Route path="/admin" element={<LibraryAdminOverview />} />
                <Route path="/admin/students" element={<Students />} />
                <Route path="/admin/seats" element={<SeatMap />} />
                <Route path="/admin/allocate" element={<SeatAllocation />} />
                <Route path="/admin/allocations" element={<ActiveAllocations />} />
                <Route path="/admin/slots" element={<SlotManagement />} />
                <Route path="/admin/attendance" element={<AttendanceManagement />} />
                <Route path="/admin/fees" element={<FeeManagement />} />
                <Route path="/admin/payment" element={<PaymentSettings />} />
                <Route path="/admin/payment-verification" element={<PaymentVerification />} />
                <Route path="/admin/plans" element={<Plans />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/qr" element={<QrAttendance />} />
                <Route path="/admin/settings" element={<LibraryAdminSettings />} />
              </Route>
            </Route>

            {/* Student */}
            <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
              <Route element={<DashboardLayout navItems={STUDENT_NAV} role="STUDENT" title="My Dashboard" />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/punch" element={<PunchInOut />} />
                <Route path="/student/attendance" element={<MyAttendance />} />
                <Route path="/student/fees" element={<FeeStatus />} />
                <Route path="/student/deposit" element={<Deposit />} />
                <Route path="/student/payment-proof" element={<PaymentProof />} />
                <Route path="/student/seat" element={<MySeat />} />
                <Route path="/student/leaderboard" element={<Leaderboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/todo" element={<TodoList />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
