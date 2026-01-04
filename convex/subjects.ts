import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const listSubjects = query({
  handler: async (ctx) => {
    const grades = await ctx.db.query("grades").collect();
    return Array.from(new Set(grades.map(g => g.subject))).sort();
  },
});




export const listActiveSubjects = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("subjects")
      .collect();
  },
});

export const listComponentsForSubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, { subjectId }) => {
    return ctx.db
      .query("subjectComponents")
      .withIndex("by_subject", q => q.eq("subjectId", subjectId))
      .collect();
  },
});


export const updateComponent = mutation({
  args: {
    componentId: v.id("subjectComponents"),
    weight: v.optional(v.number()),
    score: v.optional(v.number()),
    gradeId: v.optional(v.id("componentGrades")),
  },
  handler: async (ctx, args) => {
    if (args.weight !== undefined) {
      await ctx.db.patch(args.componentId, { weight: args.weight });
    }

    if (args.gradeId && args.score !== undefined) {
      await ctx.db.patch(args.gradeId, { score: args.score });
    }
  },
});

export const updateComponentWeight = mutation({
  args: {
    componentId: v.id("subjectComponents"),
    weight: v.number(),
  },
  handler: async (ctx, { componentId, weight }) => {
    await ctx.db.patch(componentId, { weight });
  },
});

export const updateSubjectWeight = mutation({
  args: {
    subjectId: v.id("subjects"),
    weight: v.number(),
  },
  handler: async (ctx, { subjectId, weight }) => {
    await ctx.db.patch(subjectId, { weight });
  },
});



