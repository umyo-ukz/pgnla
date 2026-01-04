import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo, useEffect } from "react";
import StudentGradeCard from "../components/StudentGradeCard";

export default function StaffGradesPage() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const subjects = useQuery(api.subjects.listActiveSubjects);
  const students = useQuery(api.staff.listAllStudents);

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");

  /* Auto-select first subject once subjects load */
  useEffect(() => {
    if (!activeSubjectId && subjects && subjects.length > 0) {
      setActiveSubjectId(subjects[0]._id);
    }
  }, [subjects, activeSubjectId]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((s) => {
      const matchesName = s.fullName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === "" || s.gradeLevel === gradeFilter;

      return matchesName && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const uniqueGrades = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map((s) => s.gradeLevel)));
  }, [students]);

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Portal</h1>
          <p className="text-gray-600">
            Manage student grades by subject
          </p>
        </div>

        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

      {/* Subject Tabs */}
      <div className="shadow-md p-4 bg-gradient-to-t from-gray-100 to-primary-light rounded-xl">
        <h3 className="font-serif font-semibold text-xl p-2">
          Subjects
        </h3>

        <div className="flex gap-4 border-b overflow-x-auto">
          {subjects?.map((subject) => (
            <button
              key={subject._id}
              onClick={() => setActiveSubjectId(subject._id)}
              className={`pb-2 px-3 font-medium rounded-t-lg ${
                activeSubjectId === subject._id
                  ? "bg-primary-red text-white font-semibold"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by student name…"
          className="input flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bg-primary-red rounded-md text-white input md:w-48 p-2"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {uniqueGrades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {/* Students */}
      {students === undefined || subjects === undefined ? (
        <div>Loading data…</div>
      ) : !activeSubjectId ? (
        <div className="text-gray-600">
          Select a subject to begin grading.
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-gray-600">
          No students match your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map((student) => (
            <StudentGradeCard
              key={student._id}
              student={student}
              subjectId={activeSubjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
