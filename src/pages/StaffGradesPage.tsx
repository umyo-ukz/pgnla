import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";
import StudentGradeCard from "../components/StudentGradeCard";
import TermSwitcher from "../components/TermSwitcher";
import { useTranslation } from "../hooks/useTranslation";

export default function StaffGradesPage() {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();

  if (user === undefined) return null;
  if (!user || role !== "staff") return <Navigate to="/login" />;

  const terms = useQuery(api.terms.listAll);
  const students = useQuery(api.staff.listAllStudents);

  const [activeTermId, setActiveTermId] = useState<Id<"terms"> | null>(null);
  const [activeClassSubjectId, setActiveClassSubjectId] = useState<Id<"classSubjects"> | null>(null);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const activeTerm = terms.find(t => t.isActive) ?? terms[0];
      setActiveTermId(activeTerm._id);
    }
  }, [terms, activeTermId]);

  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTermId
      ? { termId: activeTermId }
      : "skip"
  );

  // Auto-select first class subject when available
  useEffect(() => {
    if (!activeClassSubjectId && classSubjects && classSubjects.length > 0) {
      setActiveClassSubjectId(classSubjects[0]._id);
    }
  }, [classSubjects, activeClassSubjectId]);

  const updateSubjectWeight = useMutation(api.classSubjects.updateSubjectWeight);

  const activeClassSubject = useMemo(() => {
    return classSubjects?.find(cs => cs._id === activeClassSubjectId);
  }, [classSubjects, activeClassSubjectId]);

  // Get all grade levels for the active subject
  const gradeLevelsForSubject = useMemo(() => {
    if (!activeClassSubject || !classSubjects) return [];
    const subjectId = activeClassSubject.subjectId;
    return Array.from(
      new Set(
        classSubjects
          .filter(cs => cs.subjectId === subjectId)
          .map(cs => cs.gradeLevel)
      )
    ).sort();
  }, [activeClassSubject, classSubjects]);

  const [weightGradeLevel, setWeightGradeLevel] = useState<string>("");
  const [subjectWeight, setSubjectWeight] = useState<string>("");
  const [originalSubjectWeight, setOriginalSubjectWeight] = useState<number | null>(null);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [weightClassSubjectId, setWeightClassSubjectId] = useState<Id<"classSubjects"> | null>(null);

  // Initialize weight grade level to active class subject's grade level
  useEffect(() => {
    if (activeClassSubject) {
      setWeightGradeLevel(activeClassSubject.gradeLevel);
    }
  }, [activeClassSubject]);

  // Update weight values when grade level or class subjects change
  useEffect(() => {
    if (!activeClassSubject || !classSubjects || !weightGradeLevel) {
      setSubjectWeight("");
      setOriginalSubjectWeight(null);
      setWeightClassSubjectId(null);
      return;
    }

    const subjectId = activeClassSubject.subjectId;
    const classSubjectForGrade = classSubjects.find(
      cs => cs.subjectId === subjectId && cs.gradeLevel === weightGradeLevel
    );

    if (classSubjectForGrade) {
      const weight = classSubjectForGrade.weight ?? 0;
      setSubjectWeight(String(weight));
      setOriginalSubjectWeight(weight);
      setWeightClassSubjectId(classSubjectForGrade._id);
    } else {
      setSubjectWeight("");
      setOriginalSubjectWeight(null);
      setWeightClassSubjectId(null);
    }
  }, [activeClassSubject, classSubjects, weightGradeLevel]);

  const hasWeightChanges = useMemo(() => {
    const weightValue = subjectWeight === "" ? 0 : Number(subjectWeight);
    return !Number.isNaN(weightValue) && weightValue !== (originalSubjectWeight ?? 0);
  }, [subjectWeight, originalSubjectWeight]);

  const handleSaveWeight = async () => {
    if (!weightClassSubjectId || isSavingWeight) return;
    
    const weightValue = Number(subjectWeight);
    if (Number.isNaN(weightValue)) return;
    
    setIsSavingWeight(true);
    try {
      await updateSubjectWeight({
        classSubjectId: weightClassSubjectId,
        weight: weightValue,
      });
      setOriginalSubjectWeight(weightValue);
    } finally {
      setIsSavingWeight(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((s) => {
      const matchesName = s.fullName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesGrade = gradeFilter === "" || s.gradeLevel === gradeFilter;
      return matchesName && matchesGrade;
    });
  }, [students, search, gradeFilter]);

  const uniqueGrades = useMemo(() => {
    if (!students) return [];
    return Array.from(new Set(students.map((s) => s.gradeLevel))).sort();
  }, [students]);

  return (
    <div className="container-wide px-4 py-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("grades.editGrades")}</h1>
        <div className="flex gap-4 items-center">
          <TermSwitcher
            terms={terms}
            activeTermId={activeTermId}
            onChange={(id) => setActiveTermId(id as Id<"terms">)}
          />
          <button onClick={logout} className="btn-secondary">{t("common.logout")}</button>
        </div>
      </header>

      {/* Subject Tabs */}
      {!activeTermId ? (
        <div className="text-gray-600">{t("grades.pleaseSelectTerm")}</div>
      ) : classSubjects === undefined ? (
        <div className="text-gray-600">{t("grades.loadingSubjects")}</div>
      ) : classSubjects.length === 0 ? (
        <div className="text-gray-600 p-4 border rounded">
          {t("grades.noSubjectsFound")}
        </div>
      ) : (
        <div className="flex gap-4 border-b">
          {classSubjects.map(cs => (
            <button
              key={cs._id}
              onClick={() => setActiveClassSubjectId(cs._id)}
              className={`pb-2 ${
                activeClassSubjectId === cs._id
                  ? "border-b-2 border-primary-red font-semibold"
                  : "text-gray-500"
              }`}
            >
              {cs.subject?.name ?? "Unknown Subject"}
            </button>
          ))}
        </div>
      )}

      {/* Subject Weight */}
      {activeClassSubjectId && (
        <div className="bg-white border p-4 rounded">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">{t("grades.subjectWeight")}</label>
              <div className="flex gap-4 items-center">
                <select
                  className="input md:w-48"
                  value={weightGradeLevel}
                  onChange={(e) => setWeightGradeLevel(e.target.value)}
                >
                  {gradeLevelsForSubject.map((gradeLevel) => (
                    <option key={gradeLevel} value={gradeLevel}>
                      Grade {gradeLevel}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="input w-32"
                  value={subjectWeight}
                  onChange={e => setSubjectWeight(e.target.value)}
                  placeholder="0"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
            <button
              onClick={handleSaveWeight}
              disabled={!hasWeightChanges || isSavingWeight || !weightClassSubjectId}
              className={`px-4 py-2 rounded ${
                hasWeightChanges && !isSavingWeight && weightClassSubjectId
                  ? "bg-primary-red text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSavingWeight ? "Saving..." : "Save Weight"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {activeClassSubjectId && (
        <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder={t("performance.searchByName")}
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="input md:w-48"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">{t("performance.allClasses")}</option>
            {uniqueGrades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Students */}
      {!activeClassSubjectId ? (
        <div className="text-gray-600">{t("grades.pleaseSelectSubject")}</div>
      ) : students === undefined ? (
        <div className="text-gray-600">{t("grades.loadingStudents")}</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-gray-600 p-4 border rounded">
          {search || gradeFilter
            ? "No students match your filters."
            : t("grades.noStudentsFound")}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map(student => (
            <StudentGradeCard
              key={student._id}
              student={student}
              classSubjectId={activeClassSubjectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
