import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";

export default function StudentGradeCard({
  student,
  classSubjectId,
}: {
  student: any;
  classSubjectId: string | null;
}) {
  const components = useQuery(
    api.subjectComponents.listByClassSubject,
    classSubjectId ? { classSubjectId } : "skip"
  );

  const grades = useQuery(
    api.grades.listByStudentAndClassSubject,
    classSubjectId ? { studentId: student._id, classSubjectId } : "skip"
  );

  const updateScore = useMutation(api.grades.updateScore);
  const createScore = useMutation(api.grades.create);
  const deleteScore = useMutation(api.grades.deleteScore); // Add delete mutation
  const updateWeight = useMutation(api.subjectComponents.updateComponentWeight);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [originalScores, setOriginalScores] = useState<Record<string, number | null>>({});
  const [originalWeights, setOriginalWeights] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Calculate overall grade
  const overallScore = useMemo(() => {
    if (!components || !grades) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    components.forEach(component => {
      const grade = grades.find(g => g.componentId === component._id);
      if (grade !== undefined && grade.score !== null) {
        totalWeightedScore += grade.score * component.weight;
        totalWeight += component.weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : null;
  }, [components, grades]);

  // Get color for overall score
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Initialize scores and weights
  useEffect(() => {
    if (!components || !grades) return;

    const s: Record<string, string> = {};
    const w: Record<string, string> = {};
    const origS: Record<string, number | null> = {};
    const origW: Record<string, number> = {};

    components.forEach(c => {
      const g = grades.find(gr => gr.componentId === c._id);
      const scoreValue = g ? g.score : null;
      // Set empty string for null scores
      s[c._id] = scoreValue !== null ? String(scoreValue) : "";
      w[c._id] = String(c.weight);
      origS[c._id] = scoreValue;
      origW[c._id] = c.weight;
    });

    setScores(s);
    setWeights(w);
    setOriginalScores(origS);
    setOriginalWeights(origW);
  }, [components, grades]);

  // Check for changes - now handles empty fields
  const hasChanges = useMemo(() => {
    if (!components) return false;

    return components.some(c => {
      const currentScore = scores[c._id];
      const scoreValue = currentScore === "" ? null : 
                         (currentScore === "" ? null : Number(currentScore));
      const originalScore = originalScores[c._id];

      // Score changed if:
      // 1. Both are null but we have an empty string in input (user cleared it)
      // 2. Score value changed
      // 3. Went from null to a number
      // 4. Went from a number to null (empty field)
      const scoreChanged = (
        (currentScore === "" && originalScore !== null) || // User cleared a grade
        (currentScore !== "" && originalScore === null) || // User added a grade
        (currentScore !== "" && originalScore !== null && 
         Number(currentScore) !== originalScore) || // User changed a grade
        (currentScore === "" && originalScore === null && scores[c._id] === "") // User explicitly cleared null field
      );

      const weightValue = Number(weights[c._id]);
      const weightChanged = !Number.isNaN(weightValue) && weightValue !== originalWeights[c._id];

      return scoreChanged || weightChanged;
    });
  }, [scores, weights, originalScores, originalWeights, components]);

  // Handle score input change
  const handleScoreChange = (componentId: string, value: string) => {
    // Allow empty string, or validate number between 0-100
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setScores(prev => ({ ...prev, [componentId]: value }));
    }
  };

  // Handle weight input change
  const handleWeightChange = (componentId: string, value: string) => {
    // Allow empty string, or validate number between 0-100
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setWeights(prev => ({ ...prev, [componentId]: value }));
    }
  };

  // Save all changes
  const handleSave = async () => {
    if (!components || !classSubjectId || isSaving) return;

    setIsSaving(true);

    try {
      for (const c of components) {
        // Handle score changes
        const currentScore = scores[c._id];
        const scoreValue = currentScore === "" ? null : Number(currentScore);
        const originalScore = originalScores[c._id];

        // Check if score actually changed
        const scoreChanged = (
          (currentScore === "" && originalScore !== null) ||
          (currentScore !== "" && originalScore === null) ||
          (currentScore !== "" && originalScore !== null && 
           Number(currentScore) !== originalScore)
        );

        if (scoreChanged) {
          const grade = grades?.find(g => g.componentId === c._id);

          if (currentScore === "") {
            // User cleared the field - delete the grade
            if (grade) {
              await deleteScore({ gradeId: grade._id });
            }
          } else if (grade) {
            // Update existing grade
            await updateScore({ 
              gradeId: grade._id, 
              score: Number(currentScore) 
            });
          } else {
            // Create new grade
            await createScore({
              studentId: student._id,
              classSubjectId,
              componentId: c._id,
              score: Number(currentScore),
            });
          }
        }

        // Handle weight changes
        const weightValue = Number(weights[c._id]);
        if (!Number.isNaN(weightValue) && weightValue !== originalWeights[c._id]) {
          await updateWeight({
            componentId: c._id,
            weight: weightValue,
          });
        }
      }

      // Update original values after successful save
      const newOrigS: Record<string, number | null> = {};
      const newOrigW: Record<string, number> = {};

      components.forEach(c => {
        const currentScore = scores[c._id];
        newOrigS[c._id] = currentScore === "" ? null : Number(currentScore);
        newOrigW[c._id] = Number(weights[c._id]);
      });

      setOriginalScores(newOrigS);
      setOriginalWeights(newOrigW);
    } catch (error) {
      console.error("Error saving grades:", error);
      // You might want to show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  if (!components || !grades) return null;

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header with student info and overall grade */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          {/* Student name and overall grade badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-red/10 rounded-full flex items-center justify-center">
              <span className="font-bold text-primary-red">
                {student.fullName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{student.fullName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                   {student.gradeLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Overall grade display */}
          <div className="md:ml-6 md:pl-6 md:border-l border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Overall Grade</div>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore !== null ? `${overallScore}%` : "—"}
            </div>
            {overallScore !== null && (
              <div className="text-xs text-gray-400 mt-1">
                Weighted average
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all ${hasChanges && !isSaving
              ? "bg-primary-red text-white hover:bg-red-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Component grades grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map(c => {
          const grade = grades.find(g => g.componentId === c._id);
          const currentScore = scores[c._id];
          const componentScoreColor = currentScore !== "" && !Number.isNaN(Number(currentScore)) 
            ? getScoreColor(Number(currentScore)) 
            : "text-gray-400";

          return (
            <div
              key={c._id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-red/30 transition-colors"
            >
              {/* Component header */}
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-800 truncate">{c.name}</div>
                  {grade && grade.score !== null && (
                    <div className={`text-sm font-semibold ${componentScoreColor} mt-1`}>
                      Current: {grade.score}%
                    </div>
                  )}
                  {(!grade || grade.score === null) && (
                    <div className="text-sm text-gray-400 mt-1">
                      No grade entered
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0 ml-2">
                  ID: {c._id.slice(0, 4)}
                </div>
              </div>

              {/* Score input */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Score
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none"
                  value={scores[c._id] ?? ""}
                  onChange={e => handleScoreChange(c._id, e.target.value)}
                  placeholder="Score"
                  aria-label={`Score for ${c.name}`}
                />
                <div className="text-xs text-gray-400 mt-1">
                  Clear field to remove grade
                </div>
              </div>

              {/* Weight input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    Weight
                  </label>
                  <span className="text-xs text-gray-500">
                    {weights[c._id]}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="flex-1 accent-primary-red"
                    value={weights[c._id]}
                    onChange={e => handleWeightChange(c._id, e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-16 p-1.5 text-center border border-gray-300 rounded text-sm"
                    value={weights[c._id]}
                    onChange={e => handleWeightChange(c._id, e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Component status indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Status:</span>
                  <span className={`font-medium ${currentScore !== "" ? "text-green-600" : "text-yellow-600"}`}>
                    {currentScore !== "" ? "Graded" : "Not Graded"}
                  </span>
                </div>
                {currentScore !== "" && originalScores[c._id] === null && (
                  <div className="text-green-600 font-medium mt-1">
                    <i className="fas fa-plus mr-1"></i>
                    New grade to be added
                  </div>
                )}
                {currentScore === "" && originalScores[c._id] !== null && (
                  <div className="text-red-600 font-medium mt-1">
                    <i className="fas fa-trash mr-1"></i>
                    Grade will be removed
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with summary */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div className="text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span>
                {components.filter(c => {
                  const score = scores[c._id];
                  return score !== "" && !Number.isNaN(Number(score));
                }).length} of {components.length} components graded
              </span>
              {hasChanges && (
                <span className="text-primary-red font-medium animate-pulse">
                  •
                </span>
              )}
            </div>
            {hasChanges && (
              <div className="text-xs text-gray-400 mt-1">
                Empty fields will remove existing grades
              </div>
            )}
          </div>
          {hasChanges && (
            <div className="text-primary-red font-medium flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}