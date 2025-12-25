import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listForParent = query({
  args: {
    parentId: v.id("parents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("parentId"), args.parentId))
      .collect();
  },
});

export const createStudent = mutation({
  args: {
    parentId: v.id("parents"),
    fullName: v.string(),
    gradeLevel: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("students", {
      parentId: args.parentId,
      fullName: args.fullName,
      gradeLevel: args.gradeLevel,
    });
  },
});
