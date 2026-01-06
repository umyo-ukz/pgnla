import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import TermSwitcher from "../components/TermSwitcher";
import { useTranslation } from "../hooks/useTranslation";

export default function StudentProfile() {
  const { user, role } = useAuth();
  const { studentId } = useParams<{ studentId: string }>();
  const { t } = useTranslation();

  if (user === undefined) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  if (!studentId) return <Navigate to="/staff/performance" />;

  const profile = useQuery(api.grades.getStudentProfile, {
    studentId: studentId as Id<"students">,
  });

  const terms = useQuery(api.terms.listAll);
  const [activeTermId, setActiveTermId] = useState<Id<"terms"> | null>(null);

  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const activeTerm = terms.find(t => t.isActive) ?? terms[0];
      setActiveTermId(activeTerm._id);
    }
  }, [terms, activeTermId]);

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

  const getStatusColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (profile === undefined) {
    return (
      <div className="container-wide px-4 py-10">
        <div className="text-center">{t("common.loading")} {t("student.studentProfile").toLowerCase()}...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-wide px-4 py-10">
        <div className="text-center text-red-600">{t("performance.student")} not found</div>
        <Link to="/staff/performance" className="btn-secondary mt-4 inline-block">
          {t("common.back")} to {t("performance.studentPerformance")}
        </Link>
      </div>
    );
  }

  // Filter grades by active term
  const filteredGrades = activeTermId
    ? profile.grades.filter(g => g.term?._id === activeTermId)
    : profile.grades;

  // Calculate overall average
  const overallAverage =
    filteredGrades.length > 0
      ? filteredGrades.reduce((sum, g) => sum + g.average, 0) / filteredGrades.length
      : 0;

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{profile.student.fullName}</h1>
          <p className="text-gray-600 mt-1">{t("student.studentProfile")}</p>
        </div>
        <Link to="/staff/performance" className="btn-secondary">
          {t("common.back")} to {t("performance.studentPerformance")}
        </Link>
      </div>

      {/* Student Info Card */}
      <div className="bg-white border rounded-xl p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">{t("student.fullName")}</label>
            <p className="text-lg font-semibold mt-1">{profile.student.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("student.classGradeLevel")}</label>
            <p className="text-lg font-semibold mt-1">{profile.student.gradeLevel}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{t("student.overallAverage")}</label>
            <p className={`text-lg font-bold mt-1 ${getColor(overallAverage)}`}>
              {overallAverage > 0 ? `${overallAverage.toFixed(2)}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Term Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{t("common.filter")} by {t("grades.term")}:</label>
        <TermSwitcher
          terms={terms}
          activeTermId={activeTermId}
          onChange={(id) => setActiveTermId(id as Id<"terms">)}
        />
      </div>

      {/* Grades by Subject */}
      {filteredGrades.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
          {activeTermId
            ? t("student.noGradesForTerm")
            : t("student.noGradesForStudent")}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGrades.map((subjectGroup, idx) => {
            const color = getColor(subjectGroup.average);
            const statusColor = getStatusColor(subjectGroup.average);

            return (
              <div key={idx} className="bg-white border rounded-xl overflow-hidden">
                {/* Subject Header */}
                <div className="bg-gray-50 border-b p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">
                        {subjectGroup.subject?.name ?? t("grades.subject")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {subjectGroup.term?.name ?? t("grades.term")} •{" "}
                        {subjectGroup.classSubject?.gradeLevel ?? "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${color}`}>
                        {subjectGroup.average.toFixed(2)}%
                      </div>
                      <div className={`text-sm font-semibold ${color}`}>
                        {getLetterGrade(subjectGroup.average)}
                      </div>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {subjectGroup.average >= 80
                          ? t("student.excellent")
                          : subjectGroup.average >= 60
                          ? t("student.satisfactory")
                          : t("student.needsAttention")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Component Grades */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {t("student.componentBreakdown")}
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectGroup.components.map(({ component, grade }) => (
                      <div
                        key={component?._id ?? grade._id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {component?.name ?? t("student.componentBreakdown")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("student.weight")}: {component?.weight ?? 0}%
                            </p>
                          </div>
                          <div className={`text-lg font-bold ${getColor(grade.score)}`}>
                            {grade.score}%
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              grade.score >= 75
                                ? "bg-green-500"
                                : grade.score >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(grade.score, 100)}%` }}
                          />
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

      {/* Summary Card */}
      {filteredGrades.length > 0 && (
        <div className="bg-primary-red text-white rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">{t("student.academicSummary")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm opacity-90">{t("student.overallAverage")}</p>
              <p className="text-3xl font-bold">{overallAverage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t("student.letterGrade")}</p>
              <p className="text-3xl font-bold">{getLetterGrade(overallAverage)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t("student.subjectsCompleted")}</p>
              <p className="text-3xl font-bold">{filteredGrades.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

