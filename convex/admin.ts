import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";



const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};



export const listParents = query({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .filter(q => q.eq(q.field("role"), "parent"))
      .collect();
  },
});

export const listStaff = query({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .filter(q => q.eq(q.field("role"), "staff"))
      .collect();
  },
});

export const toggleUserStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: args.status,
    });
  },
});


export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("parent"), v.literal("staff"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(args.userId, { role: args.newRole });
    return args.userId;
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    await ctx.db.delete(args.userId);
    return args.userId;
  },
});

export const createStaffAccount = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.string(),
    position: v.optional(v.string()),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) throw new Error("Email already exists");

    // Create the staff account
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: await hashPassword(args.password),
      fullName: args.fullName,
      role: "staff",
      isActive: true,
    });

    return userId;
  },
});

// Add these to your existing admin.ts file

// Get detailed parent information
export const getParentDetails = query({
  args: { parentId: v.id("users") },
  handler: async (ctx, args) => {
    const parent = await ctx.db.get(args.parentId);
    if (!parent || parent.role !== "parent") return null;
    
    return parent;
  },
});










export const getParentStudents = query({
  args: { parentId: v.id("users") },
  handler: async (ctx, args) => {
    const students = await ctx.db
      .query("students")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
    
    return students;
  },
});

// Assign student to parent
export const assignStudentToParent = mutation({
  args: {
    parentId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    // Verify parent exists and is actually a parent
    const parent = await ctx.db.get(args.parentId);
    if (!parent || parent.role !== "parent") {
      throw new Error("Invalid parent account");
    }
    
    // Verify student exists
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Assign student to parent
    await ctx.db.patch(args.studentId, {
      parentId: args.parentId,
    });
    
    return args.studentId;
  },
});

// Unassign student from parent
export const unassignStudentFromParent = mutation({
  args: {
    parentId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    // Verify student exists and belongs to this parent
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }
    
    if (student.parentId !== args.parentId) {
      throw new Error("Student does not belong to this parent");
    }
    
    // Remove parent assignment
    await ctx.db.patch(args.studentId, {
      parentId: undefined,
    });
    
    return args.studentId;
  },
});

export const getDashboardStats = query({
  handler: async (ctx) => {
    // Get total users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive).length;
    
    // Get new users this month (users created in current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = allUsers.filter(user => {
      const creationDate = new Date(user._creationTime);
      return creationDate.getMonth() === currentMonth && 
             creationDate.getFullYear() === currentYear;
    }).length;
    
    // Get pending registrations
    const pendingRegistrations = await ctx.db
      .query("studentApplications")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();
    
    // Get unread messages
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .collect();
    
    // Get total students
    const totalStudents = await ctx.db.query("students").collect();
    const activeStudents = totalStudents.length; // Assuming all are active
    
    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      pendingRegistrations: pendingRegistrations.length,
      unreadMessages: unreadMessages.length,
      totalStudents: totalStudents.length,
      activeStudents,
    };
  },
});

// Get recent registrations
export const getRecentRegistrations = query({
  handler: async (ctx) => {
    const registrations = await ctx.db
      .query("studentApplications")
      .order("desc")
      .take(10);
    
    return registrations;
  },
});

// Get recent messages
export const getRecentMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_createdAt", (q) => q.gt("createdAt", 0))
      .order("desc")
      .take(10);
    
    return messages;
  },
});

// Get student by ID with parent info
export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    return student;
  },
});

// Get parent by student ID
export const getParentByStudentId = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student || !student.parentId) return null;
    
    const parent = await ctx.db.get(student.parentId);
    return parent;
  },
});

// Update student information
export const updateStudent = mutation({
  args: {
    studentId: v.id("students"),
    fullName: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    studentNumber: v.optional(v.string()),  // Changed from studentId
    dateOfBirth: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { studentId, ...updates } = args;
    
    await ctx.db.patch(studentId, updates);
    return studentId;
  },
});


// Delete student
export const deleteStudent = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    // Delete all related data first
    const grades = await ctx.db
      .query("grades")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
    
    // Delete component grades
    const componentGrades = await ctx.db
      .query("componentGrades")
      .withIndex("by_student_classSubject", (q) => 
        q.eq("studentId", args.studentId)
      )
      .collect();
    
    // Delete all associated records
    for (const grade of grades) {
      await ctx.db.delete(grade._id);
    }
    
    for (const compGrade of componentGrades) {
      await ctx.db.delete(compGrade._id);
    }
    
    // Finally delete the student
    await ctx.db.delete(args.studentId);
    return args.studentId;
  },
});

// Get available grade levels (you might want to store this in a separate table)
export const getGradeLevels = query({
  handler: async (_ctx) => {
    // This could come from a configuration table
    return [
      "Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade",
      "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade",
      "9th Grade", "10th Grade", "11th Grade", "12th Grade"
    ];
  },
});

// Calculate overall grade percentage for a student
export const getStudentOverallGrade = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    // Get all component grades for this student
    const componentGrades = await ctx.db
      .query("componentGrades")
      .withIndex("by_student_classSubject", q => q.eq("studentId", args.studentId))
      .collect();

    if (componentGrades.length === 0) {
      return null; // No grades yet
    }

    // Group grades by class subject
    const subjectGrades: Record<string, {
      totalEarned: number;
      totalPossible: number;
    }> = {};

    await Promise.all(
      componentGrades.map(async (grade) => {
        const classSubject = await ctx.db.get(grade.classSubjectId);
        if (!classSubject) return;

        const component = await ctx.db.get(grade.componentId);
        if (!component) return;

        const key = grade.classSubjectId;
        if (!subjectGrades[key]) {
          subjectGrades[key] = { totalEarned: 0, totalPossible: 0 };
        }

        subjectGrades[key].totalEarned += Math.min(grade.score, component.weight);
        subjectGrades[key].totalPossible += component.weight;
      })
    );

    // Calculate overall average across all subjects
    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;

    Object.values(subjectGrades).forEach(({ totalEarned, totalPossible }) => {
      totalEarnedPoints += totalEarned;
      totalPossiblePoints += totalPossible;
    });

    const overallPercentage = totalPossiblePoints > 0
      ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
      : 0;

    return overallPercentage;
  },
});

// Get student application by student ID (matching by name)
export const getStudentApplicationByStudentId = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;

    // Find application by matching full name
    const [firstName, ...lastNameParts] = student.fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    const applications = await ctx.db
      .query("studentApplications")
      .filter(q =>
        q.and(
          q.eq(q.field("studentFirstName"), firstName),
          q.eq(q.field("studentLastName"), lastName)
        )
      )
      .collect();

    // Return the first matching application (assuming one per student)
    return applications[0] || null;
  },
});

// List all students with parent information and overall grades
export const listAllStudents = query({
  handler: async (ctx): Promise<Array<{
    _id: string;
    _creationTime: number;
    parentId?: string;
    fullName: string;
    gradeLevel: string;
    letterGrade?: string;
    parent: {
      _id: string;
      fullName: string;
      email: string;
    } | null;
    overall: number | null;
  }>> => {
    const students = await ctx.db.query("students").collect();

    // Get parent information and overall grades for each student
    const studentsWithParents: Array<{
      _id: string;
      _creationTime: number;
      parentId?: string;
      fullName: string;
      gradeLevel: string;
      letterGrade?: string;
      parent: {
        _id: string;
        fullName: string;
        email: string;
      } | null;
      overall: number | null;
    }> = await Promise.all(
      students.map(async (student) => {
        let parent = null;
        if (student.parentId) {
          parent = await ctx.db.get(student.parentId);
        }

        // Calculate overall grade percentage
        const overallGrade: number | null = await ctx.runQuery(api.admin.getStudentOverallGrade, {
          studentId: student._id,
        });

        return {
          ...student,
          parent: parent ? {
            _id: parent._id,
            fullName: parent.fullName,
            email: parent.email,
          } : null,
          overall: overallGrade,
        };
      })
    );

    return studentsWithParents;
  },
});
