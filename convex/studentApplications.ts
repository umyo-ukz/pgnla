import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

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
    await ctx.db.insert("studentApplications", {
      ...args,
      status: "submitted",
      createdAt: Date.now(),
    });
  },
});

/* Admin only */

export const listPending = query({
  handler: async (ctx) => {
    return ctx.db
      .query("studentApplications")
      .withIndex("by_status", q => q.eq("status", "submitted"))
      .collect();
  },
});




export const approveRegistration = mutation({
  args: {
    registrationId: v.id("studentApplications"),
  },
  handler: async (ctx, { registrationId }) => {
    const reg = await ctx.db.get(registrationId);
    if (!reg || reg.status !== "submitted") {
      throw new Error("Invalid registration");
    }

    // Create parent user
    const tempPassword = Math.random().toString(36).slice(2, 10);
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    const parentUserId = await ctx.db.insert("users", {
      email: reg.email,
      fullName: reg.primaryParentName,
      passwordHash,
      role: "parent",
      isActive: true,
    });

    // Create student
    await ctx.db.insert("students", {
      parentId: parentUserId,
      fullName: `${reg.studentFirstName} ${reg.studentLastName}`,
      gradeLevel: reg.programType,
    });

    // Update registration
    await ctx.db.patch(registrationId, {
      status: "approved",
    });

    return {
      success: true,
      tempPassword,
    };
  },
});

export const rejectRegistration = mutation({
  args: {
    registrationId: v.id("studentApplications"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");
    
    await ctx.db.patch(args.registrationId, {
      status: "rejected",
      rejectionReason: args.reason || "Application rejected by administrator",
      reviewedAt: Date.now(),
    });
    
  
    return args.registrationId;
  },
});

export const getById = query({
  args: { registrationId: v.id("studentApplications") },
  handler: async (ctx, { registrationId }) => {
    return ctx.db.get(registrationId);
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, { status }) => {
    return ctx.db
      .query("studentApplications")
      .withIndex("by_status", q => q.eq("status", status))
      .order("desc")
      .collect();
  },
});


