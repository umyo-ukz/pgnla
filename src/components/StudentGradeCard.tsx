// components/StudentGradeCard.tsx
import { Link } from "react-router-dom";

export default function StudentGradeCard({
  student,
  subjectId,
}: {
  student: any;
  subjectId: string | null;
}) {
  return (
    <div className="border rounded-xl p-5 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-lg">{student.fullName}</h3>
        <p className="text-sm text-gray-600">
          Grade {student.gradeLevel}
        </p>
      </div>

      <Link
        to={`/staff/grades/${student._id}?subject=${subjectId}`}
        className="btn-primary"
      >
        Edit Grades
      </Link>
    </div>
  );
}
