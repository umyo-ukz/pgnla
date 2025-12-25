import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function ParentDashboard() {
  const { parent, logout } = useAuth();


  // Loading state
  if (parent === undefined) return null;

  // Not authenticated
  if (parent === null) return <Navigate to="/login" />;

  const students = useQuery(
    api.students.listForParent,
    { parentId: parent._id }
  );



  return (
    <div className="container-wide px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {parent.fullName}
        </h1>
        <Link to="/home`" onClick={logout} className="btn-secondary">
          Logout
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Students list */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Your Children</h2>

          {students === undefined ? (
            <div>Loading students…</div>
          ) : students.length === 0 ? (
            <div className="text-gray-600">
              You have not added any children yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {students.map((s) => (
                <li
                  key={s._id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">{s.fullName}</div>
                    <div className="text-sm text-gray-600">
                      Grade: {s.gradeLevel}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
