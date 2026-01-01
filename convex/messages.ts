import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const submitMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    contactNo: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      name: args.name,
      email: args.email,
      contactNo: args.contactNo,
      message: args.message,
      status: "new",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, { status }) => {
    return ctx.db
      .query("messages")
      .withIndex("by_status", q => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, { messageId, status }) => {
    await ctx.db.patch(messageId, { status });
  },
});