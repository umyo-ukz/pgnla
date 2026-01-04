// convex/subjectComponents.ts (create if doesn't exist)
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  handler: async (ctx) => {
    return ctx.db.query("subjectComponents").collect();
  },
});

export const getBySubject = query({
  args: {
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, { subjectId }) => {
    return ctx.db
      .query("subjectComponents")
      .withIndex("by_subject", q => q.eq("subjectId", subjectId))
      .collect();
  },
});