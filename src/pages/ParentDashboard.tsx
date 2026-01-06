import { useAuth } from "../hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaUser, FaGraduationCap, FaChartLine, FaCalendarAlt, FaBell, FaFileAlt, FaSignOutAlt, FaUsers, FaBookOpen, FaCalendarCheck } from "react-icons/fa";
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

  const allComponentGrades = useQuery(api.grades.listAll);
  const classSubjects = useQuery(api.classSubjects.listAll);
  const components = useQuery(api.subjectComponents.listAll);
  const terms = useQuery(api.terms.listAll);
  const activeTerm = terms?.find(t => t.isActive);

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
                  <FaCalendarAlt className="inline mr-1" size={12} />
                  {activeTerm.name}
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="mt-4 md:mt-0 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-red/10 rounded-xl">
                <FaUsers className="text-2xl text-primary-red" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dashboardStats?.studentCount || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Registered Children</h3>
            <p className="text-xs text-gray-400">
              Total children under your care
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaChartLine className="text-2xl text-green-600" />
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
                <FaBell className="text-2xl text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Notifications</h3>
            <p className="text-xs text-gray-400">
              New alerts and updates
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaFileAlt className="text-2xl text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {dashboardStats?.studentCount || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Reports Available</h3>
            <p className="text-xs text-gray-400">
              Latest term reports
            </p>
          </div>
        </div>

        {/* Grade Distribution Summary */}
        {dashboardStats && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-red/10 rounded-lg">
                <FaGraduationCap className="text-xl text-primary-red" />
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
                      <FaUser className="text-xl text-primary-red" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Your Children</h2>
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
                    <p className="text-gray-600">Loading children information...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">
                      <FaUser className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      No Children Registered
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      No children have been added to your account yet.
                    </p>
                    <Link
                      to="/registration"
                      className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Register a Child
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
                                    Grade {student.gradeLevel}
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
                            to={`/student/${student._id}/grades`}
                            className="px-3 py-2 text-center bg-primary-red text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                          >
                            <FaChartLine className="inline mr-1" size={12} />
                            Grades
                          </Link>
                          <Link
                            to={`/student/${student._id}/attendance`}
                            className="px-3 py-2 text-center bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                          >
                            <FaCalendarCheck className="inline mr-1" size={12} />
                            Attendance
                          </Link>
                          <Link
                            to={`/student/${student._id}/reports`}
                            className="px-3 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                          >
                            <FaFileAlt className="inline mr-1" size={12} />
                            Reports
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
                    <FaBell className="text-xl text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <FaFileAlt className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Term Report Available</p>
                      <p className="text-xs text-gray-500">Term 1 2024 report is now ready</p>
                      <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <FaChartLine className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Grade Updates</p>
                      <p className="text-xs text-gray-500">Mathematics scores updated</p>
                      <span className="text-xs text-gray-400">1 day ago</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <FaCalendarAlt className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Attendance Recorded</p>
                      <p className="text-xs text-gray-500">Weekly attendance submitted</p>
                      <span className="text-xs text-gray-400">3 days ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link 
                    to="/reports" 
                    className="w-full py-2.5 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    View All Activity
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary-red to-red-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4 text-lg">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/messages" 
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <span className="font-medium">Message Teachers</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">New</span>
                </Link>
                
                <Link 
                  to="/calendar" 
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <span className="font-medium">School Calendar</span>
                  <span className="text-xs">View</span>
                </Link>
                
                <Link 
                  to="/fees" 
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <span className="font-medium">Fee Payments</span>
                  <span className="text-xs">Pay Now</span>
                </Link>
                
                <Link 
                  to="/account-settings" 
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <span className="font-medium">Account Settings</span>
                  <span className="text-xs">Edit</span>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm opacity-80">
                  Need help? Contact school administration for support.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}