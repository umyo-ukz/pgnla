import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

const TABS = ["submitted", "approved", "rejected"] as const;
type Tab = typeof TABS[number];

type SortOption = "date-new" | "date-old" | "name-asc" | "name-desc";

export default function AdminRegistrations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("submitted");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-new");

  if (user === undefined) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const registrations = useQuery(api.studentApplications.listByStatus, {
    status: activeTab,
  });

  const filtered = (registrations ?? [])
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.studentFirstName.toLowerCase().includes(q) ||
        r.studentLastName.toLowerCase().includes(q) ||
        r.primaryParentName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "name-asc") {
        return `${a.studentFirstName} ${a.studentLastName}`.localeCompare(
          `${b.studentFirstName} ${b.studentLastName}`
        );
      }

      if (sort === "name-desc") {
        return `${b.studentFirstName} ${b.studentLastName}`.localeCompare(
          `${a.studentFirstName} ${a.studentLastName}`
        );
      }

      if (sort === "date-old") {
        return a.createdAt - b.createdAt;
      }

      return b.createdAt - a.createdAt; // date-new
    });

  // Get counts for each tab
  const getTabCount = (tab: Tab) => {
    if (!registrations) return 0;
    return registrations.filter((r) => r.status === tab).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>
          <p className="text-gray-600 mt-2">Review and process student applications</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <i className="fas fa-arrow-left text-sm"></i>
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-amber-600">{getTabCount("submitted")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <i className="fas fa-clock text-amber-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{getTabCount("approved")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{getTabCount("rejected")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <i className="fas fa-times-circle text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-4 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "text-primary-red"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-red"></div>
                )}
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by student name or parent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 transition-colors"
              >
                <option value="date-new">Newest first</option>
                <option value="date-old">Oldest first</option>
                <option value="name-asc">Student name A–Z</option>
                <option value="name-desc">Student name Z–A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {registrations === undefined ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-3"></i>
              <p className="text-gray-600">Loading registrations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-alt text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No registrations found</h3>
              <p className="text-gray-500">
                {search ? "Try adjusting your search query" : "No registrations in this category"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Parent/Guardian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Program & Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center">
                            <i className="fas fa-user text-primary-red"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              <Link
                                to={`/admin/registrations/${r._id}`}
                                className="hover:text-primary-red transition-colors"
                              >
                                {r.studentFirstName} {r.studentLastName}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500">
                              {r.dateOfBirth ? `DOB: ${r.dateOfBirth}` : "No DOB"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{r.primaryParentName}</div>
                          <div className="text-sm text-gray-500">{r.email}</div>
                          <div className="text-sm text-gray-500">{r.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {r.programType}
                          </span>
                          {r.intendedGradeLevel && (
                            <div className="mt-1 text-sm text-gray-600">
                              Grade: {r.intendedGradeLevel}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : r.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <i
                            className={`fas ${
                              r.status === "approved"
                                ? "fa-check-circle"
                                : r.status === "rejected"
                                ? "fa-times-circle"
                                : "fa-clock"
                            } mr-1.5`}
                          ></i>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar text-gray-400"></i>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(r.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/registrations/${r._id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-red/10 text-primary-red rounded-lg hover:bg-primary-red/20 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-eye text-xs"></i>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="text-sm text-gray-500 flex items-center justify-between">
        <div>
          Showing <span className="font-medium">{filtered.length}</span> of{" "}
          <span className="font-medium">{registrations?.length || 0}</span> registrations
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-info-circle text-gray-400"></i>
          <span>Click on any student name to view full application details</span>
        </div>
      </div>
    </div>
  );
}