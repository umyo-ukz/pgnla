import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";

export default function ParentDashboard() {
  const { user, role, logout, isLoading } = useAuth();

  // Still loading auth state
  if (isLoading) return null;

  // Not logged in or wrong role
  if (!user || role !== "parent") {
    return <Navigate to="/login" />;
  }

  const students = useQuery(api.students.listForParent, {
    parentId: user._id,
  });

  const components = useQuery(api.subjectComponents.listAll);
  const terms = useQuery(api.terms.listAll);
  const activeTerm = terms?.find(t => t.isActive);

  const allComponentGrades = useQuery(api.grades.listAll);
  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTerm
      ? { termId: activeTerm._id }
      : "skip"
  );



  // Calculate overall grade for a student
  const calculateStudentGrade = (studentId: string) => {
    if (!allComponentGrades || !classSubjects || !components || !activeTerm) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    // Filter class subjects for active term
    const termClassSubjects = classSubjects.filter(cs => cs.termId === activeTerm._id);

    const studentGrades = allComponentGrades.filter(g => g.studentId === studentId);

    if (studentGrades.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    termClassSubjects.forEach(classSubject => {
      const subjectComps = components.filter(comp => comp.classSubjectId === classSubject._id);

      if (subjectComps.length === 0) return;

      let subjectScore = 0;
      let componentWeightSum = 0;
      let hasComponentGrades = false;

      subjectComps.forEach(comp => {
        const grade = studentGrades.find(g => g.componentId === comp._id);

        if (grade) {
          const compWeight = comp.weight ?? 0;
          subjectScore += grade.score * compWeight;
          componentWeightSum += compWeight;
          hasComponentGrades = true;
        }
      });

      if (hasComponentGrades && componentWeightSum > 0) {
        const subjectAverage = subjectScore / componentWeightSum;
        const subjectWeight = classSubject.weight ?? 100;

        totalWeightedScore += subjectAverage * subjectWeight;
        totalWeight += subjectWeight;
      }
    });

    if (totalWeight === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    const overall = Math.round((totalWeightedScore / totalWeight) * 100) / 100;

    // Calculate letter grade
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

    return {
      overall,
      letterGrade: getLetterGrade(overall),
      hasGrades: true
    };
  };

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    if (!students) return null;

    const studentsWithGrades = students.map(s => {
      const grade = calculateStudentGrade(s._id);
      return { ...s, grade };
    });

    const studentsWithValidGrades = studentsWithGrades.filter(s => s.grade.hasGrades);

    const totalScore = studentsWithValidGrades.reduce((sum, s) => sum + s.grade.overall, 0);
    const avgScore = studentsWithValidGrades.length > 0
      ? Math.round(totalScore / studentsWithValidGrades.length)
      : 0;

    const gradeDistribution = {
      excellent: studentsWithValidGrades.filter(s => s.grade.overall >= 80).length,
      satisfactory: studentsWithValidGrades.filter(s => s.grade.overall >= 60 && s.grade.overall < 80).length,
      needsAttention: studentsWithValidGrades.filter(s => s.grade.overall < 60 && s.grade.hasGrades).length,
    };

    return {
      studentCount: students.length,
      avgScore,
      gradeDistribution,
      studentsWithGrades: studentsWithGrades,
    };
  }, [students, allComponentGrades, classSubjects, components, activeTerm]);

  // Get grade color
  const getGradeColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (score: number, hasGrades: boolean) => {
    if (!hasGrades) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Parent Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">
                Welcome back, <span className="font-semibold text-primary-red">{user.fullName}</span>
              </span>
              {activeTerm && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  {activeTerm.name}
                </span>
              )}
            </div>
          </div>

          <Link to="/login"
            onClick={logout}
            className="mt-4 md:mt-0 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-red/10 rounded-xl">
                <i className="fas fa-users text-2xl text-primary-red"></i>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dashboardStats?.studentCount || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Registered Students</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <i className="fas fa-chart-line text-2xl text-green-600"></i>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dashboardStats?.avgScore || 0}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Grade</h3>
            <p className="text-xs text-gray-400">
              Combined academic performance
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <i className="fas fa-bell text-2xl text-blue-600"></i>
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Notifications</h3>
            <p className="text-xs text-gray-400">
              New alerts and updates
            </p>
          </div>

        </div>

        {/* Grade Distribution Summary */}
        {dashboardStats && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-red/10 rounded-lg">
                <i className="fas fa-graduation-cap text-xl text-primary-red"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Academic Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {dashboardStats.gradeDistribution.excellent}
                </div>
                <div className="text-sm font-medium text-green-800">Excellent (A-B)</div>
                <div className="text-xs text-green-600 mt-1">80% or higher</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <div className="text-2xl font-bold text-yellow-700 mb-1">
                  {dashboardStats.gradeDistribution.satisfactory}
                </div>
                <div className="text-sm font-medium text-yellow-800">Satisfactory (C-D)</div>
                <div className="text-xs text-yellow-600 mt-1">60-79%</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="text-2xl font-bold text-red-700 mb-1">
                  {dashboardStats.gradeDistribution.needsAttention}
                </div>
                <div className="text-sm font-medium text-red-800">Needs Attention (F)</div>
                <div className="text-xs text-red-600 mt-1">Below 60%</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-red/10 rounded-lg">
                      <i className="fas fa-user text-xl text-primary-red"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Your Students</h2>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {students?.length || 0} child{students?.length !== 1 ? 'ren' : ''}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {students === undefined ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading student information...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">
                      <i className="fas fa-user mx-auto"></i>
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      No Students Registered
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      No Students have been added to your account yet.
                    </p>
                    <Link
                      to="/registration"
                      className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Register a Student
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardStats?.studentsWithGrades?.map(student => (
                      <div
                        key={student._id}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-primary-red/30"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 rounded-xl bg-primary-red/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary-red">
                                  {student.fullName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {student.fullName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                     {student.gradeLevel}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    Student ID: {student._id.slice(0, 6)}...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Grade Display */}
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(student.grade.overall)}`}>
                              {student.grade.hasGrades ? `${student.grade.overall}%` : "—"}
                            </div>
                            <div className={`text-sm font-medium mt-1 ${getGradeColor(student.grade.overall)}`}>
                              {student.grade.letterGrade}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getGradeBadgeColor(student.grade.overall, student.grade.hasGrades)}`}>
                            {student.grade.hasGrades ? (
                              student.grade.overall >= 80 ? "Excellent Performance" :
                                student.grade.overall >= 60 ? "Satisfactory Performance" :
                                  "Needs Attention"
                            ) : "No Grades Yet"}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <Link
                            to={`/parent/student/${student._id}`}
                            className="px-3 py-2 text-center bg-primary-red text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            <i className="fas fa-chart-line mr-1"></i>
                            Grades
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="fas fa-bell text-xl text-blue-600"></i>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900"> General Notices</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-gray-600">
                    <h1>Coming Soon</h1>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="fas fa-bell text-xl text-blue-600"></i>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900"> Academic Notices</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-gray-600">
                    <h1>Coming Soon</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}