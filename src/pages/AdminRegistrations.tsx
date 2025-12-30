import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

const TABS = ["pending", "approved", "rejected"] as const;
type Tab = typeof TABS[number];

type SortOption =
  | "date-new"
  | "date-old"
  | "name-asc"
  | "name-desc";

export default function AdminRegistrations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-new");

  if (user === undefined) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const registrations = useQuery(api.registrations.listByStatus, {
    status: activeTab,
  });

  const filtered = (registrations ?? [])
    .filter(r => {
      const q = search.toLowerCase();
      return (
        r.studentFirstName.toLowerCase().includes(q) ||
        r.studentLastName.toLowerCase().includes(q) ||
        r.primaryParentName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "name-asc") {
        return (
          `${a.studentFirstName} ${a.studentLastName}`.localeCompare(
            `${b.studentFirstName} ${b.studentLastName}`
          )
        );
      }

      if (sort === "name-desc") {
        return (
          `${b.studentFirstName} ${b.studentLastName}`.localeCompare(
            `${a.studentFirstName} ${a.studentLastName}`
          )
        );
      }

      if (sort === "date-old") {
        return a.createdAt - b.createdAt;
      }

      return b.createdAt - a.createdAt; // date-new
    });

  return (
    <div className="container-wide px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registrations</h1>
        <Link to="/admin" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium capitalize ${
              activeTab === tab
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search student or parent..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field md:w-80"
        />

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="input-field md:w-64"
        >
          <option value="date-new">Newest first</option>
          <option value="date-old">Oldest first</option>
          <option value="name-asc">Student name A–Z</option>
          <option value="name-desc">Student name Z–A</option>
        </select>
      </div>

      {/* Table */}
      {registrations === undefined ? (
        <div>Loading registrations…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No matching registrations.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-serif text-red-600">
                  Student
                </th>
                <th className="px-4 py-3 text-sm font-serif text-red-600">
                  Parent
                </th>
                <th className="px-4 py-3 text-sm font-serif text-red-600">
                  Program
                </th>
                <th className="px-4 py-3 text-sm font-serif text-red-600">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr
                  key={r._id}
                  className="border-t hover:bg-red-50 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/admin/registrations/${r._id}`}
                      className="hover:underline"
                    >
                      {r.studentFirstName} {r.studentLastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {r.primaryParentName}
                  </td>
                  <td className="px-4 py-3">
                    {r.programType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
