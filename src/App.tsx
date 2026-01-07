import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import GradesPage from "./pages/GradesPage";
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


export default function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/about" element={<About />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="*" element={<Home />} />

          {/* Parent Routes */}
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/student/:studentId/grades" element={<GradesPage />} />
          <Route path="/parent/student/:studentId" element={<ParentStudentProfile />} />

          {/* Staff Routes - uses StaffLayout with side panel */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboard />} />
            <Route path="grades" element={<StaffGradesPage />} />
            <Route path="performance" element={<StudentPerformancePage />} />
            <Route path="performance/:studentId" element={<StudentProfile />} />
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
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
    </LanguageProvider>
  );
}