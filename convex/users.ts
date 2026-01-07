import { query, mutation } from "./_generated/server";
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

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    email: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Check if email already exists for another user
    if (updates.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email))
        .first();
      
      if (existingUser && existingUser._id !== userId) {
        throw new Error("Email already exists for another user");
      }
    }
    
    await ctx.db.patch(userId, updates);
    return userId;
  },
});





