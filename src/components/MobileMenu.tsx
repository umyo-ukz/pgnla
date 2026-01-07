// components/MobileMenu.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";

interface MobileMenuProps {
  open: boolean;
  close: () => void;
  isDashboard?: boolean;
}

export default function MobileMenu({ open, close, isDashboard = false }: MobileMenuProps) {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();

  const dashboardPath =
    role === "parent"
      ? "/parent-dashboard"
      : role === "staff"
      ? "/staff"
      : role === "admin"
      ? "/admin"
      : "/login";

  if (!open) return null;

  if (isDashboard) {
    return (
      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          <Link
            to="/staff/grades"
            onClick={close}
            className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <i className="fas fa-edit mr-3"></i>
            Edit Grades
          </Link>
          <Link
            to="/staff/performance"
            onClick={close}
            className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <i className="fas fa-chart-line mr-3"></i>
            Student Performance
          </Link>
          <Link
            to="/account"
            onClick={close}
            className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <i className="fas fa-cog mr-3"></i>
            Account Settings
          </Link>
          <button
            onClick={() => {
              logout();
              close();
            }}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600"
          >
            <i className="fas fa-sign-out-alt mr-3"></i>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Original mobile menu for public pages
  return (
    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3 space-y-1">
        {/* Dashboard link for logged-in users */}
        {user && (
          <Link
            to={dashboardPath}
            onClick={close}
            className="block px-4 py-3 rounded-lg bg-primary-red text-white font-medium"
          >
            <i className="fas fa-tachometer-alt mr-3"></i>
            Go to Dashboard
          </Link>
        )}

        {/* Regular navigation links */}
        <Link
          to="/about"
          onClick={close}
          className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
        >
          <i className="fas fa-info-circle mr-3"></i>
          {t("navbar.aboutUs")}
        </Link>

        <Link
          to="/admissions"
          onClick={close}
          className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
        >
          <i className="fas fa-user-plus mr-3"></i>
          {t("navbar.admissions")}
        </Link>

        <Link
          to="/financing"
          onClick={close}
          className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
        >
          <i className="fas fa-hand-holding-usd mr-3"></i>
          {t("navbar.financing")}
        </Link>

        <Link
          to="/calendar"
          onClick={close}
          className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
        >
          <i className="fas fa-calendar-alt mr-3"></i>
          {t("navbar.schoolCalendar")}
        </Link>

        <Link
          to="/contact"
          onClick={close}
          className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
        >
          <i className="fas fa-phone mr-3"></i>
          {t("navbar.contact")}
        </Link>

        {/* Login/Logout */}
        {user ? (
          <>
            <Link
              to="/account"
              onClick={close}
              className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
            >
              <i className="fas fa-cog mr-3"></i>
              {t("common.accountSettings")}
            </Link>
            <button
              onClick={() => {
                logout();
                close();
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              {t("common.logout")}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={close}
            className="block px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700"
          >
            <i className="fas fa-sign-in-alt mr-3"></i>
            {t("common.login")}
          </Link>
        )}
      </div>
    </div>
  );
}