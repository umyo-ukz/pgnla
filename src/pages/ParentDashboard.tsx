import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ParentDashboard() {
  const { parent, logout } = useAuth();

  if (parent === undefined) return null;
  if (!parent) return <Navigate to="/login" />;

  const students = useQuery(api.students.listForParent, {
    parentId: parent._id,
  });

  const studentCount = students?.length ?? 0;

  return (
    <div className="container-wide px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {parent.fullName}
          </h1>
          <p className="text-gray-600">
            Parent portal overview
          </p>
        </div>

        <div className="flex gap-3">
          <Link to= "/home" onClick={logout} className="btn-secondary">
            Logout
          </Link>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Registered Children"
          value={studentCount}
        />
        <DashboardCard
          title="Average Grade"
          value="—"
        />
        <DashboardCard
          title="Attendance Alerts"
          value="0"
        />
        <DashboardCard
          title="Reports Available"
          value="—"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Your Children
          </h2>

          {students === undefined ? (
            <div>Loading students…</div>
          ) : students.length === 0 ? (
            <div className="text-gray-600">
              No children have been added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map((s) => (
                <div
                  key={s._id}
                  className="border rounded-xl p-5 space-y-3"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {s.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Grade: {s.gradeLevel}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/student/${s._id}/grades`}
                      className="btn-primary text-sm"
                    >
                      View Grades
                    </Link>
                    <Link
                      to={`/student/${s._id}/attendance`}
                      className="btn-secondary text-sm"
                    >
                      Attendance
                    </Link>
                    <Link
                      to={`/student/${s._id}/reports`}
                      className="btn-secondary text-sm"
                    >
                      Reports
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <aside className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">
            Recent Activity
          </h2>

          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              📄 New term report available
            </li>
            <li>
              📝 Grade updated for Mathematics
            </li>
            <li>
              📅 Attendance recorded
            </li>
          </ul>

          <div className="mt-4">
            <Link to="/reports" className="btn-secondary w-full text-center">
              View All Activity
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Simple reusable stat card */
function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-xl p-5">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
