import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminSidebar from "./components/AdminSidebar";
import AdminLayout from "./components/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/about" element={<About />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="*" element={<Home />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/student/:studentId/grades" element={<GradesPage />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/registrations/:id" element={<AdminRegistrationDetails />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route
            path="/admin/registrations"
            element={
              <AdminLayout>
                <AdminRegistrations />
              </AdminLayout>
            }
          />




        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}