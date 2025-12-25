import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const createStaff = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("staff")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Staff member already exists");
    }

    await ctx.db.insert("staff", {
      email: args.email,
      passwordHash: args.passwordHash,
      fullName: args.fullName,
      isActive: true,
    });

    return { success: true };
  },
});
