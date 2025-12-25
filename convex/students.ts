// convex/students.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listForParent = query({
  args: {
    parentId: v.id("parents"),
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
    parentId: v.id("parents"),
    fullName: v.string(),
    gradeLevel: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("students", args);
  },
});
