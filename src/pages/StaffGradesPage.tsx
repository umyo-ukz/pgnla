import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import StudentGradeCard from "../components/StudentGradeCard";

export default function StaffGradesPage() {
  const subjects = useQuery(api.subjects.listSubjects);
  const students = useQuery(api.staff.listAllStudents);

  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  if (!subjects || !students) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Grades</h1>

      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-2">
        {subjects.map((s) => (
          <button
            key={s._id}
            onClick={() => setActiveSubject(s._id)}
            className={`px-4 py-2 rounded-full text-sm ${
              activeSubject === s._id
                ? "bg-red-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {!activeSubject ? (
        <div className="text-gray-600">
          Select a subject to edit grades.
        </div>
      ) : (
        <div className="space-y-6">
          {students.map((student) => (
            <StudentGradeCard
              key={student._id}
              student={student}
              subjectId={activeSubject}
              subjectWeight={subjects.find(s => s._id === activeSubject)?.weight ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
