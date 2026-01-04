import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function StudentGradeCard({
  student,
  subjectId,
}: {
  student: any;
  subjectId: string;
}) {
  const components = useQuery(api.subjects.listComponentsForSubject, {
    subjectId,
  });

  const grades = useQuery(api.grades.listComponentGrades, {
    studentId: student._id,
    subjectId,
  });



  const updateScore = useMutation(api.grades.updateComponentScore);
  const createScore = useMutation(api.grades.createComponentGrade);
  const updateWeight = useMutation(api.subjects.updateComponentWeight);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});

  /* Sync Convex grades → local state */
  useEffect(() => {
    if (!components || !grades) return;

    const nextScores: Record<string, string> = {};
    const nextWeights: Record<string, string> = {};

    components.forEach((c) => {
      const g = grades.find((gr) => gr.componentId === c._id);
      nextScores[c._id] = g ? String(g.score) : "";
      nextWeights[c._id] = String(c.weight);
    });

    setScores(nextScores);
    setWeights(nextWeights);
  }, [components, grades]);

  if (!components || !grades) return null;


  function getLetterGrade(score: number): string {
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
  }


  const total = components.reduce((sum, c) => {
    const g = grades.find(gr => gr.componentId === c._id);
    return sum + ((g?.score ?? 0) * c.weight) / 100;
  }, 0);

  const roundedTotal = Math.round(total);
  const letterGrade = getLetterGrade(roundedTotal);
 


  return (
    <div className="border rounded-xl p-5 space-y-4 bg-gradient-to-r from-gray-100 to-white shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{student.fullName}</h3>

        <div className="text-right">
          <div className="font-bold text-lg">
            {roundedTotal}%
          </div>
          <div className="text-sm text-gray-600">
            {letterGrade}
          </div>




        </div>
      </div>


      <div className="flex gap-4 overflow-x-auto">
        {components.map((c) => {
          const grade = grades.find((g) => g.componentId === c._id);

          return (
            <div
              key={c._id}
              className="min-w-[180px] border rounded-lg p-3 space-y-2 bg-white"
            >
              <div className="text-sm font-semibold">{c.name}</div>

              {/* SCORE INPUT */}
              <input
                type="number"
                min={0}
                max={100}
                className="input text-sm"
                value={scores[c._id] ?? ""}
                placeholder="Score"
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [c._id]: e.target.value,
                  }))
                }
                onBlur={() => {
                  const value = Number(scores[c._id]);
                  if (Number.isNaN(value)) return;

                  if (grade) {
                    updateScore({
                      gradeId: grade._id,
                      score: value,
                    });
                  } else {
                    createScore({
                      studentId: student._id,
                      subjectId,
                      componentId: c._id,
                      score: value,
                    });
                  }
                }}
              />
              %

              {/* WEIGHT INPUT */}
              <div className="flex items-center gap-2 text-xs">
                <span>Weight</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input w-16 text-xs"
                  value={weights[c._id] ?? ""}
                  onChange={(e) =>
                    setWeights((prev) => ({
                      ...prev,
                      [c._id]: e.target.value,
                    }))
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
