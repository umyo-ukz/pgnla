import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo, useEffect } from "react";
import TermSwitcher from "../components/TermSwitcher";
import { useTranslation } from "../hooks/useTranslation";
import { Id } from "../../convex/_generated/dataModel";

export default function StudentPerformancePage() {
  const { user, role, logout  } = useAuth();



  if (!user || role !== "staff") return <Navigate to="/login" />;

  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [activeTermId, setActiveTermId] = useState<Id<"terms"> | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "grade" | "score">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const students = useQuery(api.students.listAll);
  const terms = useQuery(api.terms.listAll);
  
  // FIXED: Use listByClassAndTerm with proper parameters
  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTermId ? { termId: activeTermId } : "skip"
  );
  
  const components = useQuery(api.subjectComponents.listAll);
  const componentGrades = useQuery(api.grades.listAll);

  // Initialize active term
  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const activeTerm = terms.find(t => t.isActive) ?? terms[0];
      setActiveTermId(activeTerm._id);
    }
  }, [terms, activeTermId]);

  const getLetterGrade = (score: number): string => {
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

  const getStatusColor = (score: number, hasGrades: boolean) => {
    if (!hasGrades) return "bg-gray-100 text-gray-700";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-yellow-700";
    return "text-red-700";
  };

  /**
   * FIXED: Simplified calculation - classSubjects already filtered by term
   */
  const getStudentPerformance = (studentId: string) => {
    // Show loading if data isn't ready
    if (!componentGrades || !components || classSubjects === undefined || !activeTermId) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false, subjectsCount: 0 };
    }

    // If no class subjects for this term
    if (!classSubjects || classSubjects.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false, subjectsCount: 0 };
    }

    // Get all component grades for this student
    const studentGrades = componentGrades.filter(
      g => g.studentId === studentId
    );

    if (studentGrades.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false, subjectsCount: 0 };
    }

    let totalWeightedScore = 0;
    let totalSubjectWeight = 0;
    let gradedSubjects = 0;

    // Calculate for each class subject (already filtered by term)
    classSubjects.forEach(classSubject => {
      // Get components for this class subject
      const subjectComps = components.filter(
        comp => comp.classSubjectId === classSubject._id
      );

      if (subjectComps.length === 0) {
        return; // Skip subjects with no components
      }

      let subjectScore = 0;
      let componentWeightSum = 0;
      let hasComponentGrades = false;
      let componentsWithGrades = 0;

      // Calculate weighted average for components in this subject
      subjectComps.forEach(comp => {
        const grade = studentGrades.find(
          g => g.componentId === comp._id
        );

        if (grade) {
          const compWeight = comp.weight ?? 0;
          subjectScore += grade.score * compWeight;
          componentWeightSum += compWeight;
          hasComponentGrades = true;
          componentsWithGrades++;
        }
      });

      // Only include subjects with actual grades
      if (hasComponentGrades && componentWeightSum > 0) {
        const subjectAverage = subjectScore / componentWeightSum;
        const subjectWeight = classSubject.weight ?? 100; // Default to 100 if not set
        
        totalWeightedScore += subjectAverage * subjectWeight;
        totalSubjectWeight += subjectWeight;
        gradedSubjects++;
      }
    });

    if (totalSubjectWeight === 0 || gradedSubjects === 0) {
      return { 
        overall: 0, 
        letterGrade: "N/A", 
        hasGrades: false, 
        subjectsCount: gradedSubjects 
      };
    }

    // Calculate final weighted average (0-100 scale)
    const overall = Math.round((totalWeightedScore / totalSubjectWeight) * 100) / 100;

    return {
      overall,
      letterGrade: getLetterGrade(overall),
      hasGrades: true,
      subjectsCount: gradedSubjects
    };
  };

  // Get unique grade levels
  const uniqueGrades = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map(s => s.gradeLevel))).sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    let filtered = students.filter(s => {
      const nameMatch = s.fullName.toLowerCase().includes(search.toLowerCase());
      const gradeMatch = gradeFilter === "" || s.gradeLevel === gradeFilter;
      return nameMatch && gradeMatch;
    });

    // Calculate performance for sorting
    const studentsWithPerformance = filtered.map(student => ({
      ...student,
      performance: getStudentPerformance(student._id)
    }));

    // Apply sorting
    return studentsWithPerformance.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "grade":
          comparison = a.gradeLevel.localeCompare(b.gradeLevel);
          if (comparison === 0) {
            comparison = a.fullName.localeCompare(b.fullName);
          }
          break;
        case "score":
          // Sort students with grades first, then by score
          if (!a.performance.hasGrades && b.performance.hasGrades) return 1;
          if (a.performance.hasGrades && !b.performance.hasGrades) return -1;
          comparison = a.performance.overall - b.performance.overall;
          if (comparison === 0) {
            comparison = a.fullName.localeCompare(b.fullName);
          }
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [students, search, gradeFilter, sortBy, sortOrder, activeTermId, classSubjects, components, componentGrades]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (!filteredStudents.length) return null;
    
    const studentsWithGrades = filteredStudents.filter(s => s.performance.hasGrades);
    const totalScore = studentsWithGrades.reduce((sum, s) => sum + s.performance.overall, 0);
    const avgScore = studentsWithGrades.length > 0 
      ? Math.round((totalScore / studentsWithGrades.length) * 100) / 100
      : 0;
    
    const gradeDistribution = {
      a: studentsWithGrades.filter(s => s.performance.overall >= 80).length,
      b: studentsWithGrades.filter(s => s.performance.overall >= 60 && s.performance.overall < 80).length,
      c: studentsWithGrades.filter(s => s.performance.overall < 60 && s.performance.hasGrades).length,
      none: filteredStudents.filter(s => !s.performance.hasGrades).length
    };
    
    return { 
      avgScore, 
      gradeDistribution, 
      totalStudents: filteredStudents.length,
      withGrades: studentsWithGrades.length,
      withoutGrades: filteredStudents.filter(s => !s.performance.hasGrades).length
    };
  }, [filteredStudents]);

  // Loading state - show spinner while any data is loading
  const isLoadingData = 
    students === undefined || 
    terms === undefined || 
    classSubjects === undefined || 
    components === undefined || 
    componentGrades === undefined;

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student performance data...</p>
          <p className="text-sm text-gray-400 mt-2">
            {activeTermId ? "Calculating grades for selected term" : "Please select a term"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-wide px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Student Performance Overview
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Track academic performance for {activeTermId ? 
                <span className="font-medium text-primary-red">
                  {terms?.find(t => t._id === activeTermId)?.name || "selected term"}
                </span> : 
                "selected term"
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {terms && terms.length > 0 && (
              <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
                <i className="fas fa-calendar-alt text-gray-500"></i>
                <TermSwitcher
                  terms={terms}
                  activeTermId={activeTermId}
                  onChange={setActiveTermId}
                  className="border-0 p-0 text-sm font-medium"
                />
              </div>
            )}
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards with Term Context */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Average Score</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.avgScore}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.withGrades} of {stats.totalStudents} graded
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">High Performers (A)</div>
              <div className="text-2xl font-bold text-green-600">{stats.gradeDistribution.a}</div>
              <div className="text-xs text-gray-400 mt-1">
                80% or higher
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Satisfactory (B)</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.gradeDistribution.b}</div>
              <div className="text-xs text-gray-400 mt-1">
                60-79%
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Needs Attention (C-F)</div>
              <div className="text-2xl font-bold text-red-600">{stats.gradeDistribution.c}</div>
              <div className="text-xs text-gray-400 mt-1">
                Below 60%
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Ungraded</div>
              <div className="text-2xl font-bold text-gray-600">{stats.withoutGrades}</div>
              <div className="text-xs text-gray-400 mt-1">
                No grades yet
              </div>
            </div>
          </div>
        )}

      
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search student names..."
                      className="input pl-10 w-full border-gray-300 focus:border-primary-red focus:ring-2 focus:ring-primary-red/20"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Grade Filter */}
                  <select
                    className="input bg-white border-gray-300 focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 md:w-48"
                    value={gradeFilter}
                    onChange={e => setGradeFilter(e.target.value)}
                  >
                    <option value="">All Class Levels</option>
                    {uniqueGrades.map(g => (
                      <option key={g} value={g}>
                         {g}
                      </option>
                    ))}
                  </select>

                  {/* Sort Options */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (sortBy === "name") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("name");
                          setSortOrder("asc");
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                        sortBy === "name"
                          ? "bg-primary-red/10 border-primary-red text-primary-red"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <i className={`fas fa-sort-alpha-${sortBy === "name" && sortOrder === "desc" ? "down-alt" : "down"}`}></i>
                      <span className="text-sm">Name</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (sortBy === "score") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("score");
                          setSortOrder("desc");
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                        sortBy === "score"
                          ? "bg-blue-600/10 border-blue-600 text-blue-600"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <i className={`fas fa-sort-numeric-${sortBy === "score" && sortOrder === "desc" ? "down" : "up"}`}></i>
                      <span className="text-sm">Score</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <i className="fas fa-users mr-2"></i>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {activeTermId && classSubjects && (
                  <span className="ml-2 text-xs">• {classSubjects.length} subject{classSubjects.length !== 1 ? 's' : ''} this term</span>
                )}
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-red to-red-600">
                <tr>
                  <th className="p-4 text-left text-white font-semibold text-sm">Student</th>
                  <th className="p-4 text-left text-white font-semibold text-sm">Class</th>
                  <th className="p-4 text-left text-white font-semibold text-sm">Overall Score</th>
                  <th className="p-4 text-left text-white font-semibold text-sm">Grade</th>
                  <th className="p-4 text-left text-white font-semibold text-sm">Status</th>
                  <th className="p-4 text-left text-white font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <div className="py-8">
                        <i className="fas fa-user-graduate text-4xl text-gray-300 mb-4"></i>
                        <p className="text-gray-600">No students found matching your criteria</p>
                        {(search || gradeFilter) && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setGradeFilter("");
                            }}
                            className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const perf = student.performance;
                    const scoreColor = perf.hasGrades ? getScoreColor(perf.overall) : "text-gray-400";
                    
                    return (
                      <tr 
                        key={student._id} 
                        className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-red/10 rounded-full flex items-center justify-center text-primary-red font-semibold">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <Link
                                to={`/staff/performance/${student._id}`}
                                className="font-medium text-gray-800 hover:text-primary-red hover:underline"
                              >
                                {student.fullName}
                              </Link>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                            {student.gradeLevel}
                          </span>
                        </td>
                        
                        <td className="p-4">
                          <div className={`text-lg font-bold ${scoreColor}`}>
                            {perf.hasGrades ? (
                              <>
                                {perf.overall}%
                                <div className="text-xs text-gray-400 mt-1">
                                  {perf.subjectsCount} of {classSubjects?.length || 0} subject{perf.subjectsCount !== 1 ? 's' : ''}
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-400">—</span>
                                <div className="text-xs text-gray-400 mt-1">
                                  No grades this term
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className={`font-bold ${scoreColor}`}>
                            {perf.letterGrade}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(perf.overall, perf.hasGrades)}`}>
                            {perf.hasGrades ? (
                              perf.overall >= 80 ? "Excellent" :
                              perf.overall >= 60 ? "Satisfactory" : "Needs Attention"
                            ) : "No Grades"}
                          </span>
                        </td>
                  
                        
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/staff/performance/${student._id}`}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit Grades
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-gray-500">
              <div>
                Showing {filteredStudents.length} of {students?.length || 0} students
                {activeTermId && terms && (
                  <span className="ml-2">
                    • Term: <span className="font-medium">{terms.find(t => t._id === activeTermId)?.name || "Unknown"}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Excellent (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Satisfactory (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span>Needs Attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}