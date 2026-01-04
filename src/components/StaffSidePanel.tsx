import { NavLink } from "react-router-dom";

export default function StaffSidePanel() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-red-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 border-r bg-white h-screen sticky top-0">
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold">Staff Panel</h2>
        <p className="text-sm text-gray-500">Grades & performance</p>
      </div>

      <nav className="p-4 space-y-1">
        <NavLink to="/staff/grades" className={linkClass}>
          Edit Grades
        </NavLink>

        <NavLink to="/staff/performance" className={linkClass}>
          Student Performance
        </NavLink>
      </nav>
    </aside>
  );
}
