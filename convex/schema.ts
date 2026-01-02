import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    role: v.union(
      v.literal("parent"),
      v.literal("staff"),
      v.literal("admin")
    ),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  parents: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  students: defineTable({
    parentId: v.id("users"),
    fullName: v.string(),
    gradeLevel: v.string(),
  }).index("by_parent", ["parentId"]),

  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  staff: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    contactNo: v.string(),
    message: v.string(),
    createdAt: v.number(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("archived")
    ),

  }).index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),


  // GRADES COMPONENTS


  grades: defineTable({
    studentId: v.id("students"),
    subject: v.string(),
    score: v.number(),
    term: v.string(), // e.g. "Term 1"
    createdAt: v.number(),
  }).index("by_student", ["studentId"]),

  subjects: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  subjectComponents: defineTable({
    subjectId: v.id("subjects"),
    name: v.string(),
    weight: v.number(),
  }).index("by_subject", ["subjectId"]),

  componentGrades: defineTable({
    studentId: v.id("students"),
    subjectId: v.id("subjects"),
    componentId: v.id("subjectComponents"),
    score: v.number(),          // 0–100
  }).index("by_student_subject", ["studentId", "subjectId"]),




  registrations: defineTable({
    // Student
    studentFirstName: v.string(),
    studentLastName: v.string(),
    middleName: v.optional(v.string()),
    dateOfBirth: v.string(),
    gender: v.optional(v.string()),
    programType: v.string(),
    startDate: v.string(),
    medicalInfo: v.optional(v.string()),

    // Parent
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

    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),

    createdAt: v.number(),
  }).index("by_status", ["status"]),

});


