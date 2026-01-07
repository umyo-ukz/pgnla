import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";



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