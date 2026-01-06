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
  const updateWeight = useMutation(api.subjectComponents.updateComponentWeight);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [originalScores, setOriginalScores] = useState<Record<string, number | null>>({});
  const [originalWeights, setOriginalWeights] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!components || !grades) return;

    const s: Record<string, string> = {};
    const w: Record<string, string> = {};
    const origS: Record<string, number | null> = {};
    const origW: Record<string, number> = {};

    components.forEach(c => {
      const g = grades.find(gr => gr.componentId === c._id);
      const scoreValue = g ? g.score : null;
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

  const hasChanges = useMemo(() => {
    if (!components) return false;
    
    return components.some(c => {
      const currentScore = scores[c._id];
      const scoreValue = currentScore === "" ? null : Number(currentScore);
      const originalScore = originalScores[c._id];
      
      const scoreChanged = scoreValue !== originalScore && 
        !(scoreValue === null && originalScore === null) &&
        !Number.isNaN(scoreValue) &&
        scoreValue !== null;
      
      const weightValue = Number(weights[c._id]);
      const weightChanged = !Number.isNaN(weightValue) && weightValue !== originalWeights[c._id];
      
      return scoreChanged || weightChanged;
    });
  }, [scores, weights, originalScores, originalWeights, components]);

  const handleSave = async () => {
    if (!components || !classSubjectId || isSaving) return;
    
    setIsSaving(true);
    
    try {
      for (const c of components) {
        // Save score
        const currentScore = scores[c._id];
        const scoreValue = currentScore === "" ? null : Number(currentScore);
        const originalScore = originalScores[c._id];
        
        if (scoreValue !== originalScore && 
            !(scoreValue === null && originalScore === null) &&
            !Number.isNaN(scoreValue) &&
            scoreValue !== null) {
          const grade = grades?.find(g => g.componentId === c._id);
          
          if (grade) {
            await updateScore({ gradeId: grade._id, score: scoreValue });
          } else {
            await createScore({
              studentId: student._id,
              classSubjectId,
              componentId: c._id,
              score: scoreValue,
            });
          }
        }
        
        // Save weight
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
    } finally {
      setIsSaving(false);
    }
  };

  if (!components || !grades) return null;

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{student.fullName}</h3>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-4 py-2 rounded ${
            hasChanges && !isSaving
              ? "bg-primary-red text-white hover:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {components.map(c => {
          const grade = grades.find(g => g.componentId === c._id);

          return (
            <div key={c._id} className="min-w-[180px] border p-3 rounded">
              <div className="font-medium text-sm">{c.name}</div>

              <input
                type="number"
                className="input w-full mt-1"
                value={scores[c._id] ?? ""}
                onChange={e =>
                  setScores(p => ({ ...p, [c._id]: e.target.value }))
                }
                placeholder="Score"
              />

              <div className="flex items-center gap-2 mt-2 text-xs">
                Weight
                <input
                  type="number"
                  className="input w-16"
                  value={weights[c._id]}
                  onChange={e =>
                    setWeights(p => ({ ...p, [c._id]: e.target.value }))
                  }
                />
                %
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
