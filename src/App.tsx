import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admissions from "./pages/Admissions";
import About from "./pages/About";
import Calendar from "./pages/Calendar";
import Contact from "./pages/Contact";
import Financing from "./pages/Financing";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Footer from "./components/Footer";
import ParentDashboard from "./pages/ParentDashboard";
import AccountSettings from "./pages/AccountSettings";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminRegistrationDetails from "./pages/AdminRegistrationDetails";
import ScrollToTop from "./components/ScrollToTop";
import AdminMessages from "./pages/AdminMessages";
import AdminLayout from "./components/AdminLayout";
import StaffLayout from "./pages/StaffLayout";
import StaffGradesPage from "./pages/StaffGradesPage";
import StudentPerformancePage from "./pages/StudentPerformancePage";
import StudentProfile from "./pages/StudentProfile";
import ParentStudentProfile from "./pages/ParentStudentProfile";
import AdminManageAccounts from "./pages/AdminManageAccounts";
import AdminParentProfile from "./pages/AdminParentProfile";
import ComingSoon from "./pages/ComingSoon";
import ParentLayout from "./components/ParentLayout";
import ParentNoticesPage from "./pages/ParentNoticesPage";
import ParentChildrenPage from "./pages/ParentChildrenPage";
import StaffNoticesPage from "./pages/StaffNoticesPage";



export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Home />} />
            
            {/* Public Routes */}
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/about" element={<About />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            {/* Parent Routes - uses ParentLayout with side panel */}
            <Route path="/parent" element={<ParentLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="notices" element={<ParentNoticesPage />} />
              <Route path="children" element={<ParentChildrenPage />} /> {/* Create this page */}
              <Route path="student/:studentId" element={<ParentStudentProfile />} />
              <Route path="account" element={<AccountSettings />} />
            </Route>

            {/* Legacy parent routes - redirect to new layout */}
            <Route path="/parent-dashboard" element={<Navigate to="/parent" replace />} />
            <Route path="/student/:studentId/grades" element={<Navigate to="/parent/student/:studentId" replace />} />

            {/* Staff Routes - uses StaffLayout with side panel */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="grades" element={<StaffGradesPage />} />
              <Route path="performance" element={<StudentPerformancePage />} />
              <Route path="performance/:studentId" element={<StudentProfile />} />
              <Route path="notices" element={<StaffNoticesPage />} />
              <Route path="account" element={<AccountSettings />} />
            </Route>

            {/* Admin Routes - uses AdminLayout with side panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="registrations/:id" element={<AdminRegistrationDetails />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="parents" element={<>Parents Page - TODO</>} />
              <Route path="staff" element={<>Staff Management - TODO</>} />
              <Route path="settings" element={<>System Settings - TODO</>} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="manage-accounts" element={<AdminManageAccounts />} />
              <Route path="parents/:parentId" element={<AdminParentProfile />} />
            </Route>

            {/* Fallback account route for parents and other roles */}
            <Route path="/account" element={<AccountSettings />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}