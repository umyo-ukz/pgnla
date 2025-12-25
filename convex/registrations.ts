import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitRegistration = mutation({
  args: {
    studentFirstName: v.string(),
    studentLastName: v.string(),
    middleName: v.optional(v.string()),
    dateOfBirth: v.string(),
    gender: v.optional(v.string()),
    programType: v.string(),
    startDate: v.string(),
    medicalInfo: v.optional(v.string()),

    primaryParentName: v.string(),
    relationship: v.string(),
    email: v.string(),
    phone: v.string(),

    secondaryParentName: v.optional(v.string()),
    secondaryRelationship: v.optional(v.string()),
    secondaryEmail: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),

    emergencyName: v.string(),
    emergencyRelationship: v.string(),
    emergencyPhone: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("registrations", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

/* Admin only */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("registrations")
      .withIndex("by_status", q => q.eq("status", "pending"))
      .collect();
  },
});
