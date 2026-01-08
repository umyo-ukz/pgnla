import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { Id } from "../../convex/_generated/dataModel";

export default function ParentSidePanel() {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get unread notice count
  const unreadCount = useQuery(
    api.notices.getUnreadNoticeCount,
    user?._id ? { parentId: user._id as Id<"users"> } : "skip"
  );

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
                <i className="fas fa-user-friends text-white text-sm"></i>
              </div>
              <span className="font-semibold text-gray-900">Parent Panel</span>
            </div>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-500`}></i>
          </button>

          {/* Mobile Navigation Dropdown */}
          {isExpanded && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <nav className="p-3 space-y-1">
                <NavLink 
                  to="/parent" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-tachometer-alt w-5"></i>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink 
                  to="/parent/children" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-user-graduate w-5"></i>
                  <span>My Children</span>s
                </NavLink>

                <NavLink 
                  to="/parent/notices" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-newspaper w-5"></i>
                  <span>Notices</span>
                  {typeof unreadCount === 'number' && unreadCount > 0 && (
                    <span className="ml-auto bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                  )}
                </NavLink>

                <NavLink 
                  to="/parent/finances" 
                  className={linkClass}
                  onClick={() => setIsExpanded(false)}
                >
                  <i className="fas fa-money-bill-alt w-5"></i>
                  <span>Finances</span>
                </NavLink>

                <NavLink 
                  to="/account" 
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
    <aside className="w-64 border-r bg-white sticky top-0 h-screen flex-shrink-0 hidden md:block">
      <div className="p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center">
            <i className="fas fa-user-friends text-white"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">Parent Panel</h2>
            <p className="text-sm text-gray-500">Children & updates</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        <NavLink to="/parent" className={linkClass}>
          <i className="fas fa-tachometer-alt w-5"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/parent/children" className={linkClass}>
          <i className="fas fa-user-graduate w-5"></i>
          <span>My Children</span>
        </NavLink>

        <NavLink to="/parent/notices" className={linkClass}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <i className="fas fa-newspaper w-5"></i>
              <span>Notices</span>
            </div>
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <span className="bg-primary-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
        </NavLink>

        <NavLink to="/parent/finances" className={linkClass}>
          <i className="fas fa-money-bill-alt w-5"></i>
          <span>Finances</span>
        </NavLink>

        <NavLink to="/account" className={linkClass}>
          <i className="fas fa-cog w-5"></i>
          <span>Account Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}