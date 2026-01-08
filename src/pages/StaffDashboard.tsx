import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

// Define the notice type
type NoticeType = "general" | "academic" | "event" | "urgent";

export default function StaffDashboard() {
  const { user, role, token, isLoading, isAuthenticated } = useAuth();
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    gradeLevel: "",
    noticeType: "general" as NoticeType,
  });

  const createNotice = useMutation(api.notices.createNotice);
  const recentNotices = useQuery(api.notices.getRecentNotices);
  const students = useQuery(api.students.listAll);
  const stats = useQuery(api.staff.getDashboardStats);

  // Get unique grade levels
  const gradeLevels = [
    ...new Set(students?.map((s) => s.gradeLevel) || []),
  ].sort();

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        alert("You must be logged in to send notices");
        return;
      }

      await createNotice({
        title: noticeForm.title,
        content: noticeForm.content,
        gradeLevel: noticeForm.gradeLevel,
        noticeType: noticeForm.noticeType,
        token: token, // ADD THIS - Pass the token
      });
      alert("Notice sent successfully!");
      setNoticeForm({
        title: "",
        content: "",
        gradeLevel: "",
        noticeType: "general" as NoticeType,
      });
      setShowNoticeForm(false);
    } catch (error) {
      if (error instanceof Error) {
        alert("Error sending notice: " + error.message);
      } else {
        alert("Error sending notice: Unknown error");
      }
    }
  };

  const handleRadioChange = (value: NoticeType) => {
    setNoticeForm({ ...noticeForm, noticeType: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-red mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (role !== "staff" && role !== "admin")) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user.fullName}
        </h1>
        <p className="text-gray-600">
          Staff Dashboard • Manage grades and communicate with parents
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-user-graduate text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Across all classes</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {gradeLevels.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-users text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowNoticeForm(true)}
              className="text-sm text-primary-red hover:text-red-700 font-medium flex items-center gap-1"
            >
              Send Notice <i className="fas fa-bullhorn ml-1"></i>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Notices</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentNotices?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <i className="fas fa-newspaper text-amber-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Last 30 days</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Grading Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingGrading || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <i className="fas fa-edit text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/staff/grades"
              className="text-sm text-primary-red hover:text-red-700 font-medium flex items-center gap-1"
            >
              Enter Grades <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Notice Creation Modal */}
      {showNoticeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Send Notice to Parents
                </h2>
                <button
                  onClick={() => setShowNoticeForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitNotice} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Title
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, title: e.target.value })
                  }
                  placeholder="e.g., Parent-Teacher Meeting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Class
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  value={noticeForm.gradeLevel}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, gradeLevel: e.target.value })
                  }
                  required
                >
                  <option value="">Select a class</option>
                  <option value="all">All Classes</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  {noticeForm.gradeLevel === "all"
                    ? "This notice will be sent to all parents with students in any class."
                    : "This notice will be sent to all parents with students in this class."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "general" as NoticeType,
                      label: "General",
                      icon: "fa-bullhorn",
                      color: "blue",
                      colorClass: "blue-500",
                      bgColorClass: "blue-50",
                    },
                    {
                      value: "academic" as NoticeType,
                      label: "Academic",
                      icon: "fa-graduation-cap",
                      color: "green",
                      colorClass: "green-500",
                      bgColorClass: "green-50",
                    },
                    {
                      value: "event" as NoticeType,
                      label: "Event",
                      icon: "fa-calendar",
                      color: "amber",
                      colorClass: "amber-500",
                      bgColorClass: "amber-50",
                    },
                    {
                      value: "urgent" as NoticeType,
                      label: "Urgent",
                      icon: "fa-exclamation-triangle",
                      color: "red",
                      colorClass: "red-500",
                      bgColorClass: "red-50",
                    },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        noticeForm.noticeType === type.value
                          ? `border-${type.colorClass} bg-${type.bgColorClass}`
                          : "border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="noticeType"
                        value={type.value}
                        checked={noticeForm.noticeType === type.value}
                        onChange={() => handleRadioChange(type.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-2">
                        <i
                          className={`fas ${type.icon} text-${type.colorClass}`}
                        ></i>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  rows={6}
                  value={noticeForm.content}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, content: e.target.value })
                  }
                  placeholder="Enter your message here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNoticeForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!token}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    token
                      ? "bg-primary-red text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  {token ? "Send Notice" : "Loading token..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <button
              onClick={() => setShowNoticeForm(true)}
              disabled={!token}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                token
                  ? "bg-primary-red text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <i className="fas fa-plus"></i>
              New Notice
            </button>
          </div>

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
                  <p className="text-sm text-gray-500">
                    Update student assessments
                  </p>
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
                  <h3 className="font-medium text-gray-900">
                    View Performance
                  </h3>
                  <p className="text-sm text-gray-500">
                    Monitor student progress
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-green-600"></i>
            </Link>

            <div
              onClick={() => {
                if (token) {
                  setShowNoticeForm(true);
                } else {
                  alert("Please wait for authentication to complete");
                }
              }}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors group cursor-pointer ${
                token
                  ? "bg-amber-50 hover:bg-amber-100"
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    token ? "bg-amber-100" : "bg-gray-200"
                  }`}
                >
                  <i
                    className={`fas fa-bullhorn ${token ? "text-amber-600" : "text-gray-400"}`}
                  ></i>
                </div>
                <div>
                  <h3
                    className={`font-medium ${token ? "text-gray-900" : "text-gray-500"}`}
                  >
                    Send Notice
                  </h3>
                  <p className="text-sm text-gray-500">
                    Message parents in a class
                  </p>
                </div>
              </div>
              <i
                className={`fas fa-arrow-right ${token ? "text-gray-400 group-hover:text-amber-600" : "text-gray-300"}`}
              ></i>
            </div>

            <Link
              to="/account"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-cog text-gray-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Account Settings
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update profile & preferences
                  </p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600"></i>
            </Link>
          </div>
        </div>

        {/* Recent Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Notices
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {recentNotices?.length || 0} total
              </span>
            </div>

            {recentNotices === undefined ? (
              <div className="text-center py-4">
                <i className="fas fa-spinner fa-spin text-primary-red mr-2"></i>
                <span className="text-gray-600">Loading notices...</span>
              </div>
            ) : recentNotices.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <i className="fas fa-newspaper text-3xl text-gray-300 mb-3"></i>
                <p>No notices sent yet</p>
                <button
                  onClick={() => {
                    if (token) {
                      setShowNoticeForm(true);
                    } else {
                      alert("Please wait for authentication to complete");
                    }
                  }}
                  className={`mt-3 px-4 py-2 rounded-lg text-sm ${
                    token
                      ? "bg-primary-red text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Send First Notice
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div
                    key={notice._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-red/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notice.noticeType === "urgent"
                                ? "bg-red-100 text-red-800"
                                : notice.noticeType === "academic"
                                  ? "bg-green-100 text-green-800"
                                  : notice.noticeType === "event"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notice.noticeType}
                          </span>
                          <span className="text-xs text-gray-500">
                            For: {notice.gradeLevel}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Classes Active</div>
                <div className="text-2xl font-bold text-gray-900">
                  {gradeLevels.length}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Students</div>
                <div className="text-2xl font-bold text-gray-900">
                  {students?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}