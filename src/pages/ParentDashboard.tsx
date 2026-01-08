import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function ParentDashboard() {
  const { user, role, isLoading, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user || role !== "parent") {
    return <Navigate to="/login" />;
  }

  // Check authentication first
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-red mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch data
  const students = useQuery(api.students.listForParent, {
    parentId: user._id,
  });

  const components = useQuery(api.subjectComponents.listAll);
  const terms = useQuery(api.terms.listAll);
  const activeTerm = terms?.find((t) => t.isActive);
  const allComponentGrades = useQuery(api.grades.listAll);

  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTerm ? { termId: activeTerm._id } : "skip",
  );

  // Fetch notices for parent
  const parentNotices = useQuery(api.parentNotices.getForParent, {
    parentId: user._id,
  });

  // Fetch all published notices
  const publishedNotices = useQuery(api.notices.getPublished);

  // Process notices data
  const { generalNotices, academicNotices, unreadCounts } = useMemo(() => {
    if (!parentNotices || !publishedNotices) {
      return {
        generalNotices: [],
        academicNotices: [],
        unreadCounts: { general: 0, academic: 0, total: 0 }
      };
    }

    // Create a map of notice IDs to read status
    const readStatusMap = new Map<Id<"notices">, boolean>();
    parentNotices.forEach(pn => {
      readStatusMap.set(pn.noticeId, pn.hasRead);
    });

    // Get parent's student grade levels
    const studentGradeLevels = students?.map(s => s.gradeLevel) || [];

    // Filter notices: published AND (general notice OR matches student grade level)
    const relevantNotices = publishedNotices.filter(notice => {
      // Check if notice is for "general" or matches student grade level
      const isGeneralNotice = notice.noticeType === "general" || notice.noticeType === "urgent";
      const matchesGradeLevel = studentGradeLevels.includes(notice.gradeLevel);
      
      return notice.isPublished && (isGeneralNotice || matchesGradeLevel);
    });

    // Categorize notices and add read status
    const generalNotices = relevantNotices
      .filter(notice => notice.noticeType === "general" || notice.noticeType === "urgent")
      .map(notice => ({
        ...notice,
        hasRead: readStatusMap.get(notice._id) || false
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    const academicNotices = relevantNotices
      .filter(notice => notice.noticeType === "academic")
      .map(notice => ({
        ...notice,
        hasRead: readStatusMap.get(notice._id) || false
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    // Count unread notices
    const unreadGeneral = generalNotices.filter(notice => !notice.hasRead).length;
    const unreadAcademic = academicNotices.filter(notice => !notice.hasRead).length;

    return {
      generalNotices,
      academicNotices,
      unreadCounts: {
        general: unreadGeneral,
        academic: unreadAcademic,
        total: unreadGeneral + unreadAcademic
      }
    };
  }, [parentNotices, publishedNotices, students]);

  // Calculate overall grade for a student
  const calculateStudentGrade = (studentId: string) => {
    if (!allComponentGrades || !classSubjects || !components || !activeTerm) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    const termClassSubjects = classSubjects.filter(
      (cs) => cs.termId === activeTerm._id,
    );
    const studentGrades = allComponentGrades.filter(
      (g) => g.studentId === studentId,
    );

    if (studentGrades.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    const subjectPercentages: number[] = [];

    termClassSubjects.forEach((classSubject) => {
      const subjectComps = components.filter(
        (comp) => comp.classSubjectId === classSubject._id,
      );

      let totalEarned = 0;
      let totalPossible = 0;
      let hasGrades = false;

      subjectComps.forEach((comp) => {
        const grade = studentGrades.find((g) => g.componentId === comp._id);
        const compWeight = comp.weight || 0;

        if (grade) {
          const earned = Math.min(grade.score, compWeight);
          totalEarned += earned;
          totalPossible += compWeight;
          hasGrades = true;
        } else {
          totalPossible += compWeight;
        }
      });

      if (hasGrades && totalPossible > 0) {
        const subjectPercentage = (totalEarned / totalPossible) * 100;
        subjectPercentages.push(subjectPercentage);
      }
    });

    if (subjectPercentages.length === 0) {
      return { overall: 0, letterGrade: "N/A", hasGrades: false };
    }

    const overall =
      subjectPercentages.reduce((sum, p) => sum + p, 0) /
      subjectPercentages.length;

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
      overall: Math.round(overall * 100) / 100,
      letterGrade: getLetterGrade(overall),
      hasGrades: true,
    };
  };

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    if (!students) return null;

    const studentsWithGrades = students.map((s) => {
      const grade = calculateStudentGrade(s._id);
      return { ...s, grade };
    });

    const studentsWithValidGrades = studentsWithGrades.filter(
      (s) => s.grade.hasGrades,
    );

    const totalScore = studentsWithValidGrades.reduce(
      (sum, s) => sum + s.grade.overall,
      0,
    );
    const avgScore =
      studentsWithValidGrades.length > 0
        ? Math.round(totalScore / studentsWithValidGrades.length)
        : 0;

    const gradeDistribution = {
      excellent: studentsWithValidGrades.filter((s) => s.grade.overall >= 80)
        .length,
      satisfactory: studentsWithValidGrades.filter(
        (s) => s.grade.overall >= 60 && s.grade.overall < 80,
      ).length,
      needsAttention: studentsWithValidGrades.filter(
        (s) => s.grade.overall < 60 && s.grade.hasGrades,
      ).length,
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
                Welcome back,{" "}
                <span className="font-semibold text-primary-red">
                  {user.fullName}
                </span>
              </span>
              {activeTerm && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  {activeTerm.name}
                </span>
              )}
            </div>
          </div>

          <Link
            to="/login"
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Registered Students
            </h3>
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Average Grade
            </h3>
            <p className="text-xs text-gray-400">
              Combined academic performance
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <i className="fas fa-bell text-2xl text-blue-600"></i>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {unreadCounts.total || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Notifications
            </h3>
            <p className="text-xs text-gray-400">New alerts and updates</p>
          </div>
        </div>

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
                    <h2 className="text-xl font-bold text-gray-900">
                      Your Students
                    </h2>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {students?.length || 0} child
                    {students?.length !== 1 ? "ren" : ""}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {students === undefined ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      Loading student information...
                    </p>
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
                    {dashboardStats?.studentsWithGrades?.map((student) => (
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
                            <div
                              className={`text-2xl font-bold ${getGradeColor(student.grade.overall)}`}
                            >
                              {student.grade.hasGrades
                                ? `${student.grade.overall}%`
                                : "—"}
                            </div>
                            <div
                              className={`text-sm font-medium mt-1 ${getGradeColor(student.grade.overall)}`}
                            >
                              {student.grade.letterGrade}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${getGradeBadgeColor(student.grade.overall, student.grade.hasGrades)}`}
                          >
                            {student.grade.hasGrades
                              ? student.grade.overall >= 80
                                ? "Excellent Performance"
                                : student.grade.overall >= 60
                                  ? "Satisfactory Performance"
                                  : "Needs Attention"
                              : "No Grades Yet"}
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

          {/* Sidebar - Notices */}
          <div className="space-y-6">
            {/* General Notices */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <i className="fas fa-bullhorn text-blue-600 text-xl"></i>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      General Notices
                    </h2>
                  </div>
                  {unreadCounts.general > 0 && (
                    <span className="bg-primary-red text-white text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCounts.general} new
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {parentNotices === undefined ? (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin text-primary-red mr-2"></i>
                    <span className="text-gray-600">Loading notices...</span>
                  </div>
                ) : generalNotices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <i className="fas fa-newspaper text-3xl text-gray-300 mb-3"></i>
                    <p>No general notices</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generalNotices.slice(0, 3).map((notice) => (
                      <div
                        key={notice._id}
                        className={`border rounded-lg p-4 ${notice.hasRead ? "border-gray-200" : "border-primary-red/30 bg-primary-red/5"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {notice.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              From: {notice.createdBy} •{" "}
                              {new Date(notice.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notice.hasRead && (
                            <span className="bg-primary-red text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {notice.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Academic Notices */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <i className="fas fa-graduation-cap text-green-600 text-xl"></i>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Academic Notices
                    </h2>
                  </div>
                  {unreadCounts.academic > 0 && (
                    <span className="bg-primary-red text-white text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCounts.academic} new
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {parentNotices === undefined ? (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin text-primary-red mr-2"></i>
                    <span className="text-gray-600">Loading notices...</span>
                  </div>
                ) : academicNotices.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <i className="fas fa-book text-3xl text-gray-300 mb-3"></i>
                    <p>No academic notices</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {academicNotices.slice(0, 3).map((notice) => (
                      <div
                        key={notice._id}
                        className={`border rounded-lg p-4 ${notice.hasRead ? "border-gray-200" : "border-green-300 bg-green-50"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {notice.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              From: {notice.createdBy} •{" "}
                              {new Date(notice.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notice.hasRead && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {notice.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}