// convex/grades.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listForStudent = query({
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

export const addGrade = mutation({
  args: {
    studentId: v.id("students"),
    subject: v.string(),
    term: v.string(),
    score: v.number(),
    teacherNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("grades", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

