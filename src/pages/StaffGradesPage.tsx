import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import StudentGradeCard from "../components/StudentGradeCard";

export default function StaffGradesPage() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const terms = useQuery(api.terms.listActive);
  const students = useQuery(api.staff.listAllStudents);

  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [activeClassSubjectId, setActiveClassSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTermId && terms?.length) {
      setActiveTermId(terms[0]._id);
    }
  }, [terms, activeTermId]);

  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTermId
      ? { gradeLevel: user.gradeLevel, termId: activeTermId }
      : "skip"
  );

  const updateSubjectWeight = useMutation(api.classSubjects.updateSubjectWeight);

  return (
    <div className="container-wide px-4 py-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Grades</h1>
        <button onClick={logout} className="btn-secondary">Logout</button>
      </header>

      {/* Subject Tabs */}
      <div className="flex gap-4 border-b">
        {classSubjects?.map(cs => (
          <button
            key={cs._id}
            onClick={() => setActiveClassSubjectId(cs._id)}
            className={`pb-2 ${
              activeClassSubjectId === cs._id
                ? "border-b-2 border-primary-red font-semibold"
                : "text-gray-500"
            }`}
          >
            {cs.subject.name}
          </button>
        ))}
      </div>

      {/* Subject Weight */}
      {activeClassSubjectId && (
        <div className="bg-white border p-4 rounded">
          <label className="text-sm font-medium">Subject Weight (%)</label>
          <input
            type="number"
            className="input w-32 mt-1"
            onBlur={e =>
              updateSubjectWeight({
                classSubjectId: activeClassSubjectId,
                weight: Number(e.target.value),
              })
            }
          />
        </div>
      )}

      {/* Students */}
      <div className="space-y-6">
        {students?.map(student => (
          <StudentGradeCard
            key={student._id}
            student={student}
            classSubjectId={activeClassSubjectId!}
          />
        ))}
      </div>
    </div>
  );
}
