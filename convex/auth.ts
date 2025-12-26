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

/* ===================== PARENT ===================== */

export const loginParent = mutation({
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

    if (!bcrypt.compareSync(password, parent.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();

    await ctx.db.insert("sessionsParent", {
      parentId: parent._id,
      token,
      expiresAt: Date.now() + SESSION_TTL,
    });

    return {
      token,
      role: "parent" as const,
      user: {
        id: parent._id,
        fullName: parent.fullName,
        email: parent.email,
      },
    };
  },
});

export const getCurrentParent = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsParent")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;
    return ctx.db.get(session.parentId);
  },
});

/* ===================== STAFF ===================== */

export const loginStaff = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();

    if (!staff || !staff.isActive) {
      throw new Error("Invalid credentials");
    }

    if (!bcrypt.compareSync(password, staff.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();

    await ctx.db.insert("sessionsStaff", {
      staffId: staff._id,
      token,
      expiresAt: Date.now() + SESSION_TTL,
    });

    return {
      token,
      role: "staff" as const,
      user: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
      },
    };
  },
});

export const getCurrentStaff = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsStaff")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;
    return ctx.db.get(session.staffId);
  },
});

/* ===================== Admin ===================== */

export const loginAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", q => q.eq("email", email))
      .unique();

    if (!admin || !admin.isActive) {
      throw new Error("Invalid credentials");
    }

    if (!bcrypt.compareSync(password, admin.passwordHash)) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken();

    await ctx.db.insert("sessionsAdmin", {
      adminId: admin._id,
      token,
      expiresAt: Date.now() + SESSION_TTL,
    });

    return {
      token,
      role: "admin" as const,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
      },
    };
  },
});

export const getCurrentAdmin = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsStaff")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;
    return ctx.db.get(session.staffId);
  },
});

/* ===================== LOGOUT ===================== */

export const logoutParent = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsParent")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (session) await ctx.db.delete(session._id);
  },
});

export const logoutStaff = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsStaff")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (session) await ctx.db.delete(session._id);
  },
});

export const logoutAdmin = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessionsAdmin")
      .withIndex("by_token", q => q.eq("token", token))
      .unique();

    if (session) await ctx.db.delete(session._id);
  },
});
