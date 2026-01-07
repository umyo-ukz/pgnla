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
    overall: v.optional(v.number()),
    letterGrade: v.optional(v.string()),
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

  terms: defineTable({
    name: v.string(), // "Term 1"
    startDate: v.string(),
    endDate: v.string(),
    isActive: v.boolean(),
  }),

 classSubjects: defineTable({
  subjectId: v.id("subjects"),
  gradeLevel: v.string(),
  termId: v.id("terms"),
  weight: v.number(),
}).index("by_grade_term", ["gradeLevel", "termId"]),



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
    classSubjectId: v.id("classSubjects"),
    name: v.string(),
    weight: v.number(),
  }).index("by_classSubject", ["classSubjectId"]),

  componentGrades: defineTable({
    studentId: v.id("students"),
    classSubjectId: v.id("classSubjects"),
    componentId: v.id("subjectComponents"),
    score: v.number(),
  })
    .index("by_student_classSubject", ["studentId", "classSubjectId"])
    .index("by_component", ["componentId"]),


    
staffApplications: defineTable({
  userId: v.id("users"),
  position: v.string(),
  status: v.union(
    v.literal("draft"),
    v.literal("submitted"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  submittedAt: v.optional(v.number()),
}),

documents: defineTable({
  ownerType: v.union(
    v.literal("studentApplication"),
    v.literal("staffApplication"),
    v.literal("event")
  ),

  ownerId: v.union(
    v.id("studentApplications"),
    v.id("staffApplications"),
    v.id("events")
  ),

  documentType: v.string(), // validated in backend
  fileId: v.id("_storage"),
  originalFilename: v.string(),

  uploadedBy: v.id("users"),
  uploadedAt: v.number(),
})
.index("by_owner", ["ownerType", "ownerId"]),

events: defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
}),




studentApplications: defineTable({
  /* =====================
     STUDENT INFORMATION
     ===================== */
  studentFirstName: v.string(),
  studentLastName: v.string(),
  middleName: v.optional(v.string()),
  dateOfBirth: v.string(),
  gender: v.optional(v.string()),

  programType: v.string(),        // e.g. Preschool, Primary, Secondary
  intendedGradeLevel: v.optional(v.string()),
  startDate: v.string(),

  medicalInfo: v.optional(v.string()),

  /* =====================
     PARENT / GUARDIAN
     ===================== */
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

  /* =====================
     APPLICATION METADATA
     ===================== */
  submittedBy: v.optional(v.id("users")),   // parent account (optional for public registrations)
  termId: v.optional(v.id("terms")), // intake term (Fall 2026, etc.)

  status: v.union(
    v.literal("draft"),
    v.literal("submitted"),
    v.literal("under_review"),
    v.literal("approved"),
    v.literal("rejected")
  ),

  reviewedBy: v.optional(v.id("users")), // staff/admin
  reviewedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_status", ["status"])
  .index("by_parent", ["submittedBy"])
  .index("by_term", ["termId"]),


});


userActivity: defineTable({
  userId: v.id("users"),
  type: v.string(), // "login", "logout", "profile_update", "status_change", etc.
  description: v.string(),
  timestamp: v.number(),
  ipAddress: v.optional(v.string()),
})
.index("by_user", ["userId"])


