import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";

export default function StudentPerformancePage() {
  const { user, role, logout, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const students = useQuery(api.students.listAll);
  const componentGrades = useQuery(api.grades.listAll);
  const subjects = useQuery(api.subjects.listAll);
  const subjectComponents = useQuery(api.subjectComponents.listAll);

  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");

  const getLetterGrade = (score: number) => {
    if (score >= 96) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 86) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 76) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 66) return "D+";
    if (score >= 63) return "D";
    if (score >= 60) return "D-";
    return "F";
  };

  const getColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  /**
   * CORRECT, SAFE, COMPONENT-BASED CALCULATION
   */
  const getStudentPerformance = (studentId: string) => {
    if (!componentGrades || !subjects || !subjectComponents) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    const studentGrades = componentGrades.filter(
      g => g.studentId === studentId
    );

    if (studentGrades.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    let totalWeightedScore = 0;
    let totalSubjectWeight = 0;

    subjects.forEach(subject => {
      const comps = subjectComponents.filter(
        c => c.subjectId === subject._id
      );

      if (comps.length === 0) return;

      let subjectScore = 0;
      let componentWeightSum = 0;

      comps.forEach(comp => {
        const grade = studentGrades.find(
          g => g.componentId === comp._id
        );

        if (!grade) return;

        const compWeight = comp.weight ?? 0;
        subjectScore += grade.score * compWeight;
        componentWeightSum += compWeight;
      });

      if (componentWeightSum === 0) return;

      const subjectAverage = subjectScore / componentWeightSum;
      const subjectWeight = subject.weight ?? 0;

      totalWeightedScore += subjectAverage * subjectWeight;
      totalSubjectWeight += subjectWeight;
    });

    if (totalSubjectWeight === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: true };
    }

    const overall =
      Math.round((totalWeightedScore / totalSubjectWeight) * 100) / 100;

    return {
      overall,
      letterGrade: getLetterGrade(overall),
      hasGrades: true,
    };
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const nameMatch = s.fullName
        .toLowerCase()
        .includes(search.toLowerCase());
      const gradeMatch = gradeFilter === "" || s.gradeLevel === gradeFilter;
      return nameMatch && gradeMatch;
    });
  }, [students, search, gradeFilter]);

  const uniqueGrades = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map(s => s.gradeLevel))).sort();
  }, [students]);

  if (
    students === undefined ||
    componentGrades === undefined ||
    subjects === undefined ||
    subjectComponents === undefined
  ) {
    return <div className="p-10 text-center">Loading student data…</div>;
  }

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Performance</h1>
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </header>

      <div className="bg-white border rounded-xl p-4 flex gap-4">
        <input
          className="input flex-1"
          placeholder="Search by student name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="input md:w-48"
          value={gradeFilter}
          onChange={e => setGradeFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {uniqueGrades.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-red">
            <tr className ="text-white">
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Percentage</th>
              <th className="p-4 text-left">Grade</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Absences</th>
              <th className="p-4 text-left">Tardies</th>
              <th className="p-4 text-left">Conduct</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const perf = getStudentPerformance(student._id);
              const color = getColor(perf.overall);

              return (
                <tr key={student._id} className="border-t">
                  <td className="p-4 font-medium">{student.fullName}</td>
                  <td className="p-4">{student.gradeLevel}</td>
                  <td className={`p-4 font-bold ${color}`}>
                    {perf.hasGrades ? `${perf.overall}%` : "No grades"}
                  </td>
                  <td className={`p-4 font-semibold ${color}`}>
                    {perf.letterGrade}
                  </td>
                  <td className="p-4">
                    {perf.overall >= 80
                      ? "Excellent"
                      : perf.overall >= 60
                      ? "Satisfactory"
                      : perf.hasGrades
                      ? "Needs Attention"
                      : "No Data"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
