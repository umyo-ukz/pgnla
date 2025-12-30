import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import StudentGradeCard from "../components/StudentGradeCard";
import { useState, useMemo } from "react";

export default function StaffDashboard() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const students = useQuery(api.staff.listAllStudents);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((s) => {
      const matchesName =
        s.fullName.toLowerCase().includes(search.toLowerCase());

      const matchesGrade =
        gradeFilter === "" || s.gradeLevel === gradeFilter;

      return matchesName && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const uniqueGrades = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map(s => s.gradeLevel)));
  }, [students]);

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Portal</h1>
          <p className="text-gray-600">
            Search students and manage grades
          </p>
        </div>

        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

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
          className="input md:w-48"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="">All Grades</option>
          {uniqueGrades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {students === undefined ? (
        <div>Loading students…</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-gray-600">
          No students match your search.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map((s) => (
            <StudentGradeCard key={s._id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}
