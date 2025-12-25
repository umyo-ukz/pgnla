import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  parents: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  sessionsParent: defineTable({
    parentId: v.id("parents"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

    sessionsStaff: defineTable({
    staffId: v.id("staff"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  students: defineTable({
    parentId: v.id("parents"),
    fullName: v.string(),
    gradeLevel: v.string(),
  }).index("by_parent", ["parentId"]),

  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
  }).index("by_email", ["email"]),

  staff: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),


});
  

