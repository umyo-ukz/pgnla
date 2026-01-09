import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";


export default function ParentNoticesPage() {
  const { user, role, isLoading, isAuthenticated, token } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isAuthenticated || !user || role !== "parent") {
    return <Navigate to="/login" />;
  }

  // Fetch students for this parent to get their grade levels
  const students = useQuery(api.students.listForParent, {
    parentId: user._id,
  });

  // Get unique grade levels from parent's students
  const studentGradeLevels = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map(s => s.gradeLevel)));
  }, [students]);

  // Get parent notices - now with grade level filtering
  const parentNotices = useQuery(api.notices.getParentNotices, {
    parentId: user._id,
    gradeLevels: studentGradeLevels.length > 0 ? studentGradeLevels : undefined,
  });

  // Mark notice as read mutation
  const markAsRead = useMutation(api.notices.markNoticeAsRead);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-red mb-4"></i>
          <p className="text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  // Filter and sort notices
  const filteredNotices = useMemo(() => {
    if (!parentNotices) return [];

    let filtered = [...parentNotices];

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(notice => notice.noticeType === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notice =>
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query) ||
        notice.creatorName.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [parentNotices, selectedType, searchQuery]);

  // Get unread count
  const unreadCount = useMemo(() => {
    if (!parentNotices) return 0;
    return parentNotices.filter(notice => !notice.hasRead).length;
  }, [parentNotices]);

  // Mark notice as read
  const handleMarkAsRead = async (noticeId: Id<"notices">) => {
    try {
      if (token) {
        await markAsRead({
          parentId: user._id,
          noticeId: noticeId,
          token: token,
        });
      }
    } catch (error) {
      console.error("Error marking notice as read:", error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              School Notices
            </h1>
            <p className="text-gray-600">
              Important announcements and updates from the school
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-primary-red/10 text-primary-red rounded-full">
              <i className="fas fa-bell mr-2"></i>
              <span className="font-medium">{unreadCount} unread notice{unreadCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red bg-white cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="academic">Academic</option>
              <option value="event">Event</option>
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {parentNotices === undefined ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-5xl mb-4">
              <i className="fas fa-newspaper"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              {searchQuery ? "No notices match your search" : "No notices yet"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "You'll see important announcements here when they're posted."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 text-primary-red hover:text-red-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotices.map((notice) => (
              <div
                key={notice._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${!notice.hasRead ? "bg-primary-red/5" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Notice Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNoticeTypeColor(notice.noticeType).replace('bg-', 'bg-').split(' ')[0]}`}>
                    <i className={`fas ${
                      notice.noticeType === "urgent" ? "fa-exclamation-triangle text-red-600" :
                      notice.noticeType === "academic" ? "fa-graduation-cap text-green-600" :
                      notice.noticeType === "event" ? "fa-calendar text-amber-600" :
                      "fa-bullhorn text-blue-600"
                    } text-lg`}></i>
                  </div>

                  {/* Notice Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-user"></i>
                            {notice.creatorName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-calendar"></i>
                            {new Date(notice.createdAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-users"></i>
                            For: {notice.gradeLevel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 md:mt-0 flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNoticeTypeColor(notice.noticeType)}`}>
                          {notice.noticeType.charAt(0).toUpperCase() + notice.noticeType.slice(1)}
                        </span>
                        {!notice.hasRead && (
                          <span className="bg-primary-red text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <i className="fas fa-circle text-[8px]"></i>
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notice Message */}
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {notice.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <i className="fas fa-clock mr-1"></i>
                        Posted {new Date(notice.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {!notice.hasRead && (
                        <button
                          onClick={() => handleMarkAsRead(notice._id as Id<"notices">)}
                          className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                        >
                          <i className="fas fa-check"></i>
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredNotices.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600">
              <div>
                Showing <span className="font-medium">{filteredNotices.length}</span> of{" "}
                <span className="font-medium">{parentNotices?.length || 0}</span> notices
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-red"></div>
                  <span>{unreadCount} unread</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>{(parentNotices?.length || 0) - unreadCount} read</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">About School Notices</h4>
            <p className="text-sm text-blue-700">
              • <strong>Urgent</strong> notices require immediate attention<br />
              • <strong>Academic</strong> notices contain important grade and curriculum updates<br />
              • <strong>General</strong> notices contain school-wide announcements<br />
              • Mark notices as "read" to track what you've seen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}