import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

function generateToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

/* ===================== LOGIN ===================== */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },

  
  handler: async (ctx, { email, password }) => {

    const normalizedEmail = email.toLowerCase();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", normalizedEmail))
      .unique();

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials");
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + SESSION_TTL,
    });

    return {
      token,
      role: user.role,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  },
});

export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;

    return ctx.db.get(session.userId);
  },
});


/* ===================== LOGOUT ===================== */

export const logout = mutation({
  args: { token: v.string() },
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
/* ===================== PASSWORD CHANGE ===================== */
