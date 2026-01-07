import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

const TABS = ["new", "read", "archived"] as const;
type Tab = typeof TABS[number];

type SortOption = "date-new" | "date-old" | "name-asc" | "name-desc";

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-new");

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-red mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const messages = useQuery(api.messages.listByStatus, {
    status: activeTab,
  });

  const updateStatus = useMutation(api.messages.updateStatus);

  const filtered = (messages ?? [])
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      if (sort === "date-old") {
        return a.createdAt - b.createdAt;
      }

      return b.createdAt - a.createdAt;
    });

  // Get counts for each tab
  const getTabCount = (tab: Tab) => {
    if (!messages) return 0;
    return messages.filter((m) => m.status === tab).length;
  };

  const getStatusIcon = (status: Tab) => {
    switch (status) {
      case "new": return "fas fa-envelope text-blue-600";
      case "read": return "fas fa-envelope-open text-green-600";
      case "archived": return "fas fa-archive text-gray-600";
      default: return "fas fa-envelope text-gray-600";
    }
  };

  const getStatusColor = (status: Tab) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "read": return "bg-green-100 text-green-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-2">Manage and respond to inquiries from parents and visitors</p>
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
              <p className="text-sm text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-blue-600">{getTabCount("new")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-envelope text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Read Messages</p>
              <p className="text-2xl font-bold text-green-600">{getTabCount("read")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-envelope-open text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-600">{getTabCount("archived")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <i className="fas fa-archive text-gray-600 text-xl"></i>
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
                className={`relative px-4 py-4 font-medium text-sm capitalize transition-colors flex items-center gap-2 ${
                  activeTab === tab
                    ? "text-primary-red"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className={getStatusIcon(tab)}></i>
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-red"></div>
                )}
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
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
                placeholder="Search by name, email, or message content..."
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
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="p-6">
          {messages === undefined ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-3"></i>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-comments text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No {activeTab} messages found
              </h3>
              <p className="text-gray-500">
                {search ? "Try adjusting your search query" : `No messages in ${activeTab} category`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((m) => (
                <div
                  key={m._id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-primary-red/30 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Sender Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-red/10 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-primary-red text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {m.name}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(m.status)}`}>
                              <i className={`fas fa-circle text-xs mr-1 ${m.status === 'new' ? 'text-blue-500' : m.status === 'read' ? 'text-green-500' : 'text-gray-500'}`}></i>
                              {m.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <i className="fas fa-envelope text-gray-400"></i>
                              <a 
                                href={`mailto:${m.email}`}
                                className="hover:text-primary-red transition-colors"
                              >
                                {m.email}
                              </a>
                            </div>
                            {m.contactNo && (
                              <div className="flex items-center gap-2">
                                <i className="fas fa-phone text-gray-400"></i>
                                <a 
                                  href={`tel:${m.contactNo}`}
                                  className="hover:text-primary-red transition-colors"
                                >
                                  {m.contactNo}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="mt-4 pl-15">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {m.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Date */}
                    <div className="flex flex-col items-end gap-4 min-w-[180px]">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          <i className="fas fa-calendar mr-1"></i>
                          {formatDate(m.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {m.status === "new" && (
                          <button
                            onClick={() =>
                              updateStatus({
                                messageId: m._id,
                                status: "read",
                              })
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <i className="fas fa-check text-xs"></i>
                            Mark as Read
                          </button>
                        )}

                        {m.status !== "archived" ? (
                          <button
                            onClick={() =>
                              updateStatus({
                                messageId: m._id,
                                status: "archived",
                              })
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                          >
                            <i className="fas fa-archive text-xs"></i>
                            Archive
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStatus({
                                messageId: m._id,
                                status: "read",
                              })
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            <i className="fas fa-inbox text-xs"></i>
                            Move to Read
                          </button>
                        )}

                        <a
                          href={`mailto:${m.email}?subject=Re: Your inquiry to Pequeños Gigantes`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-red/10 text-primary-red rounded-lg hover:bg-primary-red/20 transition-colors text-sm font-medium"
                        >
                          <i className="fas fa-reply text-xs"></i>
                          Reply
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          Showing <span className="font-medium">{filtered.length}</span> of{" "}
          <span className="font-medium">{messages?.length || 0}</span> messages
        </div>
        <div className="flex items-center gap-2">
          <i className="fas fa-info-circle text-gray-400"></i>
          <span>Click on email or phone to contact the sender directly</span>
        </div>
      </div>
    </div>
  );
}