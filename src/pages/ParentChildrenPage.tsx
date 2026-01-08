// pages/ParentChildrenPage.tsx
import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ParentChildrenPage() {
  const { user, role, isLoading, isAuthenticated } = useAuth();

  const students = useQuery(api.students.listForParent, 
    user ? { parentId: user._id } : "skip"
  );

  if (!isAuthenticated || !user || role !== "parent") {
    return <Navigate to="/login" />;
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Children
        </h1>
        <p className="text-gray-600">
          View and manage your registered children
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {students === undefined ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading children information...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No Children Registered
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't registered any children yet.
            </p>
            <Link
              to="/registration"
              className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700"
            >
              Register a Student
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-red/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-red">
                      {student.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">{student.gradeLevel}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link
                    to={`/parent/student/${student._id}`}
                    className="block w-full text-center bg-primary-red text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}