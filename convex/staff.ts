import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ===================== STUDENTS ===================== */

export const listAllStudents = query({
  handler: async (ctx) => {
    return ctx.db.query("students").collect();
  },
});



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

export const listStudentPerformance = query({
  args: {
    gradeLevel: v.optional(v.string()),
  },
  handler: async (ctx, { gradeLevel }) => {
    const students = gradeLevel
      ? await ctx.db
          .query("students")
          .filter((q) => q.eq(q.field("gradeLevel"), gradeLevel))
          .collect()
      : await ctx.db.query("students").collect();

    return students.map((s) => ({
      studentId: s._id,
      fullName: s.fullName,
      gradeLevel: s.gradeLevel,
      overall: s.overall ?? 0,
      letterGrade: s.letterGrade ?? "—",
    }));
  },
});


/* ===================== GRADES ===================== */

export const getGradesForStudent = query({
  args: {
    studentId: v.id("students"),
  },
  handler: async (ctx, { studentId }) => {
    return ctx.db
      .query("grades")
      .withIndex("by_student", q => q.eq("studentId", studentId))
      .collect();
  },
});

/*
  Update grade if it exists for same student + subject + term
  Otherwise insert
*/
export const upsertGrade = mutation({
  args: {
    studentId: v.id("students"),
    subject: v.string(),
    term: v.string(),
    score: v.number(),
  },
  handler: async (ctx, { studentId, subject, term, score }) => {
    const existing = await ctx.db
      .query("grades")
      .withIndex("by_student", q => q.eq("studentId", studentId))
      .filter(q =>
        q.and(
          q.eq(q.field("subject"), subject),
          q.eq(q.field("term"), term)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        score,
      });
    } else {
      await ctx.db.insert("grades", {
        studentId,
        subject,
        term,
        score,
        createdAt: Date.now(),
      });
    }
  },
});
