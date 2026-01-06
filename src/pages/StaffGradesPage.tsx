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
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>("");
  const [activeClassSubjectId, setActiveClassSubjectId] = useState<Id<"classSubjects"> | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "grade">("name");

  // Initialize active term
  useEffect(() => {
    if (!activeTermId && terms && terms.length > 0) {
      const activeTerm = terms.find(t => t.isActive) ?? terms[0];
      setActiveTermId(activeTerm._id);
    }
  }, [terms, activeTermId]);

  // Get class subjects for the active term
  const classSubjects = useQuery(
    api.classSubjects.listByClassAndTerm,
    activeTermId
      ? { termId: activeTermId }
      : "skip"
  );

  // Auto-select first class subject when available and class level is selected
  useEffect(() => {
    if (selectedClassLevel && classSubjects && classSubjects.length > 0) {
      const classSubjectsForLevel = classSubjects.filter(
        cs => cs.gradeLevel === selectedClassLevel
      );
      if (classSubjectsForLevel.length > 0 && !activeClassSubjectId) {
        setActiveClassSubjectId(classSubjectsForLevel[0]._id);
      }
    }
  }, [classSubjects, selectedClassLevel, activeClassSubjectId]);

  const updateSubjectWeight = useMutation(api.classSubjects.updateSubjectWeight);

  const activeClassSubject = useMemo(() => {
    return classSubjects?.find(cs => cs._id === activeClassSubjectId);
  }, [classSubjects, activeClassSubjectId]);

  // Get all unique class levels from class subjects
  const availableClassLevels = useMemo(() => {
    if (!classSubjects) return [];
    return Array.from(
      new Set(classSubjects.map(cs => cs.gradeLevel))
    ).sort((a, b) => {
      // Sort numerically if possible, otherwise alphabetically
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  }, [classSubjects]);

  // Filter class subjects by selected class level
  const filteredClassSubjects = useMemo(() => {
    if (!classSubjects) return [];
    if (!selectedClassLevel) return classSubjects;
    return classSubjects.filter(cs => cs.gradeLevel === selectedClassLevel);
  }, [classSubjects, selectedClassLevel]);

  // Filter students by selected class level
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    let filtered = students.filter((s) => {
      const matchesName = s.fullName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesClass = !selectedClassLevel || s.gradeLevel === selectedClassLevel;
      return matchesName && matchesClass;
    });

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.fullName.localeCompare(b.fullName);
      } else {
        // Sort by grade level first, then name
        const gradeCompare = a.gradeLevel.localeCompare(b.gradeLevel);
        if (gradeCompare !== 0) return gradeCompare;
        return a.fullName.localeCompare(b.fullName);
      }
    });

    return filtered;
  }, [students, search, selectedClassLevel, sortBy]);

  // Reset subject selection when class level changes
  useEffect(() => {
    if (selectedClassLevel && filteredClassSubjects.length > 0) {
      setActiveClassSubjectId(filteredClassSubjects[0]._id);
    } else {
      setActiveClassSubjectId(null);
    }
  }, [selectedClassLevel, filteredClassSubjects]);

  // Subject weight management (only for current class level)
  const [subjectWeight, setSubjectWeight] = useState<string>("");
  const [originalSubjectWeight, setOriginalSubjectWeight] = useState<number | null>(null);
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  // Initialize weight when active class subject changes
  useEffect(() => {
    if (activeClassSubject) {
      const weight = activeClassSubject.weight ?? 0;
      setSubjectWeight(String(weight));
      setOriginalSubjectWeight(weight);
    } else {
      setSubjectWeight("");
      setOriginalSubjectWeight(null);
    }
  }, [activeClassSubject]);

  const hasWeightChanges = useMemo(() => {
    const weightValue = subjectWeight === "" ? 0 : Number(subjectWeight);
    return !Number.isNaN(weightValue) && weightValue !== (originalSubjectWeight ?? 0);
  }, [subjectWeight, originalSubjectWeight]);

  const handleSaveWeight = async () => {
    if (!activeClassSubjectId || isSavingWeight) return;
    
    const weightValue = Number(subjectWeight);
    if (Number.isNaN(weightValue)) return;
    
    setIsSavingWeight(true);
    try {
      await updateSubjectWeight({
        classSubjectId: activeClassSubjectId,
        weight: weightValue,
      });
      setOriginalSubjectWeight(weightValue);
    } finally {
      setIsSavingWeight(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <div className="container-wide px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              📊 {t("grades.editGrades")}
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Manage student grades and subject weights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {terms && activeTermId && (
              <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
                <span className="text-gray-500 text-sm">Term:</span>
                <TermSwitcher
                  terms={terms}
                  activeTermId={activeTermId}
                  onChange={(id) => {
                    setActiveTermId(id as Id<"terms">);
                    // Reset selections when term changes
                    setSelectedClassLevel("");
                    setActiveClassSubjectId(null);
                  }}
                  className="border-0 p-0 text-sm font-medium"
                />
              </div>
            )}
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt text-gray-600"></i>
              {t("common.logout")}
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Class Level & Subject Selection */}
          <div className="border-b border-gray-100 p-4 bg-gradient-to-r from-primary-red/5 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Class & Subject Selection
              </h2>
              
              {!activeTermId ? (
                <div className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  {t("grades.pleaseSelectTerm")}
                </div>
              ) : classSubjects === undefined ? (
                <div className="text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {t("grades.loadingSubjects")}
                </div>
              ) : classSubjects.length === 0 ? (
                <div className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg text-sm">
                  <i className="fas fa-book mr-2"></i>
                  {t("grades.noSubjectsFound")}
                </div>
              ) : null}
            </div>

            {/* Class Level Selection */}
            {activeTermId && classSubjects && classSubjects.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableClassLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedClassLevel(level)}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        selectedClassLevel === level
                          ? "bg-primary-red text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-primary-red/50 hover:bg-primary-red/5"
                      }`}
                    >
                      <i className="fas fa-users"></i>
                      <span className="font-medium">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Tabs (only shown when class level is selected) */}
            {selectedClassLevel && filteredClassSubjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject for {selectedClassLevel}
                </label>
                <div className="flex overflow-x-auto pb-2 space-x-1">
                  {filteredClassSubjects.map(cs => (
                    <button
                      key={cs._id}
                      onClick={() => setActiveClassSubjectId(cs._id)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-lg transition-all ${
                        activeClassSubjectId === cs._id
                          ? "bg-primary-red text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-primary-red/50 hover:bg-primary-red/5"
                      }`}
                    >
                      <span className="font-medium">{cs.subject?.name ?? "Unknown"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subject Weight Control (only for current subject) */}
          {activeClassSubjectId && (
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-weight-hanging text-blue-600"></i>
                    <span className="font-medium text-gray-700">{t("grades.subjectWeight")}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                       {selectedClassLevel} • {activeClassSubject?.subject?.name ?? "Subject"}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        className="input pl-8 pr-4 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48"
                        value={subjectWeight}
                        onChange={e => setSubjectWeight(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    
                    <button
                      onClick={handleSaveWeight}
                      disabled={!hasWeightChanges || isSavingWeight}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        hasWeightChanges && !isSavingWeight
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isSavingWeight ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Weight
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {hasWeightChanges && (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Unsaved weight changes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Filters & Controls (only when class and subject selected) */}
          {activeClassSubjectId && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        placeholder="Search students by name..."
                        className="input pl-10 w-full border-gray-300 focus:border-primary-red focus:ring-2 focus:ring-primary-red/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    {/* Current Class Display (instead of filter) */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20">
                      <i className="fas fa-users"></i>
                      <span className="font-medium">Standard {selectedClassLevel}</span>
                      <span className="text-xs bg-primary-red/20 px-2 py-0.5 rounded">
                        {filteredStudents.length} students
                      </span>
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortBy("name")}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                          sortBy === "name"
                            ? "bg-primary-red/10 border-primary-red text-primary-red"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <i className="fas fa-sort-alpha-down"></i>
                        <span className="text-sm">Name</span>
                      </button>
                      <button
                        onClick={() => setSortBy("grade")}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                          sortBy === "grade"
                            ? "bg-blue-600/10 border-blue-600 text-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <i className="fas fa-layer-group"></i>
                        <span className="text-sm">Sort by Grade</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Count */}
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <i className="fas fa-user-graduate mr-2"></i>
                  Showing {filteredStudents.length} of {students?.length || 0} students
                  {search && ` matching "${search}"`}
                </div>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="p-4">
            {!activeTermId ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Select a Term
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Choose a term from the dropdown above to begin entering grades.
                </p>
              </div>
            ) : !selectedClassLevel ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Select a Class
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Choose a class from the options above to view available subjects and students.
                </p>
              </div>
            ) : !activeClassSubjectId ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Select a Subject
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Choose a subject for Standard {selectedClassLevel} to begin entering grades.
                </p>
              </div>
            ) : students === undefined ? (
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-4"></i>
                <p className="text-gray-600">{t("grades.loadingStudents")}</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No Students Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {search
                    ? "No students match your search criteria in Standard " + selectedClassLevel
                    : "No students are enrolled in Standard " + selectedClassLevel}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Class & Subject Header */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Standard {selectedClassLevel} • {activeClassSubject?.subject?.name ?? "Subject"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter grades for {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                      {search && ` matching "${search}"`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <i className="fas fa-sort-amount-down mr-1"></i>
                    Sorted by {sortBy === "name" ? "Name (A-Z)" : "Grade Level"}
                  </div>
                </div>
                
                {/* Student Cards */}
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
        </div>
      </div>
    </div>
  );
}