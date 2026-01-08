// convex/parentNotices.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getForParent = query({
  args: {
    parentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all parent notices for this parent
    const parentNotices = await ctx.db
      .query("parentNotices")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
    
    return parentNotices;
  },
});

export const markAsRead = mutation({
  args: {
    parentId: v.id("users"),
    noticeId: v.id("notices"),
  },
  handler: async (ctx, args) => {
    // Find existing parent notice record
    const existing = await ctx.db
      .query("parentNotices")
      .withIndex("by_parent_notice", (q) => 
        q.eq("parentId", args.parentId).eq("noticeId", args.noticeId)
      )
      .first();
    
    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        hasRead: true,
        readAt: Date.now(),
      });
    } else {
      // Create new record
      await ctx.db.insert("parentNotices", {
        parentId: args.parentId,
        noticeId: args.noticeId,
        hasRead: true,
        readAt: Date.now(),
      });
    }
    
    return true;
  },
});