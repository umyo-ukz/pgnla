import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo, useEffect } from "react";
import StudentGradeCard from "../components/StudentGradeCard";
import { Id } from "../../convex/_generated/dataModel";


export default function StaffGradesPage() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const subjects = useQuery(api.subjects.listActiveSubjects);
  const students = useQuery(api.staff.listAllStudents);


  const updateSubjectWeight = useMutation(
    api.subjects.updateSubjectWeight
  );

  const [activeSubjectId, setActiveSubjectId] = useState<Id<"subjects"> | null>(null);

  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentWeight, setCurrentWeight] = useState<number>(0);

  /* Auto-select first subject */
  useEffect(() => {
    if (activeSubjectId && subjects) {
      const subject = subjects.find(s => s._id === activeSubjectId);
      setCurrentWeight(subject?.weight || 0);
    }
  }, [activeSubjectId, subjects]);


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

  const totalSubjectWeight = useMemo(() => {
    if (!subjects) return 0;
    return subjects.reduce((sum, s) => sum + s.weight, 0);
  }, [subjects]);

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Grades</h1>
          <p className="text-gray-600">
            Adjust subject weights and edit student grades
          </p>
        </div>

        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

      {/* Subject Tabs */}
      <div className="border shadow-md p-4 bg-gradient-to-t from-gray-100 to-primary-light rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-semibold text-xl">Subjects</h3>

          <span
            className={`text-sm font-medium ${totalSubjectWeight === 100
                ? "text-green-600"
                : "text-red-600"
              }`}
          >
            Total Subject Weight: {totalSubjectWeight}%
          </span>
        </div>

        <div className="flex gap-4 border-b overflow-x-auto">
          {subjects?.map((subject) => (
            <button
              key={subject._id}
              onClick={() => setActiveSubjectId(subject._id)}
              className={`pb-2 px-3 font-medium rounded-t-lg ${activeSubjectId === subject._id
                  ? "bg-primary-red text-white font-semibold"
                  : "text-gray-600 hover:text-black"
                }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        {/* Active Subject Weight Editor */}
        {activeSubjectId && subjects && (
          <div className="flex items-center gap-4 bg-white rounded-lg p-4 border max-w-md">
            <span className="font-medium">
              {
                subjects.find((s) => s._id === activeSubjectId)?.name
              }
            </span>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Weight</span>
              <input
                type="number"
                min={0}
                max={100}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isFinite(value)) return;
                  updateSubjectWeight({
                    subjectId: activeSubjectId,
                    weight: value,
                  });
                }}
                className="w-20 input text-center"
              />

              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
        )}

        {totalSubjectWeight !== 100 && (
          <p className="text-sm text-red-600">
            Subject weights should add up to 100%
          </p>
        )}
      </div>

      {/* Filters */}

      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="flex items-center pt-1">
          <h3 className="font-serif font-semibold text-xl mb-2">Filters</h3>
        </div>
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
