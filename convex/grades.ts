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

export const listComponentGrades = query({
  args: {
    studentId: v.id("students"),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("componentGrades")
      .withIndex("by_student_subject", q =>
        q.eq("studentId", args.studentId).eq("subjectId", args.subjectId)
      )
      .collect();
  },
});



export const updateComponentScore = mutation({
  args: {
    gradeId: v.id("componentGrades"),
    score: v.number(),
  },
  handler: async (ctx, { gradeId, score }) => {
    await ctx.db.patch(gradeId, { score });
  },
});

export const createComponentGrade = mutation({
  args: {
    studentId: v.id("students"),
    subjectId: v.id("subjects"),
    componentId: v.id("subjectComponents"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("componentGrades", {
      ...args,
    });
  },
});
