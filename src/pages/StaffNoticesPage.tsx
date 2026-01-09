import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";

export default function StaffNoticesPage() {
  const { user, role, isLoading, isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    gradeLevel: "all",
    noticeType: "general" as "general" | "academic" | "event" | "urgent",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isAuthenticated || !user || (role !== "staff" && role !== "admin")) {
    return <Navigate to="/login" />;
  }

  // Get all notices for staff to see (history)
  const allNotices = useQuery(api.notices.getPublished);

  // Get grade levels for dropdown
  const gradeLevels = useQuery(api.students.getGradeLevels);

  // Create notice mutation
  const createNotice = useMutation(api.notices.createNotice);

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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new notice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      const result = await createNotice({
        title: formData.title,
        content: formData.content,
        gradeLevel: formData.gradeLevel,
        noticeType: formData.noticeType,
        token: token,
      });

      console.log("Notice created:", result);
      setSubmitSuccess(true);
      setFormData({
        title: "",
        content: "",
        gradeLevel: "all",
        noticeType: "general",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get notice type color
  const getNoticeTypeColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "academic":
        return "bg-green-100 text-green-800 border-green-200";
      case "event":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Get notice type icon
  const getNoticeTypeIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return "fa-exclamation-triangle";
      case "academic":
        return "fa-graduation-cap";
      case "event":
        return "fa-calendar";
      default:
        return "fa-bullhorn";
    }
  };

  // Filter notices by creator (staff's own notices)
  const myNotices = useMemo(() => {
    if (!allNotices || !user) return [];
    return allNotices.filter(
      (notice) =>
        notice.createdBy === user._id ||
        user.role === "admin"
    );
  }, [allNotices, user]);

  // Sort by date (newest first)
  const sortedNotices = useMemo(() => {
    return [...myNotices].sort((a, b) => b.createdAt - a.createdAt);
  }, [myNotices]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manage Notices
        </h1>
        <p className="text-gray-600">
          Create and manage school notices for parents and students
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "create"
              ? "border-primary-red text-primary-red"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <i className="fas fa-plus-circle mr-2"></i>
          Create Notice
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-primary-red text-primary-red"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <i className="fas fa-history mr-2"></i>
          Notice History
          {sortedNotices.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-sm">
              {sortedNotices.length}
            </span>
          )}
        </button>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
            <div>
              <h3 className="font-medium text-green-800">Notice Created Successfully!</h3>
              <p className="text-sm text-green-700">
                The notice has been sent to all parents with children in the selected grade level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Notice Tab */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Create New Notice
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notice Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a clear, descriptive title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  />
                </div>

                {/* Content */}
                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notice Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your notice content here..."
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.content.length} characters
                  </p>
                </div>

                {/* Grade Level */}
                <div>
                  <label
                    htmlFor="gradeLevel"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Target Grade Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  >
                    <option value="all">All Grades</option>
                    {gradeLevels?.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    This notice will be sent to parents with children in the selected grade.
                  </p>
                </div>

                {/* Notice Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notice Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "general", label: "General", icon: "fa-bullhorn", color: "bg-blue-500" },
                      { value: "academic", label: "Academic", icon: "fa-graduation-cap", color: "bg-green-500" },
                      { value: "event", label: "Event", icon: "fa-calendar-alt", color: "bg-amber-500" },
                      { value: "urgent", label: "Urgent", icon: "fa-exclamation-triangle", color: "bg-red-500" },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.noticeType === type.value
                            ? "border-primary-red bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="noticeType"
                          value={type.value}
                          checked={formData.noticeType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center mb-2`}
                        >
                          <i className={`fas ${type.icon} text-white text-lg`}></i>
                        </div>
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        title: "",
                        content: "",
                        gradeLevel: "all",
                        noticeType: "general",
                      })
                    }
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Notice
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <i className="fas fa-eye mr-2 text-gray-400"></i>
                Preview
              </h3>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNoticeTypeColor(
                      formData.noticeType
                    ).replace("text-", "bg-").split(" ")[0]}`}
                  >
                    <i
                      className={`fas ${getNoticeTypeIcon(
                        formData.noticeType
                      )} text-lg`}
                    ></i>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getNoticeTypeColor(
                        formData.noticeType
                      )}`}
                    >
                      {formData.noticeType.charAt(0).toUpperCase() +
                        formData.noticeType.slice(1)}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-2">
                  {formData.title || "Notice Title"}
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">
                  {formData.content || "Notice content will appear here..."}
                </p>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>
                    <i className="fas fa-users mr-1"></i>
                    Target:{" "}
                    {formData.gradeLevel === "all"
                      ? "All Grades"
                      : formData.gradeLevel}
                  </p>
                  <p>
                    <i className="fas fa-clock mr-1"></i>
                    Will be sent immediately
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Tips
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Use "Urgent" only for time-sensitive matters</li>
                  <li>• Be clear and concise in your messaging</li>
                  <li>• "All Grades" sends to all parents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {sortedNotices.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-5xl mb-4">
                <i className="fas fa-paper-plane"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No notices sent yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Create your first notice to start communicating with parents.
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-6 py-3 bg-primary-red text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <i className="fas fa-plus mr-2"></i>
                Create First Notice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedNotices.map((notice) => (
                <div
                  key={notice._id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedNotice?._id === notice._id
                      ? "bg-gray-50"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedNotice(
                      selectedNotice?._id === notice._id ? null : notice
                    )
                  }
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Notice Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNoticeTypeColor(
                        notice.noticeType
                      )
                        .replace("text-", "bg-")
                        .split(" ")[0]}`}
                    >
                      <i
                        className={`fas ${getNoticeTypeIcon(
                          notice.noticeType
                        )} text-lg`}
                      ></i>
                    </div>

                    {/* Notice Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {notice.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>
                              <i className="fas fa-calendar mr-1"></i>
                              {new Date(notice.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              <i className="fas fa-users mr-1"></i>
                              {notice.gradeLevel === "all"
                                ? "All Grades"
                                : notice.gradeLevel}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 md:mt-0 flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getNoticeTypeColor(
                              notice.noticeType
                            )}`}
                          >
                            {notice.noticeType.charAt(0).toUpperCase() +
                              notice.noticeType.slice(1)}
                          </span>
                          {selectedNotice?._id === notice._id ? (
                            <i className="fas fa-chevron-up text-gray-400"></i>
                          ) : (
                            <i className="fas fa-chevron-down text-gray-400"></i>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {selectedNotice?._id === notice._id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap mb-4">
                            {notice.content}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>
                                <i className="fas fa-clock mr-1"></i>
                                Sent at{" "}
                                {new Date(notice.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                              {notice.publishedAt && (
                                <span>
                                  <i className="fas fa-check-circle mr-1 text-green-500"></i>
                                  Published
                                </span>
                              )}
                            </div>
                            <button
                              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Could add resend functionality here
                                alert("Resend functionality coming soon!");
                              }}
                            >
                              <i className="fas fa-redo mr-1"></i>
                              Resend
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {sortedNotices.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600">
                <div>
                  Showing <span className="font-medium">{sortedNotices.length}</span> notice
                  {sortedNotices.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <span>
                    <i className="fas fa-chart-bar mr-1"></i>
                    Created by you
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">About Creating Notices</h4>
            <p className="text-sm text-blue-700">
              • <strong>General</strong> notices are for general announcements<br />
              • <strong>Academic</strong> notices are for grades and curriculum updates<br />
              • <strong>Event</strong> notices are for school events and activities<br />
              • <strong>Urgent</strong> notices are for time-sensitive matters<br />
              • Notices are automatically sent to all relevant parents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

