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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

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

  // Subject weight management
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

  // Toggle student expansion on mobile
  const toggleStudentExpansion = (studentId: string) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(studentId);
    }
  };

  // Close expanded student when search changes
  useEffect(() => {
    setExpandedStudentId(null);
  }, [search, selectedClassLevel, activeClassSubjectId]);

  // Mobile responsive helpers
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {t("grades.editGrades")}
            </h1>
            <p className="text-xs text-gray-600 truncate">
              Manage student grades
            </p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <i className={`fas fa-${isMobileMenuOpen ? 'times' : 'bars'} text-gray-600 text-lg`}></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="p-4 space-y-3">
              {terms && activeTermId && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 mb-1 block">Term:</span>
                  <TermSwitcher
                    terms={terms}
                    activeTermId={activeTermId}
                    onChange={(id) => {
                      setActiveTermId(id);
                      setSelectedClassLevel("");
                      setActiveClassSubjectId(null);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                    mobileOnly
                  />
                </div>
              )}
              <button
                onClick={logout}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-sign-out-alt text-gray-600"></i>
                {t("common.logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 md:py-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              {t("grades.editGrades")}
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1 truncate">
              Manage student grades and subject weights
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
            {terms && activeTermId && (
              <div className="flex items-center gap-2 bg-white border rounded-lg p-2 w-full sm:w-auto">
                <span className="text-gray-500 text-sm whitespace-nowrap">Term:</span>
                <TermSwitcher
                  terms={terms}
                  activeTermId={activeTermId}
                  onChange={(id) => {
                    setActiveTermId(id as Id<"terms">);
                    setSelectedClassLevel("");
                    setActiveClassSubjectId(null);
                  }}
                  className="border-0 p-0 text-sm font-medium min-w-[120px]"
                />
              </div>
            )}
            <button
              onClick={logout}
              className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <i className="fas fa-sign-out-alt text-gray-600"></i>
              <span className="whitespace-nowrap">{t("common.logout")}</span>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Class Level & Subject Selection */}
          <div className="border-b border-gray-100 p-3 md:p-4 bg-gradient-to-r from-primary-red/5 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">
                Class & Subject Selection
              </h2>

              {!activeTermId ? (
                <div className="text-amber-600 bg-amber-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm">
                  <i className="fas fa-info-circle mr-1 md:mr-2"></i>
                  {t("grades.pleaseSelectTerm")}
                </div>
              ) : classSubjects === undefined ? (
                <div className="text-blue-600 bg-blue-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm">
                  <i className="fas fa-spinner fa-spin mr-1 md:mr-2"></i>
                  {t("grades.loadingSubjects")}
                </div>
              ) : classSubjects.length === 0 ? (
                <div className="text-gray-600 bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm">
                  <i className="fas fa-book mr-1 md:mr-2"></i>
                  {t("grades.noSubjectsFound")}
                </div>
              ) : null}
            </div>

            {/* Class Level Selection */}
            {activeTermId && classSubjects && classSubjects.length > 0 && (
              <div className="mb-3 md:mb-4">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Select Class Level
                </label>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {availableClassLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedClassLevel(level)}
                      className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm ${selectedClassLevel === level
                          ? "bg-primary-red text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-primary-red/50 hover:bg-primary-red/5"
                        }`}
                    >
                      <i className="fas fa-users text-xs md:text-sm"></i>
                      <span className="font-medium whitespace-nowrap">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Tabs */}
            {selectedClassLevel && filteredClassSubjects.length > 0 && (
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Select Subject for {selectedClassLevel}
                </label>
                <div className="flex overflow-x-auto pb-1 md:pb-2 -mx-1 md:mx-0 px-1 md:px-0">
                  <div className="flex space-x-1 min-w-min">
                    {filteredClassSubjects.map(cs => (
                      <button
                        key={cs._id}
                        onClick={() => setActiveClassSubjectId(cs._id)}
                        className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2.5 rounded-lg transition-all text-xs md:text-sm ${activeClassSubjectId === cs._id
                            ? "bg-primary-red text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-primary-red/50 hover:bg-primary-red/5"
                          }`}
                      >
                        <span className="font-medium whitespace-nowrap truncate max-w-[100px] md:max-w-none">
                          {cs.subject?.name ?? "Unknown"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subject Weight Control */}
          {activeClassSubjectId && (
            <div className="p-3 md:p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2 flex-wrap">
                    <i className="fas fa-weight-hanging text-blue-600 text-sm md:text-base"></i>
                    <span className="font-medium text-gray-700 text-sm md:text-base">
                      {t("grades.subjectWeight")}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded truncate">
                      {selectedClassLevel} • {activeClassSubject?.subject?.name ?? "Subject"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <div className="relative flex-1 sm:flex-none">
                      <input
                        type="number"
                        className="w-full pl-7 md:pl-8 pr-3 md:pr-4 py-2 md:py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm md:text-base"
                        value={subjectWeight}
                        onChange={e => setSubjectWeight(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm md:text-base">
                        %
                      </span>
                    </div>

                    <button
                      onClick={handleSaveWeight}
                      disabled={!hasWeightChanges || isSavingWeight}
                      className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base whitespace-nowrap ${hasWeightChanges && !isSavingWeight
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      {isSavingWeight ? (
                        <>
                          <i className="fas fa-spinner fa-spin text-xs md:text-sm"></i>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save text-xs md:text-sm"></i>
                          <span>Save Weight</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {hasWeightChanges && (
                  <div className="text-xs md:text-sm text-amber-600 bg-amber-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg mt-2 md:mt-0">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Filters & Controls */}
          {activeClassSubjectId && (
            <div className="p-3 md:p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <i className="fas fa-search absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base"></i>
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20 text-sm md:text-base"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    {/* Current Class Display */}
                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20 whitespace-nowrap">
                      <i className="fas fa-users text-xs md:text-sm"></i>
                      <span className="font-medium text-xs md:text-sm">{selectedClassLevel}</span>
                      <span className="text-xs bg-primary-red/20 px-1 md:px-2 py-0.5 rounded">
                        {filteredStudents.length}
                      </span>
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-1 md:gap-2">
                      <button
                        onClick={() => setSortBy("name")}
                        className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg border flex items-center gap-1 md:gap-2 text-xs md:text-sm ${sortBy === "name"
                            ? "bg-primary-red/10 border-primary-red text-primary-red"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                      >
                        <i className="fas fa-sort-alpha-down text-xs md:text-sm"></i>
                        <span className="hidden sm:inline">Name</span>
                      </button>
                      <button
                        onClick={() => setSortBy("grade")}
                        className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg border flex items-center gap-1 md:gap-2 text-xs md:text-sm ${sortBy === "grade"
                            ? "bg-blue-600/10 border-blue-600 text-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                      >
                        <i className="fas fa-layer-group text-xs md:text-sm"></i>
                        <span className="hidden sm:inline">Grade</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Count */}
                <div className="text-xs md:text-sm text-gray-500 bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg mt-2 md:mt-0 whitespace-nowrap">
                  <i className="fas fa-user-graduate mr-1 md:mr-2"></i>
                  {filteredStudents.length}/{students?.length || 0}
                  {search && ` match "${search.substring(0, 10)}${search.length > 10 ? '...' : ''}"`}
                </div>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="p-3 md:p-4">
            {!activeTermId ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-gray-400 text-3xl md:text-5xl mb-3 md:mb-4">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <h3 className="text-lg md:text-xl font-medium text-gray-600 mb-2">
                  Select a Term
                </h3>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-2">
                  Choose a term from the dropdown to begin entering grades.
                </p>
              </div>
            ) : !selectedClassLevel ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-gray-400 text-3xl md:text-5xl mb-3 md:mb-4">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-lg md:text-xl font-medium text-gray-600 mb-2">
                  Select a Class
                </h3>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-2">
                  Choose a class to view available subjects and students.
                </p>
              </div>
            ) : !activeClassSubjectId ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-gray-400 text-3xl md:text-5xl mb-3 md:mb-4">
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className="text-lg md:text-xl font-medium text-gray-600 mb-2">
                  Select a Subject
                </h3>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-2">
                  Choose a subject for {selectedClassLevel} to begin entering grades.
                </p>
              </div>
            ) : students === undefined ? (
              <div className="text-center py-8 md:py-12">
                <i className="fas fa-spinner fa-spin text-2xl md:text-3xl text-primary-red mb-3 md:mb-4"></i>
                <p className="text-gray-600 text-sm md:text-base">{t("grades.loadingStudents")}</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-gray-400 text-3xl md:text-5xl mb-3 md:mb-4">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3 className="text-lg md:text-xl font-medium text-gray-600 mb-2">
                  No Students Found
                </h3>
                <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6 px-2">
                  {search
                    ? `No students match "${search}" in ${selectedClassLevel}`
                    : `No students enrolled in ${selectedClassLevel}`}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-3 md:px-4 py-1.5 md:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {/* Mobile Header Summary */}
                <div className="md:hidden bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {selectedClassLevel} • {activeClassSubject?.subject?.name ?? "Subject"}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                        {search && ` matching search`}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-sort-amount-down"></i>
                      <span>{sortBy === "name" ? "Name" : "Grade"}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Header Summary */}
                <div className="hidden md:flex items-center justify-between mb-3 md:mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800">
                      {selectedClassLevel} • {activeClassSubject?.subject?.name ?? "Subject"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter grades for {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                      {search && ` matching "${search}"`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    <i className="fas fa-sort-amount-down mr-1"></i>
                    Sorted by {sortBy === "name" ? "Name (A-Z)" : "Grade Level"}
                  </div>
                </div>

                {/* Student Cards */}
                {filteredStudents.map(student => (
                  <div key={student._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Mobile: Compact Student Card with Dropdown */}
                    <div className="md:hidden">
                      <div
                        className={`bg-white border rounded-lg p-3 cursor-pointer transition-all ${expandedStudentId === student._id
                            ? 'border-primary-red shadow-sm'
                            : 'border-gray-200'
                          }`}
                        onClick={() => toggleStudentExpansion(student._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary-red/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary-red font-bold text-sm">
                                {student.fullName.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {student.fullName}
                              </h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {student.gradeLevel}
                                </span>
                                <span className="text-xs text-gray-400">
                                  • Tap to {expandedStudentId === student._id ? 'collapse' : 'expand'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <i className={`fas fa-chevron-${expandedStudentId === student._id ? 'up' : 'down'} text-gray-400`}></i>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedStudentId === student._id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <StudentGradeCard
                              key={student._id}
                              student={student}
                              classSubjectId={activeClassSubjectId}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Full Student Card */}
                    <div className="hidden md:block">
                      <StudentGradeCard
                        student={student}
                        classSubjectId={activeClassSubjectId}
                      />
                    </div>
                  </div>
                ))}

                {/* Mobile Controls */}
                {filteredStudents.length > 0 && isMobile && (
                  <div className="md:hidden pt-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">
                        {expandedStudentId
                          ? `Showing ${filteredStudents.length} students`
                          : `Tap on a student to view and edit grades`}
                      </div>
                      {expandedStudentId && (
                        <button
                          onClick={() => setExpandedStudentId(null)}
                          className="text-xs text-primary-red hover:text-red-700 font-medium"
                        >
                          <i className="fas fa-times mr-1"></i>
                          Collapse all
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile Pagination/Scroll Indicator */}
                {filteredStudents.length > 5 && !expandedStudentId && (
                  <div className="md:hidden text-center pt-2">
                    <div className="text-xs text-gray-400">
                      Scroll for more students ({filteredStudents.length} total)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}