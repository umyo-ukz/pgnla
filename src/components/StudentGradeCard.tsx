import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function StudentGradeCard({
  student,
  classSubjectId,
}: {
  student: any;
  classSubjectId: Id<"classSubjects"> | undefined;
}) {
  const components = useQuery(
    api.subjectComponents.listByClassSubject,
    { classSubjectId }
  );

  const grades = useQuery(
    api.grades.listByStudentAndClassSubject,
    classSubjectId && student?._id ? { 
      studentId: student._id, 
      classSubjectId 
    } : "skip"
  );

  // Use the new validation mutation instead of separate ones
  const createOrUpdateGradeWithValidation = useMutation(api.grades.createOrUpdateGradeWithValidation);
  const deleteScore = useMutation(api.grades.deleteScore);
  const updateWeight = useMutation(api.subjectComponents.updateComponentWeight);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [originalScores, setOriginalScores] = useState<Record<string, number | null>>({});
  const [originalWeights, setOriginalWeights] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate overall grade based on points/weight system
  const overallScore = useMemo(() => {
    if (!components || !grades) return null;

    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;

    components.forEach(component => {
      const grade = grades.find(g => g.componentId === component._id);
      const weight = component.weight;
      
      if (grade !== undefined && grade.score !== null) {
        // Cap score at component weight (safety check)
        const earned = Math.min(grade.score, weight);
        totalEarnedPoints += earned;
        totalPossiblePoints += weight;
      } else {
        // Student hasn't been graded for this component yet
        totalPossiblePoints += weight;
      }
    });

    return totalPossiblePoints > 0 
      ? Math.round((totalEarnedPoints / totalPossiblePoints) * 10000) / 100 // 2 decimal places
      : null;
  }, [components, grades]);

  // Get color for overall score
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Get color for individual component score
  const getComponentScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
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

  // Check for changes
  const hasChanges = useMemo(() => {
    if (!components) return false;

    return components.some(c => {
      const currentScore = scores[c._id];
      const originalScore = originalScores[c._id];

      const scoreChanged = (
        (currentScore === "" && originalScore !== null) ||
        (currentScore !== "" && originalScore === null) ||
        (currentScore !== "" && originalScore !== null && 
         Number(currentScore) !== originalScore)
      );

      const weightValue = Number(weights[c._id]);
      const weightChanged = !Number.isNaN(weightValue) && weightValue !== originalWeights[c._id];

      return scoreChanged || weightChanged;
    });
  }, [scores, weights, originalScores, originalWeights, components]);

  // Handle score input change with validation
  const handleScoreChange = (componentId: string, value: string) => {
    setError(null);
    
    if (value === "" || /^\d*\.?\d*$/.test(value)) { // Allow numbers and decimals
      const component = components?.find(c => c._id === componentId);
      if (component && value !== "") {
        const weight = component.weight;
        const numValue = Number(value);
        
        // Show warning but allow input (validation happens on save)
        if (numValue > weight) {
          setError(`Note: Score (${numValue}) exceeds component weight (${weight}). Will be capped at ${weight} on save.`);
        }
      }
      
      setScores(prev => ({ ...prev, [componentId]: value }));
    }
  };

  // Handle weight input change
  const handleWeightChange = (componentId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWeights(prev => ({ ...prev, [componentId]: value }));
    }
  };

  // Save all changes using the validation mutation
  const handleSave = async () => {
    if (!components || !classSubjectId || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      for (const c of components) {
        // Handle weight changes first (as they affect score validation)
        const weightValue = Number(weights[c._id]);
        if (!Number.isNaN(weightValue) && weightValue !== originalWeights[c._id]) {
          await updateWeight({
            componentId: c._id,
            weight: weightValue,
          });
        }

        // Handle score changes
        const currentScore = scores[c._id];
        const originalScore = originalScores[c._id];

        // Check if score actually changed
        const scoreChanged = (
          (currentScore === "" && originalScore !== null) ||
          (currentScore !== "" && originalScore === null) ||
          (currentScore !== "" && originalScore !== null && 
           Number(currentScore) !== originalScore)
        );

        if (scoreChanged) {
          if (currentScore === "") {
            // User cleared the field - delete the grade
            const grade = grades?.find(g => g.componentId === c._id);
            if (grade) {
              await deleteScore({ gradeId: grade._id });
            }
          } else {
            // Use the validation mutation for create/update
            await createOrUpdateGradeWithValidation({
              studentId: student._id,
              classSubjectId,
              componentId: c._id,
              score: Number(currentScore),
            });
          }
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
      
    } catch (error: any) {
      console.error("Error saving grades:", error);
      setError(error.message || "Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  // Early return if no class subject
  if (!classSubjectId) {
    return (
      <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm">
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-book text-3xl mb-3"></i>
          <p>No class subject selected</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (components === undefined || grades === undefined) {
    return (
      <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no components found
  if (components.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm">
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-clipboard-list text-3xl mb-3"></i>
          <p>No assessment components found for this class</p>
          <p className="text-sm mt-2">Please add assessment components first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <div className="flex items-start gap-2">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>
              <strong className="font-medium">Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

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
            <div className="text-sm text-gray-500 mb-1">Overall Subject Grade</div>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore !== null ? `${overallScore.toFixed(1)}%` : "—"}
            </div>
            {overallScore !== null && (
              <div className="text-xs text-gray-400 mt-1">
                Points earned / total possible
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex flex-col items-end gap-2">
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
          {hasChanges && (
            <div className="text-xs text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>
              Scores will be capped at component weight
            </div>
          )}
        </div>
      </div>

      {/* Component grades grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {components.map(c => {
          const grade = grades.find(g => g.componentId === c._id);
          const currentScore = scores[c._id];
          const weight = Number(weights[c._id]) || c.weight;
          const percentage = currentScore !== "" && !Number.isNaN(Number(currentScore)) && weight > 0
            ? (Number(currentScore) / weight) * 100
            : 0;
          
          const componentScoreColor = currentScore !== "" && !Number.isNaN(Number(currentScore)) && weight > 0
            ? getComponentScoreColor(Number(currentScore), weight)
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
                    <div className="mt-2 space-y-1">
                      <div className={`font-semibold ${componentScoreColor}`}>
                        {grade.score}/{weight} points
                      </div>
                      <div className="text-xs text-gray-500">
                        ({percentage.toFixed(1)}% of component)
                      </div>
                    </div>
                  )}
                  {(!grade || grade.score === null) && (
                    <div className="text-sm text-gray-400 mt-2">
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    Score (points)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.]*"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red outline-none pr-10"
                    value={scores[c._id] ?? ""}
                    onChange={e => handleScoreChange(c._id, e.target.value)}
                    placeholder="0"
                    aria-label={`Score for ${c.name} (max ${weight})`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    /{weight}
                  </div>
                </div>
             
                <div className="text-xs text-gray-400 mt-1">
                  Clear field to remove grade
                </div>
              </div>

              {/* Weight input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">
                    Component Weight (Percentage)
                  </label>
                  
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
                <div className="flex justify-between text-gray-500 mb-2">
                  <span>Points Status:</span>
                  <span className={`font-medium ${currentScore !== "" ? "text-green-600" : "text-yellow-600"}`}>
                    {currentScore !== "" ? "Graded" : "Not Graded"}
                  </span>
                </div>
                {currentScore !== "" && originalScores[c._id] === null && (
                  <div className="text-green-600 font-medium mt-1 flex items-center gap-1">
                    <i className="fas fa-plus"></i>
                    <span>New grade to be added</span>
                  </div>
                )}
                {currentScore === "" && originalScores[c._id] !== null && (
                  <div className="text-red-600 font-medium mt-1 flex items-center gap-1">
                    <i className="fas fa-trash"></i>
                    <span>Grade will be removed</span>
                  </div>
                )}
                {currentScore !== "" && Number(currentScore) > weight && (
                  <div className="text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Will be capped at {weight}</span>
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
                Empty fields will remove existing grades • Scores capped at component weight
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {overallScore !== null && (
              <div className="text-sm">
                <span className="text-gray-500">Current Subject Total:</span>
                <span className={`ml-2 font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(1)}%
                </span>
              </div>
            )}
            {hasChanges && (
              <div className="text-primary-red font-medium flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>Unsaved changes</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}