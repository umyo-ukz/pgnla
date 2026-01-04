import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";

export default function StudentPerformanceCard() {
  const { user, role, logout, isLoading } = useAuth();

  // Staff must be logged in
  if (isLoading) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  // Fetch all students
  const students = useQuery(api.students.listAll);

  // Fetch component grades
  const componentGrades = useQuery(api.grades.listAll);

  // Fetch all subjects with their components
  const subjects = useQuery(api.subjects.listAll);
  const subjectComponents = useQuery(api.subjectComponents.listAll);

  // State for filters
  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");

  // Calculate overall grade for each student using component grades
  const getStudentPerformance = (studentId: string) => {
    if (!componentGrades || !subjects || !subjectComponents) {
      return { overall: 0, letterGrade: "N/A" };
    }


    // Add this debug function inside your component

    // Then call this for a specific student to see what's happening
    // You can add a button to trigger this or call it in useEffect
    // Get all component grades for this student
    // Replace the getStudentPerformance function with this version
    const getStudentPerformance = (studentId: string) => {
      if (!componentGrades || !subjects || !subjectComponents) {
        return { overall: 0, letterGrade: "N/A" };
      }

      // Get all component grades for this student
      const studentComponentGrades = componentGrades.filter(
        grade => grade.studentId === studentId
      );

      if (studentComponentGrades.length === 0) {
        console.log(`No component grades found for student ${studentId}`);
        return { overall: 0, letterGrade: "N/A" };
      }

      console.log(`Calculating for student ${studentId}:`);
      console.log(`- Component grades: ${studentComponentGrades.length}`);
      console.log(`- Subjects: ${subjects.length}`);
      console.log(`- Subject components: ${subjectComponents.length}`);

      let totalWeightedScore = 0;
      let totalSubjectWeight = 0;
      let subjectsWithGrades = 0;

      // Calculate weighted average for each subject
      subjects.forEach(subject => {
        // Get components for this subject
        const subjectComps = subjectComponents.filter(
          comp => comp.subjectId === subject._id
        );

        if (subjectComps.length > 0) {
          let subjectComponentScore = 0;
          let totalComponentWeight = 0;
          let componentsWithGrades = 0;

          // Calculate weighted score for each component
          subjectComps.forEach(component => {
            // Find component grade for this student
            const compGrade = studentComponentGrades.find(
              g => g.componentId === component._id && g.subjectId === subject._id
            );

            if (compGrade) {
              // Add weighted component score
              subjectComponentScore += compGrade.score * (component.weight / 100);
              totalComponentWeight += component.weight;
              componentsWithGrades++;
            }
          });

          // If we have grades for components in this subject
          if (componentsWithGrades > 0 && totalComponentWeight > 0) {
            // Calculate subject average (0-100)
            const subjectAverage = (subjectComponentScore / totalComponentWeight) * 100;

            console.log(`  Subject: ${subject.name}`);
            console.log(`  - Components with grades: ${componentsWithGrades}/${subjectComps.length}`);
            console.log(`  - Subject average: ${subjectAverage}`);
            console.log(`  - Subject weight: ${subject.weight}`);

            // Add weighted subject score to total
            totalWeightedScore += subjectAverage * (subject.weight / 100);
            totalSubjectWeight += subject.weight;
            subjectsWithGrades++;
          }
        }
      });

      console.log(`  Total subjects with grades: ${subjectsWithGrades}`);
      console.log(`  Total subject weight: ${totalSubjectWeight}`);
      console.log(`  Total weighted score: ${totalWeightedScore}`);

      // Calculate overall grade
      const overall = totalSubjectWeight > 0
        ? Math.round((totalWeightedScore / totalSubjectWeight) * 10000) / 100  // Rounded to 2 decimal places
        : 0;

      const letterGrade = getLetterGrade(overall);

      console.log(`  Final overall: ${overall}% (${letterGrade})`);

      return { overall, letterGrade };
    };

    const getLetterGrade = (score: number): string => {
      if (!score) return "N/A";
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

    // Filter students based on search and grade filter
    const filteredStudents = useMemo(() => {
      if (!students) return [];

      return students.filter(student => {
        const matchesName = student.fullName
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesGrade = gradeFilter === "" || student.gradeLevel === gradeFilter;
        return matchesName && matchesGrade;
      });
    }, [students, search, gradeFilter]);

    // Get unique grade levels for filter dropdown
    const uniqueGrades = useMemo(() => {
      if (!students) return [];
      return Array.from(new Set(students.map(s => s.gradeLevel))).sort();
    }, [students]);

    // Calculate overall stats
    const stats = useMemo(() => {
      if (!students || !componentGrades || !subjects || !subjectComponents) return null;

      let totalOverall = 0;
      let studentCount = 0;
      let highPerformers = 0;
      let needsImprovement = 0;
      let atRisk = 0;

      students.forEach(student => {
        const perf = getStudentPerformance(student._id);
        if (perf.overall > 0) {
          totalOverall += perf.overall;
          studentCount++;

          if (perf.overall >= 80) highPerformers++;
          else if (perf.overall >= 60) needsImprovement++;
          else atRisk++;
        }
      });

      return {
        averageGrade: studentCount > 0 ? Math.round(totalOverall / studentCount) : 0,
        highPerformers,
        needsImprovement,
        atRisk
      };
    }, [students, componentGrades, subjects, subjectComponents]);

    // Loading state
    if (students === undefined || componentGrades === undefined ||
      subjects === undefined || subjectComponents === undefined) {
      return (
        <div className="container-wide px-4 py-10">
          <h1 className="text-2xl font-bold mb-6">Student Performance</h1>
          <div className="text-center py-12">Loading student data...</div>
        </div>
      );
    }

    return (
      <div className="container-wide px-4 py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Performance Overview</h1>
            <p className="text-gray-600">
              View overall academic performance for all students (Component-Based Grading)
            </p>
          </div>

          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </header>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-700">Average Grade</div>
              <div className="text-2xl font-bold">{stats.averageGrade}%</div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-sm text-green-700">High Performers (A-B)</div>
              <div className="text-2xl font-bold">{stats.highPerformers}</div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="text-sm text-yellow-700">Needs Improvement (C-D)</div>
              <div className="text-2xl font-bold">{stats.needsImprovement}</div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="text-sm text-red-700">At Risk (F)</div>
              <div className="text-2xl font-bold">{stats.atRisk}</div>
            </div>
          </div>
        )}

        {/* Information about component grading */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
            <div>
              <h3 className="font-semibold text-yellow-800">Component-Based Grading</h3>
              <p className="text-sm text-yellow-700">
                Grades are calculated from individual component scores (tests, homework, projects)
                weighted by subject and component weights.
              </p>
            </div>
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
            <option value="">All Grades</option>
            {uniqueGrades.map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Student Performance Table */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Student Name</th>
                  <th className="text-left p-4 font-semibold">Grade Level</th>
                  <th className="text-left p-4 font-semibold">Overall Grade</th>
                  <th className="text-left p-4 font-semibold">Letter Grade</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No students match your filters
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const perf = getStudentPerformance(student._id);
                    const hasGrade = perf.overall > 0;
                    const color = getColor(perf.overall);


                    return (
                      <tr key={student._id} className="border-t hover:bg-gray-50">
                        <td className="p-4 font-medium">{student.fullName}</td>

                        <td className="p-4">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {student.gradeLevel}
                          </span>
                        </td>

                        <td className="p-4">
                          {hasGrade ? (
                            <div className={`text-xl font-bold ${color}`}>
                              {perf.overall}%
                            </div>
                          ) : (
                            <span className="text-gray-500">No grades</span>
                          )}
                        </td>

                        <td className="p-4">
                          {hasGrade ? (
                            <span className={`font-semibold ${color}`}>
                              {perf.letterGrade}
                            </span>
                          ) : (
                            "—"
                          )}

                        </td>



                        <td className="p-4 flex gap-2">
                          <a
                            href={`/staff/grade/${student._id}`}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                          >
                            Edit Grades
                          </a>
                          <a
                            href={`/staff/student/${student._id}`}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            Profile
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
            <span>Excellent (80%+)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span>Satisfactory (60-79%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span>Needs Attention (Below 60%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
            <span>Has Components (No Overall Yet)</span>
          </div>
        </div>
      </div>
    );
  }
}