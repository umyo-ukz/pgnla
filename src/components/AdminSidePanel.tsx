// components/AdminSidePanel.tsx
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

export default function AdminSidePanel() {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  if (!user || user.role !== "admin") return null;

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always expanded
      if (!mobile) {
        setIsExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile panel when route changes
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [location.pathname, isMobile]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
     ${isActive
      ? "bg-primary-red text-white"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  // Mobile toggle button
  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button - Fixed at top */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-red flex items-center justify-center">
                <i className="fas fa-user-shield text-white text-sm"></i>
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-500`}></i>
          </button>

          {/* Mobile Navigation Dropdown */}
          {isExpanded && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <nav className="p-3 space-y-1">
                <NavLink
                  to="/admin"
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/admin/registrations"
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-clipboard-list w-5"></i>
                  <span>Registrations</span>
                </NavLink>

                <NavLink
                  to="/admin/messages"
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-envelope w-5"></i>
                  <span>Messages</span>
                </NavLink>

                <NavLink
                  to="/admin/students"
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-users w-5"></i>
                  <span>Students</span>
                </NavLink>

                <NavLink
                  to="/admin/account"
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>Account Settings</span>
                </NavLink>

                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    setIsExpanded(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <i className="fas fa-sign-out-alt w-5"></i>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop Side Panel
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 sticky top-16 hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-red">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500">
          Pequeños Gigantes
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/admin" className={linkClass}>
          <i className="fas fa-chart-line w-5"></i>
          Dashboard
        </NavLink>

        <NavLink to="/admin/registrations" className={linkClass}>
          <i className="fas fa-clipboard-list w-5"></i>
          Registrations
        </NavLink>

        <NavLink to="/admin/manage-accounts" className={linkClass}>
          <i className="fas fa-user-cog w-5"></i>
          Manage Accounts
        </NavLink>

        <NavLink to="/admin/messages" className={linkClass}>
          <i className="fas fa-envelope w-5"></i>
          Messages
        </NavLink>

        <NavLink to="/admin/students" className={linkClass}>
          <i className="fas fa-users w-5"></i>
          Students
        </NavLink>

        <NavLink to="/admin/account" className={linkClass}>
          <i className="fas fa-cog w-5"></i>
          Account Settings
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-4">
        <div className="text-sm mb-3">
          <div className="font-semibold">{user.fullName}</div>
          <div className="text-gray-500">Administrator</div>
        </div>

        <button
          onClick={logout}
          className="w-full btn-secondary text-sm"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}