// pages/AdminParentProfile.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

type TabType = "overview" | "students";

export default function AdminParentProfile() {
  const { user, role } = useAuth();
  const { parentId } = useParams<{ parentId: string }>();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Queries - using existing queries from your schema
  const parent = useQuery(api.users.getById, 
    parentId ? { userId: parentId as Id<"users"> } : "skip"
  );
  
  const allStudents = useQuery(api.students.listAll);
  const parentStudents = useQuery(api.admin.getParentStudents, 
    parentId ? { parentId: parentId as Id<"users"> } : "skip"
  );

  // Mutations - using existing mutations
  const updateUser = useMutation(api.users.update);
  const toggleUserStatus = useMutation(api.admin.toggleUserStatus);
  const deleteUser = useMutation(api.admin.deleteUser);
  const assignStudentToParent = useMutation(api.admin.assignStudentToParent);
  const unassignStudentFromParent = useMutation(api.admin.unassignStudentFromParent);


  if (!user || role !== "admin") return <Navigate to="/login" />;
  if (!parentId) return <Navigate to="/admin/manage-accounts" />;

  // Validate that this is actually a parent
  if (parent && parent.role !== "parent") {
    return <Navigate to="/admin/manage-accounts" />;
  }

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!parentStudents) return [];
    
    return parentStudents.filter(student => 
      searchQuery === "" ||
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parentStudents, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalStudents: parentStudents?.length || 0,
      activeStudents: parentStudents?.length || 0, // Assuming all students are active in your schema
    };
  }, [parentStudents]);

  // Handlers
  const handleToggleStatus = async () => {
    if (!parent) return;
    
    try {
      await toggleUserStatus({ 
        userId: parent._id, 
        status: !parent.isActive 
      });
    } catch (error) {
      console.error("Error toggling parent status:", error);
    }
  };

  const handleDeleteParent = async () => {
    if (!parent) return;
    
    try {
      await deleteUser({ userId: parent._id });
      // Redirect after deletion
      window.location.href = "/admin/manage-accounts";
    } catch (error) {
      console.error("Error deleting parent:", error);
    }
  };

  const handleRemoveStudent = async (studentId: Id<"students">) => {
    if (!parent) return;
    
    if (!window.confirm("Are you sure you want to remove this student from the parent?")) return;
    
    try {
      await unassignStudentFromParent({
        parentId: parent._id,
        studentId
      });
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const handleAddStudent = async (studentId: string) => {
    if (!parent) return;
    
    try {
      await assignStudentToParent({
        parentId: parent._id,
        studentId: studentId as Id<"students">
      });
      
      setShowAddStudentModal(false);
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  if (parent === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-3"></i>
          <p className="text-gray-600">Loading parent information...</p>
        </div>
      </div>
    );
  }

  if (parent === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <i className="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Parent Not Found</h2>
          <p className="text-gray-600 mb-6">The parent account you're looking for doesn't exist or has been deleted.</p>
          <Link
            to="/admin/manage-accounts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Parent Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link to="/admin" className="hover:text-primary-red">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to="/admin/manage-accounts" className="hover:text-primary-red">Manage Accounts</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="font-medium text-gray-900">{parent.fullName}</span>
      </div>

      {/* Parent Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-red/10 flex items-center justify-center">
              <i className="fas fa-user text-3xl text-primary-red"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{parent.fullName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  parent.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {parent.isActive ? "Active" : "Disabled"}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{parent.email}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">Parent since {new Date(parent._creationTime).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <i className="fas fa-edit"></i>
              Edit Profile
            </button>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                parent.isActive
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
            >
              <i className={`fas fa-${parent.isActive ? "ban" : "check"}`}></i>
              {parent.isActive ? "Disable Account" : "Activate Account"}
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registered Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-user-graduate text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <div className="text-2xl font-bold">
                <span className={parent.isActive ? "text-green-600" : "text-red-600"}>
                  {parent.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              parent.isActive ? "bg-green-50" : "bg-red-50"
            }`}>
              <i className={`fas fa-${parent.isActive ? "check-circle" : "ban"} text-xl ${
                parent.isActive ? "text-green-600" : "text-red-600"
              }`}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === "overview"
                  ? "border-primary-red text-primary-red"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-info-circle mr-2"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${
                activeTab === "students"
                  ? "border-primary-red text-primary-red"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-user-graduate mr-2"></i>
              Students ({parentStudents?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-address-card text-primary-red"></i>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{parent.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{parent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Role</p>
                      <p className="font-medium capitalize">{parent.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">{new Date(parent._creationTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-cog text-primary-red"></i>
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parent.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {parent.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium font-mono text-sm break-all">{parent._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Associated Students</p>
                      <p className="font-medium">{parentStudents?.length || 0} student(s)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registered Students ({parentStudents?.length || 0})
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add Student
                  </button>
                </div>
              </div>

              {parentStudents === undefined ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl text-primary-red mb-3"></i>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              ) : parentStudents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="fas fa-user-graduate text-4xl text-gray-300 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Students Registered</h4>
                  <p className="text-gray-500 mb-6">This parent doesn't have any registered students yet.</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
                  >
                    <i className="fas fa-plus"></i>
                    Add First Student
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Students Found</h4>
                  <p className="text-gray-500">Try adjusting your search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map(student => (
                    <div key={student._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.fullName}</h4>
                          <p className="text-sm text-gray-500">{student.gradeLevel}</p>
                        </div>
                        {student.overall !== undefined && (
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              student.overall >= 85 ? "text-green-600" :
                              student.overall >= 70 ? "text-blue-600" :
                              student.overall >= 60 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {student.overall}%
                            </div>
                            <div className="text-xs text-gray-500">Overall</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <i className="fas fa-graduation-cap text-gray-400"></i>
                          <span>Grade: {student.gradeLevel}</span>
                        </div>
                        {student.letterGrade && (
                          <div className="flex items-center gap-2 text-sm">
                            <i className="fas fa-award text-gray-400"></i>
                            <span>Grade: {student.letterGrade}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-sm hover:bg-gray-100 text-center"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleRemoveStudent(student._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditParentModal
          parent={parent}
          onClose={() => setShowEditModal(false)}
          onSave={updateUser}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          parentId={parent._id}
          parentStudents={parentStudents || []}
          allStudents={allStudents || []}
          onClose={() => setShowAddStudentModal(false)}
          onAdd={handleAddStudent}
        />
      )}

      {showConfirmDelete && (
        <ConfirmDeleteModal
          parentName={parent.fullName}
          studentCount={parentStudents?.length || 0}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleDeleteParent}
        />
      )}
    </div>
  );
}

// Edit Parent Modal Component
function EditParentModal({ parent, onClose, onSave }: { 
  parent: any; 
  onClose: () => void; 
  onSave: any;
}) {
  const [formData, setFormData] = useState({
    fullName: parent.fullName || "",
    email: parent.email || "",
    isActive: parent.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        userId: parent._id,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error("Error updating parent:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Parent Profile</h2>
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
                Full Name *
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
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Account is Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-primary-red text-white py-2.5 rounded-lg hover:bg-red-700"
              >
                Save Changes
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

// Add Student Modal Component
function AddStudentModal({ 
  parentId, 
  parentStudents, 
  allStudents, 
  onClose, 
  onAdd 
}: { 
  parentId: Id<"users">; 
  parentStudents: any[];
  allStudents: any[];
  onClose: () => void; 
  onAdd: (studentId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  // Get student IDs already assigned to this parent
  const assignedStudentIds = useMemo(() => {
    return new Set(parentStudents.map(student => student._id));
  }, [parentStudents]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => 
      // Filter out already assigned students
      !assignedStudentIds.has(student._id) &&
      // Filter by search
      (search === "" ||
        student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        student.gradeLevel.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allStudents, search, assignedStudentIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await onAdd(selectedStudent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Student to Parent</h2>
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
                Search Students
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Search by name or grade level..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {search ? "No unassigned students found" : "All students are already assigned"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map(student => (
                    <label
                      key={student._id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedStudent === student._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="student"
                        value={student._id}
                        checked={selectedStudent === student._id}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="text-primary-red"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{student.fullName}</div>
                        <div className="text-sm text-gray-500">{student.gradeLevel}</div>
                      </div>
                      {student.parentId && student.parentId !== parentId && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Has other parent
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedStudent}
                className={`flex-1 py-2.5 rounded-lg ${
                  selectedStudent
                    ? "bg-primary-red text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Add Student
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

// Confirm Delete Modal Component
function ConfirmDeleteModal({ 
  parentName, 
  studentCount, 
  onClose, 
  onConfirm 
}: { 
  parentName: string;
  studentCount: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Parent Account</h2>
            <p className="text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{parentName}</span>?
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
              <div>
                <p className="font-medium text-red-800 mb-1">This action cannot be undone</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• The parent account will be permanently deleted</li>
                  <li>• All associated login credentials will be removed</li>
                  {studentCount > 0 && (
                    <li>• {studentCount} student{studentCount !== 1 ? 's' : ''} will lose access to this parent account</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-medium"
            >
              Yes, Delete Account
            </button>
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