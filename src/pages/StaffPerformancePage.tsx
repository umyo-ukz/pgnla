import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StaffPerformancePage() {
  const students = useQuery(api.staff.listStudentOverallPerformance);

  if (!students) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Performance</h1>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Overall %</th>
              <th className="p-4">Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b last:border-0">
                <td className="p-4 font-medium">{s.fullName}</td>
                <td className="p-4 font-semibold">{s.overall}%</td>
                <td className="p-4 text-gray-700">{s.letter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
