// pages/AdminStudentProfile.tsx
import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminStudentProfile() {
  const { user, role } = useAuth();
  const { studentId } = useParams<{ studentId: string }>();

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    gradeLevel: "",
    studentId: "",
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!user || role !== "admin") return <Navigate to="/login" />;
  if (!studentId) return <Navigate to="/admin/manage-accounts" />;

  // Fetch student details
  const student = useQuery(api.students.getById, {
    studentId: studentId as Id<"students">,
  });

  // Fetch parent information if available
  const parent = useQuery(api.admin.getParentByStudentId, {
    studentId: studentId as Id<"students">,
  });

  // Fetch academic information (similar to staff student profile)
  const academicProfile = useQuery(api.grades.getStudentProfile, {
    studentId: studentId as Id<"students">,
  });

  // Fetch all available grade levels
  const gradeLevels = useQuery(api.admin.getGradeLevels);

  // Mutations
  const updateStudent = useMutation(api.admin.updateStudent);
  const deleteStudent = useMutation(api.admin.deleteStudent);
  const assignStudentToParent = useMutation(api.admin.assignStudentToParent);
  const unassignStudentFromParent = useMutation(api.admin.unassignStudentFromParent);

  // Initialize edit form when student data loads
  useEffect(() => {
    if (student) {
      setEditForm({
        fullName: student.fullName || "",
        gradeLevel: student.gradeLevel || "",
        studentId: student._id || "",
      });
    }
  }, [student]);

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save student edits
  const handleSave = async () => {
    if (!student) return;

    try {
      await updateStudent({
        studentId: student._id,
        ...editForm
      });
      setIsEditing(false);
      alert("Student information updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student information.");
    }
  };

  // Delete student
  const handleDelete = async () => {
    if (!student) return;

    try {
      await deleteStudent({ studentId: student._id });
      alert("Student deleted successfully!");
      window.location.href = "/admin/manage-accounts";
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    }
  };

  // Remove student from parent
  const handleRemoveParent = async () => {
    if (!student || !student.parentId) return;

    if (!window.confirm(`Remove ${student.fullName} from ${parent?.fullName}?`)) return;

    try {
      await unassignStudentFromParent({
        studentId: student._id,
        parentId: student.parentId
      });
      alert("Student removed from parent successfully!");
    } catch (error) {
      console.error("Error removing student from parent:", error);
      alert("Failed to remove student from parent.");
    }
  };

  // Loading state
  if (student === undefined || academicProfile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-3"></i>
          <p className="text-gray-600">Loading student information...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <i className="fas fa-user-graduate text-4xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist or has been deleted.</p>
          <Link
            to="/admin/manage-accounts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Account Management
          </Link>
        </div>
      </div>
    );
  }

  // Helper functions for grades display (similar to staff profile)
  const getLetterGrade = (score: number) => {
    if (score >= 96) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 86) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 76) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 66) return "D+";
    if (score >= 63) return "D";
    if (score >= 60) return "D-";
    return "F";
  };

  const getColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Calculate overall average if academic data exists
  const overallAverage = academicProfile?.grades.length > 0
    ? academicProfile.grades.reduce((sum, g) => sum + g.average, 0) / academicProfile.grades.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link to="/admin" className="hover:text-primary-red">Dashboard</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <Link to="/admin/manage-accounts" className="hover:text-primary-red">Manage Accounts</Link>
        <i className="fas fa-chevron-right text-xs"></i>
        <span className="font-medium text-gray-900">{student.fullName}</span>
      </div>

      {/* Student Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-red/10 flex items-center justify-center">
              <i className="fas fa-user-graduate text-3xl text-primary-red"></i>
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className="text-2xl font-bold border border-gray-300 rounded-lg px-3 py-2 w-full"
                    placeholder="Student Full Name"
                  />
                  <div className="flex gap-3">
                    <select
                      name="gradeLevel"
                      value={editForm.gradeLevel}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Grade Level</option>
                      {gradeLevels?.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="studentId"
                      value={editForm.studentId}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Student ID"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{student.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.gradeLevel}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">ID: {student.studentId || "Not assigned"}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Enrolled: {student.enrollmentDate 
                      ? new Date(student.enrollmentDate).toLocaleDateString()
                      : "Unknown"
                    }</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      fullName: student.fullName || "",
                      gradeLevel: student.gradeLevel || "",
                      studentId: student.studentId || "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <i className="fas fa-edit"></i>
                  Edit Student
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                  <i className="fas fa-trash"></i>
                  Delete Student
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className={`text-2xl font-bold ${getColor(overallAverage)}`}>
                {overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-chart-line text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Grade</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallAverage > 0 ? getLetterGrade(overallAverage) : "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <i className="fas fa-award text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Grade Level</p>
              <p className="text-2xl font-bold text-gray-900">{student.gradeLevel}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Parent Account</p>
              <p className="text-lg font-bold text-gray-900">
                {parent ? "Linked" : "Not Linked"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <i className="fas fa-user-friends text-amber-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button className="px-6 py-4 font-medium text-sm border-b-2 border-primary-red text-primary-red flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Student Information
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Student Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Performance */}
              {academicProfile?.grades && academicProfile.grades.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-chart-bar text-primary-red"></i>
                    Academic Performance
                  </h3>
                  
                  {academicProfile.grades.map((subjectGroup, idx) => {
                    const color = getColor(subjectGroup.average);
                    const statusColor = getStatusColor(subjectGroup.average);

                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {subjectGroup.subject?.name || "Unnamed Subject"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {subjectGroup.term?.name || "No Term"} • {subjectGroup.classSubject?.gradeLevel || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${color}`}>
                              {subjectGroup.average.toFixed(1)}%
                            </div>
                            <div className={`text-sm font-semibold ${color}`}>
                              {getLetterGrade(subjectGroup.average)}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{subjectGroup.average.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                subjectGroup.average >= 75
                                  ? "bg-green-500"
                                  : subjectGroup.average >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(subjectGroup.average, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Components (collapsible) */}
                        {subjectGroup.components.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Component Breakdown:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {subjectGroup.components.map(({ component, grade }) => (
                                <div key={grade._id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                  <span className="text-gray-700">{component?.name || "Component"}</span>
                                  <span className={`font-medium ${getColor(grade.score)}`}>
                                    {grade.score}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <i className="fas fa-chart-line text-3xl text-gray-300 mb-3"></i>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Academic Data</h4>
                  <p className="text-gray-500">This student doesn't have any recorded grades yet.</p>
                </div>
              )}
            </div>

            {/* Right Column: Student & Parent Info */}
            <div className="space-y-6">
              {/* Student Details */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-id-card text-primary-red"></i>
                  Student Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade Level</p>
                    <p className="font-medium">{student.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{student.studentId || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{student.dateOfBirth 
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : "Not specified"
                    }</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Enrollment Date</p>
                    <p className="font-medium">{student.enrollmentDate 
                      ? new Date(student.enrollmentDate).toLocaleDateString()
                      : "Not specified"
                    }</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Info */}
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user-friends text-primary-red"></i>
                    Parent/Guardian
                  </h3>
                  {parent && student.parentId && (
                    <button
                      onClick={handleRemoveParent}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-unlink mr-1"></i>
                      Unlink
                    </button>
                  )}
                </div>
                
                {parent ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Parent Name</p>
                      <Link
                        to={`/admin/parents/${parent._id}`}
                        className="font-medium text-primary-red hover:underline"
                      >
                        {parent.fullName}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <a
                        href={`mailto:${parent.email}`}
                        className="font-medium text-primary-red hover:underline"
                      >
                        {parent.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <a
                        href={`tel:${parent.phone}`}
                        className="font-medium text-primary-red hover:underline"
                      >
                        {parent.phone || "Not provided"}
                      </a>
                    </div>
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
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-user-slash text-2xl text-gray-300 mb-2"></i>
                    <p className="text-gray-600 mb-3">No parent account linked</p>
                    <button className="text-sm text-primary-red hover:text-red-700 font-medium">
                      <i className="fas fa-link mr-1"></i>
                      Link to Parent
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-primary-red/5 border border-primary-red/20 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-gray-700 flex items-center gap-2"
                  >
                    <i className="fas fa-edit text-primary-red"></i>
                    Edit Student Information
                  </button>
                  <Link
                    to={`/staff/performance/${student._id}`}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-gray-700 flex items-center gap-2"
                  >
                    <i className="fas fa-eye text-primary-red"></i>
                    View Staff Profile
                  </Link>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-red-600 flex items-center gap-2"
                  >
                    <i className="fas fa-trash"></i>
                    Delete Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Student</h2>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{student.fullName}</span>?
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-red-800 mb-1">This action cannot be undone</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• All student records will be permanently deleted</li>
                      <li>• All grades and academic data will be removed</li>
                      <li>• Parent will lose access to this student's information</li>
                      {parent && (
                        <li>• Student will be unlinked from {parent.fullName}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-medium"
                >
                  Yes, Delete Student
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}