import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

function generateToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const parent = await ctx.db
      .query("parents")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();

    if (!parent || !parent.isActive) {
      throw new Error("Invalid credentials");
    }

    const valid = bcrypt.compareSync(password, parent.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const token = generateToken();

    await ctx.db.insert("sessions", {
      parentId: parent._id,
      token,
      expiresAt: Date.now() + SESSION_TTL,
    });

    return {
      token,
      parent: {
        id: parent._id,
        fullName: parent.fullName,
        email: parent.email,
      },
    };
  },
});

export const getCurrentParent = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    return await ctx.db.get(session.parentId);
  },
});

export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
