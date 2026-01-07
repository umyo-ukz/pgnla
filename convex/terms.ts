import { query } from "./_generated/server";


export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("terms")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("terms")
      .collect();
  },
});