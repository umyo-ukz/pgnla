import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByClassSubject = query({
  args: { classSubjectId: v.optional(v.id("classSubjects")) },
  handler: async (ctx, args) => {
    if (!args.classSubjectId) return [];
    return await ctx.db
      .query("subjectComponents")
      .withIndex("by_classSubject", q =>
        q.eq("classSubjectId", args.classSubjectId!)
      )
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("subjectComponents")
      .collect();
  },
});

export const updateComponentWeight = mutation({
  args: {
    componentId: v.id("subjectComponents"),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.componentId, { weight: args.weight });
  },
});
