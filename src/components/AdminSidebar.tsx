import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  if (!user || user.role !== "admin") return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
     ${
       isActive
         ? "bg-primary-red text-white"
         : "text-gray-700 hover:bg-gray-100"
     }`;

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b">
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

        <NavLink to="/admin/parents" className={linkClass}>
          <i className="fas fa-user-friends w-5"></i>
          Parents
        </NavLink>

        <NavLink to="/admin/staff" className={linkClass}>
          <i className="fas fa-chalkboard-teacher w-5"></i>
          Staff
        </NavLink>

        <NavLink to="/admin/messages" className={linkClass}>
          <i className="fas fa-envelope w-5"></i>
          Messages
        </NavLink>

        <NavLink to="/admin/settings" className={linkClass}>
          <i className="fas fa-cog w-5"></i>
          Settings
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
