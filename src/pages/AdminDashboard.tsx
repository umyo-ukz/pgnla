// pages/AdminDashboard.tsx
import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth();

  // Fetch dashboard statistics
  const stats = useQuery(api.admin.getDashboardStats);
  const recentRegistrations = useQuery(api.admin.getRecentRegistrations);
  const recentMessages = useQuery(api.admin.getRecentMessages);

  if (isLoading) return null;
  if (!user || role !== "admin") return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.fullName}
        </h1>
        <p className="text-gray-600">
          Administrator Dashboard • Manage the entire school system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {stats?.activeUsers || 0} active
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-500">
              {stats?.newUsersThisMonth || 0} this month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Registrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingRegistrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <i className="fas fa-clipboard-list text-amber-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/registrations"
              className="text-sm text-primary-red hover:text-red-700 font-medium flex items-center gap-1"
            >
              Review applications <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.unreadMessages || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <i className="fas fa-envelope text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/messages"
              className="text-sm text-primary-red hover:text-red-700 font-medium flex items-center gap-1"
            >
              View messages <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-user-graduate text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">
              {stats?.activeStudents || 0} currently enrolled
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/registrations"
              className="flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-amber-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Review Registrations</h3>
                  <p className="text-sm text-gray-500">
                    Process new student applications
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-amber-600"></i>
            </Link>

            <Link
              to="/admin/manage-accounts"
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-user-cog text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage Accounts</h3>
                  <p className="text-sm text-gray-500">
                    Manage parent and staff accounts
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-600"></i>
            </Link>

            <Link
              to="/admin/messages"
              className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-envelope-open-text text-purple-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Messages</h3>
                  <p className="text-sm text-gray-500">
                    Read and respond to inquiries
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-purple-600"></i>
            </Link>

            <Link
              to="/account"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-cog text-gray-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Account Settings</h3>
                  <p className="text-sm text-gray-500">
                    Update profile & preferences
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600"></i>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Registrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
              <Link
                to="/admin/registrations"
                className="text-sm text-primary-red hover:text-red-700 font-medium"
              >
                View all
              </Link>
            </div>
            {recentRegistrations === undefined ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-primary-red mr-2"></i>
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : recentRegistrations.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent registrations
              </div>
            ) : (
              <div className="space-y-3">
                {recentRegistrations.slice(0, 5).map((registration) => (
                  <div
                    key={registration._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {registration.studentFirstName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {registration.studentFirstName} {registration.studentLastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {registration.intendedGradeLevel || "No grade specified"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === "submitted"
                        ? "bg-amber-100 text-amber-800"
                        : registration.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : registration.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {registration.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
              <Link
                to="/admin/messages"
                className="text-sm text-primary-red hover:text-red-700 font-medium"
              >
                View all
              </Link>
            </div>
            {recentMessages === undefined ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-primary-red mr-2"></i>
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent messages
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.slice(0, 5).map((message) => (
                  <Link
                    key={message._id}
                    to="/admin/messages"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                        <i className="fas fa-envelope text-purple-600"></i>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {message.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {message.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.status === "new"
                          ? "bg-blue-100 text-blue-800"
                          : message.status === "read"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {message.status}
                      </span>
                      <i className="fas fa-chevron-right text-gray-400 group-hover:text-primary-red"></i>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-database text-green-600"></i>
            </div>
            <div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fas fa-server text-green-600"></i>
            </div>
            <div>
              <p className="font-medium text-gray-900">API Server</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fas fa-users text-blue-600"></i>
            </div>
            <div>
              <p className="font-medium text-gray-900">Active Users</p>
              <p className="text-sm text-blue-600">{stats?.activeUsers || 0} online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}