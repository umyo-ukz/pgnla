// convex/students.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listForParent = query({
  args: {
    parentId: v.id("users"),
  },
  handler: async (ctx, { parentId }) => {
    return ctx.db
      .query("students")
      .withIndex("by_parent", q => q.eq("parentId", parentId))
      .collect();
  },
});

export const createStudent = mutation({
  args: {
    parentId: v.id("users"),
    fullName: v.string(),
    gradeLevel: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("students", args);
  },
});

export const updateOverallGrade = mutation({
  args: {
    studentId: v.id("students"),
    overall: v.number(),
    letterGrade: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, {
      overall: args.overall,
      letterGrade: args.letterGrade,
    });
  },
});

// convex/students.ts
export const listAll = query({
  handler: async (ctx) => {
    return ctx.db.query("students").collect();
  },
});

