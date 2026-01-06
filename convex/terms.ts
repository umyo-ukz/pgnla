import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("terms")
      .filter(q => q.eq(q.field("isActive"), true))
      .collect();
  },
});
