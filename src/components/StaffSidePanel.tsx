import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function StaffSidePanel() {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

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
    `block px-4 py-3 rounded-lg transition flex items-center gap-3 ${
      isActive
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
                <i className="fas fa-chalkboard-teacher text-white text-sm"></i>
              </div>
              <span className="font-semibold text-gray-900">Staff Panel</span>
            </div>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-500`}></i>
          </button>

          {/* Mobile Navigation Dropdown */}
          {isExpanded && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <nav className="p-3 space-y-1">
                <NavLink 
                  to="/staff" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink 
                  to="/staff/grades" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-edit w-5"></i>
                  <span>Edit Grades</span>
                </NavLink>

                <NavLink 
                  to="/staff/performance" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-chart-line w-5"></i>
                  <span>Student Performance</span>
                </NavLink>

                <NavLink 
                  to="/staff/notices" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-paper-plane w-5"></i>
                  <span>Send Notices</span>
                </NavLink>

                <NavLink 
                  to="/staff/account" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-cog w-5"></i>
                  <span>Account Settings</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop Side Panel
  return (
    <aside className="w-64 border-r border-gray-200 bg-white sticky top-16 h-screen flex-shrink-0 hidden md:block">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center">
            <i className="fas fa-chalkboard-teacher text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">Staff Panel</h2>
            <p className="text-sm text-gray-500">Grades & performance</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <NavLink to="/staff" className={linkClass}>
          <i className="fas fa-tachometer-alt w-5"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/staff/grades" className={linkClass}>
          <i className="fas fa-edit w-5"></i>
          <span>Edit Grades</span>
        </NavLink>

        <NavLink to="/staff/performance" className={linkClass}>
          <i className="fas fa-chart-line w-5"></i>
          <span>Student Performance</span>
        </NavLink>

        <NavLink to="/staff/notices" className={linkClass}>
          <i className="fas fa-paper-plane w-5"></i>
          <span>Send Notices</span>
        </NavLink>

        <NavLink to="/staff/account" className={linkClass}>
          <i className="fas fa-cog w-5"></i>
          <span>Account Settings</span>
          </NavLink>
      </nav>
    </aside>
  );
}