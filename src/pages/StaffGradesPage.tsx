import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import StudentGradeCard from "../components/StudentGradeCard";
import TermSwitcher from "../components/TermSwitcher";

export default function StaffGradesPage() {
  const { user, role, logout } = useAuth();

  if (user === undefined) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const terms = useQuery(api.terms.listAll);
  const students = useQuery(api.staff.listAllStudents);

  const [activeTermId, setActiveTermId] = useState<Id<"terms"> | null>(null);
  const [activeClassSubjectId, setActiveClassSubjectId] = useState<Id<"classSubjects"> | null>(null);

  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const activeTerm = terms.find(t => t.isActive) ?? terms[0];
      setActiveTermId(activeTerm._id);
    }
  }, [terms, activeTermId]);

  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTermId
      ? { termId: activeTermId }
      : "skip"
  );

  // Auto-select first class subject when available
  useEffect(() => {
    if (!activeClassSubjectId && classSubjects && classSubjects.length > 0) {
      setActiveClassSubjectId(classSubjects[0]._id);
    }
  }, [classSubjects, activeClassSubjectId]);

  const updateSubjectWeight = useMutation(api.classSubjects.updateSubjectWeight);

  return (
    <div className="container-wide px-4 py-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Grades</h1>
        <div className="flex gap-4 items-center">
          <TermSwitcher
            terms={terms}
            activeTermId={activeTermId}
            onChange={(id) => setActiveTermId(id as Id<"terms">)}
          />
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {/* Subject Tabs */}
      {!activeTermId ? (
        <div className="text-gray-600">Please select a term</div>
      ) : classSubjects === undefined ? (
        <div className="text-gray-600">Loading subjects...</div>
      ) : classSubjects.length === 0 ? (
        <div className="text-gray-600 p-4 border rounded">
          No subjects found for this term. Please create class subjects for this term.
        </div>
      ) : (
        <div className="flex gap-4 border-b">
          {classSubjects.map(cs => (
            <button
              key={cs._id}
              onClick={() => setActiveClassSubjectId(cs._id)}
              className={`pb-2 ${
                activeClassSubjectId === cs._id
                  ? "border-b-2 border-primary-red font-semibold"
                  : "text-gray-500"
              }`}
            >
              {cs.subject?.name ?? "Unknown Subject"}
            </button>
          ))}
        </div>
      )}

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
      {!activeClassSubjectId ? (
        <div className="text-gray-600">Please select a subject above</div>
      ) : students === undefined ? (
        <div className="text-gray-600">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="text-gray-600 p-4 border rounded">
          No students found.
        </div>
      ) : (
        <div className="space-y-6">
          {students.map(student => (
            <StudentGradeCard
              key={student._id}
              student={student}
              classSubjectId={activeClassSubjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
