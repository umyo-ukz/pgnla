import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.string(),
    role: v.union(
      v.literal("parent"),
      v.literal("staff"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, { email, password, fullName, role }) => {
    const normalizedEmail = email.toLowerCase();
    
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", q => q.eq("email", normalizedEmail))
    .first();

    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await ctx.db.insert("users", {
      email: normalizedEmail,
      passwordHash,
      fullName,
      role,
      isActive: true,
    });

    return { success: true };
  },
});





