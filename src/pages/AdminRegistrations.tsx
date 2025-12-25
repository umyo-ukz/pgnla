import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRegistrations() {
  const { admin } = useAuth();

  if (admin === undefined) return null;
  if (!admin) return <Navigate to="/admin/login" />;

  const registrations = useQuery(api.registrations.listPending);

  return (
    <div className="container-wide px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        Pending Registrations
      </h1>

      {!registrations ? (
        <div>Loading…</div>
      ) : registrations.length === 0 ? (
        <div>No pending registrations.</div>
      ) : (
        <div className="space-y-4">
          {registrations.map(r => (
            <div key={r._id} className="border rounded-lg p-4">
              <div className="font-semibold">
                {r.studentFirstName} {r.studentLastName}
              </div>
              <div className="text-sm text-gray-600">
                Parent: {r.primaryParentName} · {r.email}
              </div>
              <div className="mt-3 flex gap-3">
                <button className="btn-primary">
                  Approve
                </button>
                <button className="btn-secondary">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
