import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

export default function AdminStudentProfile() {
  const { user, role } = useAuth();
  const { studentId } = useParams<{ studentId: string }>();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editedGradeLevel, setEditedGradeLevel] = useState("");

  // Queries
  const student = useQuery(api.admin.getStudentById, { studentId: studentId as any });
  const parent = useQuery(api.admin.getParentByStudentId, { studentId: studentId as any });
  const application = useQuery(api.admin.getStudentApplicationByStudentId, { studentId: studentId as any });

  // Mutations
  const updateStudent = useMutation(api.admin.updateStudent);

  // Functions
  const handleEditClick = () => {
    if (student) {
      setEditedGradeLevel(student.gradeLevel);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!student) return;
    try {
      await updateStudent({
        studentId: student._id,
        gradeLevel: editedGradeLevel,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedGradeLevel("");
  };

  if (!user || role !== "admin") return <Navigate to="/login" />;
  if (!studentId) return <Navigate to="/admin/students" />;

  if (student === undefined || parent === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-primary-red mb-3"></i>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The requested student could not be found.</p>
          <Link
            to="/admin/students"
            className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700"
          >
            Back to Student List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Student Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed information about {student.fullName}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/students"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Student List
          </Link>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-red rounded-full flex items-center justify-center">
            <i className="fas fa-user-graduate text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student.fullName}</h2>
            <p className="text-gray-600">Grade Level: {student.gradeLevel}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Grade Level:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedGradeLevel}
                    onChange={(e) => setEditedGradeLevel(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Enter grade level"
                  />
                ) : (
                  <span className="font-medium">{student.gradeLevel}</span>
                )}
              </div>
              {student.overall !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Grade:</span>
                  <span className="font-medium">{student.overall}%</span>
                </div>
              )}
              {student.letterGrade && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Letter Grade:</span>
                  <span className={`font-medium px-2 py-1 rounded text-sm ${
                    student.letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                    student.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                    student.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    student.letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.letterGrade}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Student ID:</span>
                <span className="font-medium font-mono text-sm">{student._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(student._creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="fas fa-user-friends text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Parent Information</h2>
            {parent ? (
              <p className="text-gray-600">Parent account details</p>
            ) : (
              <p className="text-orange-600">No parent assigned</p>
            )}
          </div>
        </div>

        {parent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium">{parent.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{parent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium capitalize">{parent.role}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${parent.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {parent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parent ID:</span>
                  <span className="font-medium font-mono text-sm">{parent._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">
                    {new Date(parent._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fas fa-user-slash text-3xl text-gray-300 mb-3"></i>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Parent Assigned</h3>
            <p className="text-gray-500 mb-4">
              This student has not been assigned to a parent account yet.
            </p>
            <button className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700">
              Assign Parent
            </button>
          </div>
        )}
      </div>

      {/* Application Information Card */}
      {application && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <i className="fas fa-file-alt text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Application Information</h2>
              <p className="text-gray-600">Student application and registration details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="font-medium">{application.dateOfBirth || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{application.gender || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Program Type:</span>
                  <span className="font-medium">{application.programType || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intended Grade:</span>
                  <span className="font-medium">{application.intendedGradeLevel || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{application.startDate || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
              <div className="space-y-2">
                {application.medicalInfo ? (
                  <div>
                    <span className="text-gray-600">Medical Information:</span>
                    <p className="font-medium mt-1">{application.medicalInfo}</p>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medical Information:</span>
                    <span className="font-medium">None reported</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{application.emergencyName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relationship:</span>
                  <span className="font-medium">{application.emergencyRelationship || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{application.emergencyPhone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          to={`/admin/grades?student=${student._id}`}
          className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <i className="fas fa-chart-line"></i>
          View Grades
        </Link>

        <button
          onClick={handleEditClick}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <i className="fas fa-edit"></i>
          Edit Student
        </button>

        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2">
          <i className="fas fa-trash"></i>
          Delete Student
        </button>
      </div>
    </div>
  );
}
