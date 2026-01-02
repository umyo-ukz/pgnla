import { query } from "./_generated/server";

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
