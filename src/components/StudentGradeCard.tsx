import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const SUBJECTS = ["Math", "English", "Science", "Social Studies"];
const TERM = "Term 1";

export default function StudentGradeCard({ student }: { student: any }) {
  const grades = useQuery(api.staff.getGradesForStudent, {
    studentId: student._id,
  });

  const upsertGrade = useMutation(api.staff.upsertGrade);
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState<Record<string, number>>({});

  function startEdit() {
    const map: Record<string, number> = {};
    grades?.forEach((g) => {
      if (g.term === TERM) {
        map[g.subject] = g.score;
      }
    });
    setLocal(map);
    setEditing(true);
  }

  async function save() {
    for (const subject of SUBJECTS) {
      if (local[subject] !== undefined) {
        await upsertGrade({
          studentId: student._id,
          subject,
          term: TERM,
          score: local[subject],
        });
      }
    }
    setEditing(false);
  }

  return (
    <div className="border rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">
            {student.fullName}
          </h2>
          <p className="text-sm text-gray-600">
            Grade {student.gradeLevel}
          </p>
        </div>

        {!editing ? (
          <button onClick={startEdit} className="btn-primary text-sm">
            Edit Grades
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm">
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUBJECTS.map((subject) => {
          const grade = grades?.find(
            g => g.subject === subject && g.term === TERM
          );

          return (
            <div key={subject}>
              <label className="text-sm text-gray-600">
                {subject}
              </label>

              {editing ? (
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input mt-1"
                  value={local[subject] ?? grade?.score ?? ""}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      [subject]: Number(e.target.value),
                    })
                  }
                />
              ) : (
                <div className="font-medium mt-1">
                  {grade?.score ?? "—"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
