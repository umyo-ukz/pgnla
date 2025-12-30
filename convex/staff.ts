import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ===================== STUDENTS ===================== */

export const listAllStudents = query({
  handler: async (ctx) => {
    return ctx.db.query("students").collect();
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
