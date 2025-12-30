import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";


type ViewMode = "parents" | "staff";

export default function AdminDashboard() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "admin") return <Navigate to="/login" />;

  const parents = useQuery(api.admin.listParents);
  const staff = useQuery(api.admin.listStaff);

  const [view, setView] = useState<ViewMode>("parents");
  const [search, setSearch] = useState("");

  const activeList = view === "parents" ? parents : staff;

  const filteredUsers = useMemo(() => {
    if (!activeList) return [];

    return activeList.filter((u) =>
      `${u.fullName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [activeList, search]);

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage parents and staff accounts
          </p>

          
        </div>
        <div className="flex gap-3">
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
        <Link
        to="/admin/registrations"
        className="border rounded-xl p-6 hover:bg-red-50 transition group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pending Registrations</h3>
            <p className="text-sm text-gray-600">
              Review and approve new student applications
            </p>
          </div>
          <i className="fas fa-clipboard-list text-2xl text-primary-red group-hover:scale-110 transition-transform"></i>
        </div>
      </Link>
        </div>
      </header>
  


      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setView("parents")}
          className={`px-4 py-3 font-semibold border-b-2 ${view === "parents"
            ? "border-primary-red text-primary-red"
            : "border-transparent text-gray-500"
            }`}
        >
          Parents
        </button>

        <button
          onClick={() => setView("staff")}
          className={`px-4 py-3 font-semibold border-b-2 ${view === "staff"
            ? "border-primary-red text-primary-red"
            : "border-transparent text-gray-500"
            }`}
        >
          Staff
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-xl p-4">
        <input
          type="text"
          placeholder={`Search ${view} by name or email…`}
          className="input w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results */}
      {activeList === undefined ? (
        <div>Loading {view}…</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-gray-600">
          No {view} match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="border rounded-xl p-5 space-y-2"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {u.fullName}
                </h3>
                <p className="text-sm text-gray-600">
                  {u.email}
                </p>
              </div>

              <div className="text-sm">
                <span className="font-medium">Role:</span>{" "}
                {u.role}
              </div>

              <div className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {u.isActive ? "Active" : "Disabled"}
              </div>

              <div className="pt-3 flex gap-2">
                <button className="btn-secondary text-sm">
                  View
                </button>
                <button className="btn-secondary text-sm">
                  Disable
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
