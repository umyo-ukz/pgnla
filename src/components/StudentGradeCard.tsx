import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Props = {
  student: {
    _id: Id<"students">;
    fullName: string;
  };
  subjectId: Id<"subjects"> | null;
};

export default function StudentGradeCard({ student, subjectId }: Props) {
  const components = useQuery(
    api.subjects.listComponentsForSubject,
    subjectId ? { subjectId } : "skip"
  );

  const grades = useQuery(
    api.grades.listComponentGrades,
    subjectId
      ? {
        studentId: student._id,
        subjectId,
      }
      : "skip"
  );

  const updateWeight = useMutation(api.subjects.updateComponentWeight);
  const updateScore = useMutation(api.grades.updateComponentScore);
  const createGrade = useMutation(api.grades.createComponentGrade);

  if (!components || !grades) return null;

  const total = components.reduce((sum, component) => {
    const grade = grades.find(
      (g) => g.componentId === component._id
    );

    const score = grade?.score ?? 0;
    return sum + (score * component.weight) / 100;
  }, 0);

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {student.fullName}
        </h3>
        <span className="font-bold text-lg">
          {Math.round(total)}%
        </span>
      </div>

      {/* Components */}
      <div className="flex gap-4 overflow-x-auto">
        {components.map((component) => {
          const grade = grades.find(
            (g) => g.componentId === component._id
          );

          return (
            <div
              key={component._id}
              className="min-w-[170px] border rounded-lg p-3 space-y-2"
            >
              <div className="text-sm font-medium">
                {component.name}
              </div>

              {/* Score */}
              <input
                type="number"
                min={0}
                max={100}
                value={grade?.score ?? ""}
                placeholder="Score"
                className="input text-sm"
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;

                  if (grade) {
                    updateScore({
                      gradeId: grade._id,
                      score: value,
                    });
                  } else {
                    createGrade({
                      studentId: student._id,
                      subjectId,
                      componentId: component._id,
                      score: value,
                    });
                  }
                }}
              />

              {/* Weight */}
              <div className="flex items-center gap-2 text-xs">
                <span>Weight</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={component.weight}
                  onChange={(e) =>
                    updateWeight({
                      componentId: component._id,
                      weight: Number(e.target.value),
                    })
                  }
                  className="input w-16 text-xs"
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
