import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function ParentStudentProfile() {
    const { user, role } = useAuth();
    const { studentId } = useParams<{ studentId: string }>();

    // Auth checks

    if (!user || role !== "parent") return <Navigate to="/login" />;
    if (!studentId) return <Navigate to="/parent-dashboard" />;

    const [activeTermId, setActiveTermId] = useState<Id<"terms"> | null>(null);
    const [activeView, setActiveView] = useState<"grades" | "attendance">("grades");

    // Fetch student data
    const student = useQuery(api.students.listForParent, { 
        parentId: user._id 
    });
    
    const specificStudent = useMemo(() => {
        if (!student) return null;
        return student.find(s => s._id === studentId);
    }, [student, studentId]);

    const allComponentGrades = useQuery(api.grades.listAll);
    const classSubjects = useQuery(
        api.classSubjects.listByClassAndTerm,
        activeTermId
            ? { termId: activeTermId }
            : "skip"
    );

    const components = useQuery(api.subjectComponents.listAll);
    const terms = useQuery(api.terms.listAll);

    // Initialize active term
    useEffect(() => {
        if (!activeTermId && terms && terms.length > 0) {
            const activeTerm = terms.find(t => t.isActive) ?? terms[0];
            setActiveTermId(activeTerm._id);
        }
    }, [terms, activeTermId]);

    // Check if this student belongs to the parent
    const parentStudents = useQuery(api.students.listForParent, { parentId: user._id });
    const isAuthorized = useMemo(() => {
        if (!parentStudents || !student) return false;
        return parentStudents.some(s => s._id === studentId);
    }, [parentStudents, student, studentId]);

    // If student doesn't belong to parent, redirect
    if (isAuthorized === false) {
        return <Navigate to="/parent-dashboard" />;
    }

    // Helper functions
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
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getStatusColor = (score: number, hasGrades: boolean) => {
        if (!hasGrades) return "bg-gray-100 text-gray-700";
        if (score >= 80) return "bg-green-100 text-green-800";
        if (score >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    // Calculate overall grade for the student
    const calculateStudentGrade = () => {
        if (!allComponentGrades || !classSubjects || !components || !activeTermId || !studentId) {
            return { overall: 0, letterGrade: "N/A", hasGrades: false };
        }

        // Filter class subjects for active term
        const termClassSubjects = classSubjects.filter(cs => cs.termId === activeTermId);
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

        return {
            overall,
            letterGrade: getLetterGrade(overall),
            hasGrades: true
        };
    };

    // Calculate subject-wise grades
    const getSubjectGrades = useMemo(() => {
        if (!allComponentGrades || !classSubjects || !components || !activeTermId || !studentId) {
            return [];
        }

        const termClassSubjects = classSubjects.filter(cs => cs.termId === activeTermId);
        const studentGrades = allComponentGrades.filter(g => g.studentId === studentId);

        return termClassSubjects.map(classSubject => {
            const subjectComps = components.filter(comp => comp.classSubjectId === classSubject._id);

            let subjectScore = 0;
            let componentWeightSum = 0;
            let componentsWithGrades = 0;
            const componentDetails: Array<{ name: string, score: number, weight: number }> = [];

            subjectComps.forEach(comp => {
                const grade = studentGrades.find(g => g.componentId === comp._id);

                if (grade) {
                    const compWeight = comp.weight ?? 0;
                    subjectScore += grade.score * compWeight;
                    componentWeightSum += compWeight;
                    componentsWithGrades++;
                    componentDetails.push({
                        name: comp.name,
                        score: grade.score,
                        weight: comp.weight
                    });
                }
            });

            const average = componentWeightSum > 0 ? (subjectScore / componentWeightSum) : 0;

            return {
                subject: classSubject.subject,
                classSubject,
                average: Math.round(average * 100) / 100,
                components: componentDetails,
                hasGrades: componentsWithGrades > 0,
                term: terms?.find(t => t._id === activeTermId)
            };
        }).filter(subject => subject.hasGrades);
    }, [allComponentGrades, classSubjects, components, activeTermId, studentId, terms]);

    // Calculate overall stats
    const overallStats = useMemo(() => {
        const studentGrade = calculateStudentGrade();
        const subjectGrades = getSubjectGrades;

        return {
            overallGrade: studentGrade.overall,
            letterGrade: studentGrade.letterGrade,
            hasGrades: studentGrade.hasGrades,
            totalSubjects: subjectGrades.length,
            averageScore: subjectGrades.length > 0
                ? Math.round(subjectGrades.reduce((sum, sg) => sum + sg.average, 0) / subjectGrades.length)
                : 0,
            highSubjects: subjectGrades.filter(sg => sg.average >= 80).length,
            lowSubjects: subjectGrades.filter(sg => sg.average < 60).length,
        };
    }, [calculateStudentGrade, getSubjectGrades]);

    // Loading states
    if (student === undefined || allComponentGrades === undefined ||
        classSubjects === undefined || components === undefined || terms === undefined) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading student profile...</p>
                </div>
            </div>
        );
    }

    if (!specificStudent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl text-gray-300 mb-4">👤</div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">Student Not Found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        The student you're looking for doesn't exist or you don't have access.
                    </p>
                    <Link
                        to="/parent-dashboard"
                        className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <Link
                            to="/parent-dashboard"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-red mb-4"
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-red to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                                {specificStudent?.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                    {specificStudent?.fullName}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        Grade {specificStudent?.gradeLevel}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        Student ID: {specificStudent?._id.slice(0, 6)}...
                                    </span>
                                    {activeTermId && terms && (
                                        <span className="px-3 py-1 bg-primary-red/10 text-primary-red rounded-full text-sm font-medium">
                                            <i className="fas fa-calendar-alt mr-1"></i>
                                            {terms.find(t => t._id === activeTermId)?.name || "Term"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${getColor(overallStats.overallGrade)}`}>
                                {overallStats.hasGrades ? `${overallStats.overallGrade}%` : "—"}
                            </div>
                            <div className={`text-lg font-semibold ${getColor(overallStats.overallGrade)}`}>
                                {overallStats.letterGrade}
                            </div>
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(overallStats.overallGrade, overallStats.hasGrades)}`}>
                                {overallStats.hasGrades ? (
                                    overallStats.overallGrade >= 80 ? "Excellent Performance" :
                                        overallStats.overallGrade >= 60 ? "Satisfactory Performance" :
                                            "Needs Attention"
                                ) : "No Grades Yet"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <i className="fas fa-chart-line text-2xl text-green-600"></i>
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                {overallStats.averageScore}%
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
                        <p className="text-xs text-gray-400">
                            Across all subjects
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <i className="fas fa-star text-2xl text-yellow-600"></i>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">
                                {overallStats.highSubjects}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Strong Subjects</h3>
                        <p className="text-xs text-gray-400">
                            80% or higher
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <i className="fas fa-exclamation-circle text-2xl text-red-600"></i>
                            </div>
                            <span className="text-2xl font-bold text-red-600">
                                {overallStats.lowSubjects}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Needs Attention</h3>
                        <p className="text-xs text-gray-400">
                            Below 60%
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveView("grades")}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeView === "grades"
                                    ? "border-b-2 border-primary-red text-primary-red"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <i className="fas fa-graduation-cap mr-2"></i>
                            Academic Performance
                        </button>
                        <button
                            onClick={() => setActiveView("attendance")}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeView === "attendance"
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <i className="fas fa-calendar-check mr-2"></i>
                            Attendance
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {activeView === "grades" && (
                            <div>
                                {/* Term Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Term
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {terms?.map(term => (
                                            <button
                                                key={term._id}
                                                onClick={() => setActiveTermId(term._id)}
                                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTermId === term._id
                                                        ? "bg-primary-red text-white shadow-sm"
                                                        : "bg-white text-gray-700 border border-gray-300 hover:border-primary-red/50 hover:bg-primary-red/5"
                                                    }`}
                                            >
                                                <i className="fas fa-calendar-alt"></i>
                                                {term.name}
                                                {term.isActive && (
                                                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Active</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subject Grades */}
                                {getSubjectGrades.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-5xl mb-4">
                                            <i className="fas fa-graduation-cap"></i>
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-600 mb-2">
                                            No Grades Available
                                        </h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            {activeTermId
                                                ? `No grades have been recorded for ${terms?.find(t => t._id === activeTermId)?.name || "this term"} yet.`
                                                : "Please select a term to view grades."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {getSubjectGrades.map((subjectGrade, idx) => {
                                            const color = getColor(subjectGrade.average);
                                            const statusColor = getStatusColor(subjectGrade.average, true);

                                            return (
                                                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                                    {/* Subject Header */}
                                                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-900">
                                                                    {subjectGrade.subject?.name || "Subject"}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-sm text-gray-600">
                                                                        <i className="fas fa-layer-group mr-1"></i>
                                                                        {subjectGrade.components.length} components
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">
                                                                        • <i className="fas fa-weight-hanging mr-1"></i>
                                                                        Weight: {subjectGrade.classSubject?.weight || 100}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-3xl font-bold ${color}`}>
                                                                    {subjectGrade.average}%
                                                                </div>
                                                                <div className={`text-lg font-semibold ${color}`}>
                                                                    {getLetterGrade(subjectGrade.average)}
                                                                </div>
                                                                <div className="mt-2">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                                        {subjectGrade.average >= 80 ? "Excellent" :
                                                                            subjectGrade.average >= 60 ? "Satisfactory" :
                                                                                "Needs Attention"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Component Breakdown */}
                                                    <div className="p-4 bg-white">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                            <i className="fas fa-list-ul mr-2"></i>
                                                            Component Breakdown
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {subjectGrade.components.map((component, compIdx) => (
                                                                <div
                                                                    key={compIdx}
                                                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-red/30 transition-colors"
                                                                >
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div>
                                                                            <p className="font-medium text-gray-900 text-sm">
                                                                                {component.name}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                Weight: {component.weight}%
                                                                            </p>
                                                                        </div>
                                                                        <div className={`text-lg font-bold ${getColor(component.score)}`}>
                                                                            {component.score}%
                                                                        </div>
                                                                    </div>

                                                                    {/* Progress Bar */}
                                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${component.score >= 80 ? "bg-green-500" :
                                                                                    component.score >= 60 ? "bg-yellow-500" :
                                                                                        "bg-red-500"
                                                                                }`}
                                                                            style={{ width: `${Math.min(component.score, 100)}%` }}
                                                                        />
                                                                    </div>

                                                                    {/* Status */}
                                                                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                                                                        <span>
                                                                            {component.score >= 80 ? "Excellent" :
                                                                                component.score >= 60 ? "Satisfactory" :
                                                                                    "Needs Improvement"}
                                                                        </span>
                                                                        <span>Score: {component.score}/100</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === "attendance" && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-4">
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <h3 className="text-xl font-medium text-gray-600 mb-2">
                                    Coming Soon
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Attendance records will be displayed here once they become available for {specificStudent?.fullName}.
                                </p>
                                
                            </div>
                        )}
                    </div>
                </div>

                
            </div>
        </div>
    );
}