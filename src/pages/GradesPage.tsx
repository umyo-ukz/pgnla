import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function GradesPage() {
  const { parent } = useAuth();
  const { studentId } = useParams();

  if (parent === undefined) return null;
  if (parent === null) return <Navigate to="/login" />;

  if (!studentId) return <Navigate to="/parents" />;

  const grades = useQuery(api.grades.listForStudent, {
    studentId: studentId as any,
  });

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grades</h1>
        <Link to="/parent-dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {/* Grades table */}
      {grades === undefined ? (
        <div>Loading grades…</div>
      ) : grades.length === 0 ? (
        <div className="text-gray-600">
          No grades available yet.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Term</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id} className="border-b last:border-0">
                  <td className="p-4">{g.subject}</td>
                  <td className="p-4">{g.term}</td>
                  <td className="p-4 font-semibold">{g.score}%</td>
                  <td className="p-4">
                    <GradeBadge score={g.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GradeBadge({ score }: { score: number }) {
  if (score >= 75)
    return <span className="text-green-600 font-semibold">Pass</span>;
  if (score >= 50)
    return <span className="text-yellow-600 font-semibold">Borderline</span>;
  return <span className="text-red-600 font-semibold">Needs Improvement</span>;
}
