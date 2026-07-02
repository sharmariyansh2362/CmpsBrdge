import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPassword from "./pages/auth/ForgotPassword";


import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Shell } from "./Components/layout/Shell";
import "./App.css";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
// Shared Pages
import AnnouncementsPage from "./pages/shared/AnnouncementsPage";
import ChannelsPage from "./pages/shared/ChannelsPage";
import LostFoundPage from "./pages/shared/LostFoundPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentProfile from "./pages/student/StudentProfile";
import StudentApplications from "./pages/student/StudentApplications";

// Faculty Pages
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCourses from "./pages/faculty/FacultyCourses";
import FacultyStudents from "./pages/faculty/FacultyStudents";
import FacultyProfile from "./pages/faculty/FacultyProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminLogs from "./pages/admin/AdminLogs";

// ─── Route Guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ allowedRole }) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
}

// ─── Loading Screen while session restores ────────────────────────────────────
function AppLoadingScreen() {
  const { loading } = useApp();
  if (!loading) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#F3F1FF", zIndex: 9999,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, #6C5CE7, #8B7FFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontSize: 24,
        }}>🎓</div>
        <div style={{ fontSize: 14, color: "#6C5CE7", fontWeight: 700 }}>Loading Campus Bridge…</div>
      </div>
    </div>
  );
}

// ─── Layout Wrapper ────────────────────────────────────────────────────────────
function AppLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

// ─── Fallback Redirect Handler ───────────────────────────────────────────────
function FallbackRedirect() {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <AppLoadingScreen />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Role Routes */}
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route element={<AppLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/announcements" element={<AnnouncementsPage />} />
              <Route path="/student/courses" element={<StudentCourses />} />
              <Route path="/student/channels" element={<ChannelsPage />} />
              <Route path="/student/lost-found" element={<LostFoundPage />} />
              <Route path="/student/applications" element={<StudentApplications />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Faculty Role Routes */}
          <Route element={<ProtectedRoute allowedRole="faculty" />}>
            <Route element={<AppLayout />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/announcements" element={<AnnouncementsPage />} />
              <Route path="/faculty/courses" element={<FacultyCourses />} />
              <Route path="/faculty/students" element={<FacultyStudents />} />
              <Route path="/faculty/channels" element={<ChannelsPage />} />
              <Route path="/faculty/lost-found" element={<LostFoundPage />} />
              <Route path="/faculty/profile" element={<FacultyProfile />} />
            </Route>
          </Route>

          {/* Admin Role Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/channels" element={<ChannelsPage />} />
              <Route path="/admin/lost-found" element={<LostFoundPage />} />
              <Route path="/admin/announcements" element={<AnnouncementsPage />} />
            </Route>
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<FallbackRedirect />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

