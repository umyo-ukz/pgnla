import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByClassSubject = query({
  args: { classSubjectId: v.id("classSubjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjectComponents")
      .withIndex("by_classSubject", q =>
        q.eq("classSubjectId", args.classSubjectId)
      )
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
