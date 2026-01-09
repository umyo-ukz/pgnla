// pages/AdminManageAccounts.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

type ViewMode = "parents" | "staff";
type StatusFilter = "all" | "active" | "disabled";
type SortOrder = "asc" | "desc";

interface UserAccount {
  _id: Id<"users">;
  fullName: string;
  email: string;
  role: "parent" | "staff" | "admin";
  isActive: boolean;
  createdAt: number;
  lastLogin?: number;
  // Additional fields for parents
  childrenCount?: number;
  // Additional fields for staff
  department?: string;
  position?: string;
}

export default function AdminManageAccounts() {
  const { user, role } = useAuth();

  // State management
  const [view, setView] = useState<ViewMode>("parents");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Queries
  const parents = useQuery(api.admin.listParents);
  const staff = useQuery(api.admin.listStaff);


  // Mutations
  const toggleUserStatus = useMutation(api.admin.toggleUserStatus);
  const deleteUser = useMutation(api.admin.deleteUser);
  const createStaffAccount = useMutation(api.admin.createStaffAccount);



  if (!user || role !== "admin") return <Navigate to="/login" />;

  // Process user data
  const processUsers = (users: any[] | undefined): UserAccount[] => {
    if (!users) return [];

    return users.map(user => ({
      ...user,
      childrenCount: user.children?.length || 0,
      createdAt: user._creationTime,
    }));
  };

  const parentsList = processUsers(parents);
  const staffList = processUsers(staff);
  const activeList = view === "parents" ? parentsList : staffList;

  // Filter and search
  const filteredUsers = useMemo(() => {
    if (!activeList) return [];

    let filtered = activeList.filter((u) => {
      // Search filter
      const matchesSearch = `${u.fullName} ${u.email} ${u.department || ''} ${u.position || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = u.isActive;
      if (statusFilter === "disabled") matchesStatus = !u.isActive;

      return matchesSearch && matchesStatus;
    });

    // Sort by fullName
    filtered.sort((a, b) => {
      const comparison = a.fullName.localeCompare(b.fullName);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [activeList, search, statusFilter, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const list = view === "parents" ? parentsList : staffList;
    const total = list.length;
    const active = list.filter(u => u.isActive).length;
    const disabled = total - active;

    return { total, active, disabled };
  }, [view, parentsList, staffList]);

  // Handlers
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus({
        userId: userId as Id<"users">,
        status: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser({ userId: userId as Id<"users"> });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.size === 0 || !bulkAction) return;

    const confirmMessage = bulkAction === "delete"
      ? `Are you sure you want to delete ${selectedUsers.size} selected users? This cannot be undone.`
      : `Are you sure you want to ${bulkAction} ${selectedUsers.size} selected users?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      for (const userId of selectedUsers) {
        switch (bulkAction) {
          case "activate":
            await toggleUserStatus({ userId: userId as Id<"users">, status: true });
            break;
          case "deactivate":
            await toggleUserStatus({ userId: userId as Id<"users">, status: false });
            break;
          case "delete":
            await deleteUser({ userId: userId as Id<"users"> });
            break;
        }
      }
      setSelectedUsers(new Set());
      setBulkAction("");
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const allIds = filteredUsers.map(u => u._id);
      setSelectedUsers(new Set(allIds));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {view === "parents" ? "Parent" : "Staff"} Account Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, permissions, and access
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Create New {view === "staff" ? "Staff" : "Account"}
          </button>

          <Link
            to="/admin"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disabled Accounts</p>
              <p className="text-2xl font-bold text-red-600">{stats.disabled}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <i className="fas fa-ban text-red-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* View Toggle */}
          <div className="flex border rounded-lg p-1">
            <button
              onClick={() => {
                setView("parents");
                setSelectedUsers(new Set());
              }}
              className={`px-4 py-2 rounded-md transition ${view === "parents"
                ? "bg-primary-red text-white"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              Parents ({parentsList.length})
            </button>
            <button
              onClick={() => {
                setView("staff");
                setSelectedUsers(new Set());
              }}
              className={`px-4 py-2 rounded-md transition ${view === "staff"
                ? "bg-primary-red text-white"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              Staff ({staffList.length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-800">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedUsers.size === filteredUsers.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${bulkAction
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {activeList === undefined ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-primary-red mb-3"></i>
            <p className="text-gray-600">Loading {view}...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-users text-3xl text-gray-300 mb-3"></i>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No {view} found
            </h3>
            <p className="text-gray-500">
              {search ? 'Try adjusting your search or filters' : `No ${view} accounts have been created yet`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  {view === "staff" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                  )}
                  {view === "parents" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Children
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(u._id)}
                        onChange={() => toggleSelectUser(u._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{u.fullName}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    {view === "staff" && (
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{u.position || "Not specified"}</div>
                        {u.department && (
                          <div className="text-xs text-gray-500">{u.department}</div>
                        )}
                      </td>
                    )}
                    {view === "parents" && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {u.childrenCount || 0} children
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                          className={`px-3 py-1 rounded text-sm ${u.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                        >
                          {u.isActive ? "Disable" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                        >
                          Delete
                        </button>
                        <Link
                          to={`/admin/parents/${u._id}`}
                          className="px-3 py-1 bg-gray-50 text-gray-700 rounded text-sm hover:bg-gray-100"
                        >
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && view === "staff" && (
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createStaffAccount}
        />
      )}

      {/* Create Parent Modal */}
      {showCreateModal && view === "parents" && (
        <CreateParentModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

// Create Staff Modal Component
function CreateStaffModal({ onClose, onCreate }: { onClose: () => void; onCreate: any }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    position: "",
    department: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreate(formData);
      onClose();
    } catch (error) {
      console.error("Error creating staff account:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Staff Account</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-red text-white py-2.5 rounded-lg hover:bg-red-700"
              >
                Create Staff Account
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Create Parent Modal Component
function CreateParentModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Parent Account</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Parent accounts should be created through the registration process.
            You can approve pending registrations from the Registrations page.
          </p>

          <div className="flex gap-3">
            <Link
              to="/admin/registrations"
              className="flex-1 bg-primary-red text-white py-2.5 rounded-lg hover:bg-red-700 text-center"
            >
              Go to Registrations
            </Link>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

