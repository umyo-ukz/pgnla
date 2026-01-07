import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";

export default function StaffDashboard() {
  const { user, role } = useAuth();

  if (!user || role !== "staff") return <Navigate to="/login" />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.fullName}
        </h1>
        <p className="text-gray-600">
          Staff Dashboard • Manage grades and student performance
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/staff/grades"
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-edit text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Enter Grades</h3>
                    <p className="text-sm text-gray-500">Update student assessments</p>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-600"></i>
              </Link>

              <Link
                to="/staff/performance"
                className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <i className="fas fa-chart-line text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Performance</h3>
                    <p className="text-sm text-gray-500">Monitor student progress</p>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400 group-hover:text-green-600"></i>
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
                    <p className="text-sm text-gray-500">Update profile & preferences</p>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}