import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function StudentGradeCard({
  student,
  classSubjectId,
}: {
  student: any;
  classSubjectId: string;
}) {
  const components = useQuery(
    api.subjectComponents.listByClassSubject,
    { classSubjectId }
  );

  const grades = useQuery(
    api.grades.listByStudentAndClassSubject,
    { studentId: student._id, classSubjectId }
  );

  const updateScore = useMutation(api.grades.updateScore);
  const createScore = useMutation(api.grades.create);
  const updateWeight = useMutation(api.subjectComponents.updateComponentWeight);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!components || !grades) return;

    const s: Record<string, string> = {};
    const w: Record<string, string> = {};

    components.forEach(c => {
      const g = grades.find(gr => gr.componentId === c._id);
      s[c._id] = g ? String(g.score) : "";
      w[c._id] = String(c.weight);
    });

    setScores(s);
    setWeights(w);
  }, [components, grades]);

  if (!components || !grades) return null;

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white">
      <h3 className="font-semibold">{student.fullName}</h3>

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
                onBlur={() => {
                  const value = Number(scores[c._id]);
                  if (Number.isNaN(value)) return;

                  if (grade) {
                    updateScore({ gradeId: grade._id, score: value });
                  } else {
                    createScore({
                      studentId: student._id,
                      classSubjectId,
                      componentId: c._id,
                      score: value,
                    });
                  }
                }}
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
                  onBlur={() =>
                    updateWeight({
                      componentId: c._id,
                      weight: Number(weights[c._id]),
                    })
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
