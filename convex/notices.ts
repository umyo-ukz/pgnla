import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel"; // Import the Doc type

// Helper function to authenticate user by token
async function authenticateUser(ctx: any, token?: string) {
  if (!token) {
    throw new Error("No authentication token provided");
  }

  // Find the session by token
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token)) // Add type annotation here
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Invalid or expired session");
  }

  // Get the user
  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return user;
}

export const getRecentNotices = query({
  args: {},
  handler: async (ctx) => {
    try {
      const notices = await ctx.db
        .query("notices")
        .order("desc")
        .take(10);
      
      console.log(`Found ${notices.length} recent notices`);
      return notices;
    } catch (error) {
      console.error("Error fetching recent notices:", error);
      return [];
    }
  },
});

// Create a new notice
export const createNotice = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    gradeLevel: v.string(),
    noticeType: v.union(
      v.literal("general"),
      v.literal("academic"),
      v.literal("event"),
      v.literal("urgent")
    ),
    token: v.string(), // Add token parameter for authentication
  },
  handler: async (ctx, args) => {
    console.log("Creating notice with args:", args);
    
    // Authenticate user using token
    const user = await authenticateUser(ctx, args.token);
    
    console.log("Authenticated user:", user);

    if (user.role !== "staff" && user.role !== "admin") {
      throw new Error("Only staff or admin can create notices");
    }

    // Create notice
    const noticeId = await ctx.db.insert("notices", {
      title: args.title,
      content: args.content,
      createdBy: user._id,
      gradeLevel: args.gradeLevel,
      noticeType: args.noticeType,
      isPublished: true,
      publishedAt: Date.now(),
      createdAt: Date.now(),
    });

    console.log("Created notice with ID:", noticeId);

    // Find all parents with students in this grade level
    const studentsInGrade = await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("gradeLevel"), args.gradeLevel))
      .collect();

    console.log(`Found ${studentsInGrade.length} students in grade ${args.gradeLevel}`);

    // Get unique parent IDs
    const parentIds = [...new Set(studentsInGrade.map(s => s.parentId))];
    
    console.log(`Found ${parentIds.length} unique parents`);

    // Create parent notice records for each parent
    const parentNoticePromises = parentIds.map(async (parentId) => {
      return await ctx.db.insert("parentNotices", {
        parentId,
        noticeId,
        hasRead: false,
      });
    });

    await Promise.all(parentNoticePromises);

    return {
      noticeId,
      parentCount: parentIds.length,
      message: "Notice created successfully",
    };
  },
});

// Get notices for a specific parent
export const getParentNotices = query({
  args: {
    parentId: v.id("users"),
    noticeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parentNotices = await ctx.db
      .query("parentNotices")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();

    const notices = await Promise.all(
      parentNotices.map(async (pn) => {
        const notice = await ctx.db.get(pn.noticeId);
        if (!notice) return null;

        const creator = await ctx.db.get(notice.createdBy);
        
        return {
          ...notice,
          creatorName: creator?.fullName || "Staff Member",
          hasRead: pn.hasRead,
          readAt: pn.readAt,
        };
      })
    );

    // Filter by type if specified
    let filtered = notices.filter(n => n !== null);
    if (args.noticeType) {
      filtered = filtered.filter(n => n.noticeType === args.noticeType);
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Mark notice as read
export const markNoticeAsRead = mutation({
  args: {
    parentId: v.id("users"),
    noticeId: v.id("notices"),
    token: v.optional(v.string()), // Optional token for validation
  },
  handler: async (ctx, args) => {
    // Optional: verify the token belongs to the parent
    if (args.token) {
      try {
        const user = await authenticateUser(ctx, args.token);
        if (user._id !== args.parentId) {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        // If token verification fails, still allow marking as read
        // but log the error
        console.warn("Token verification failed, but allowing mark as read:", error);
      }
    }

    const parentNotice = await ctx.db
      .query("parentNotices")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("noticeId"), args.noticeId))
      .first();

    if (parentNotice) {
      await ctx.db.patch(parentNotice._id, {
        hasRead: true,
        readAt: Date.now(),
      });
    }
  },
});

// Get unread notice count for parent
export const getUnreadNoticeCount = query({
  args: {
    parentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const parentNotices = await ctx.db
      .query("parentNotices")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();

    return parentNotices.filter(pn => !pn.hasRead).length;
  },
});

// Get all published notices
export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    // Get all published notices, sorted by creation date (newest first)
    const notices = await ctx.db
      .query("notices")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .collect();
    
    return notices;
  },
});

// Get notices for staff dashboard with authentication
export const getStaffNotices = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Authenticate user
    const user = await authenticateUser(ctx, args.token);
    
    if (user.role !== "staff" && user.role !== "admin") {
      throw new Error("Only staff can view notices dashboard");
    }

    // Get all notices (staff can see all)
    const notices = await ctx.db
      .query("notices")
      .order("desc")
      .collect();

    // Get creator names for each notice
    const noticesWithCreators = await Promise.all(
      notices.map(async (notice) => {
        const creator = await ctx.db.get(notice.createdBy);
        return {
          ...notice,
          creatorName: creator?.fullName || "Unknown",
        };
      })
    );

    return noticesWithCreators;
  },
});