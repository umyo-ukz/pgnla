import { query } from "./_generated/server";

export const listParents = query({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .filter(q => q.eq(q.field("role"), "parent"))
      .collect();
  },
});

export const listStaff = query({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .filter(q => q.eq(q.field("role"), "staff"))
      .collect();
  },
});
