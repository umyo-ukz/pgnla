import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createParent = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("parents")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Parent already exists");
    }

    await ctx.db.insert("parents", {
      email: args.email,
      passwordHash: args.passwordHash,
      fullName: args.fullName,
      isActive: true,
    });
  },
});
