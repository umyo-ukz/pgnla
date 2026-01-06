import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const attachDocument = mutation({
  args: {
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
    documentType: v.string(),
    fileId: v.id("_storage"),
    originalFilename: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) throw new Error("Unauthorized");

    // Look up user by email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("documents", {
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      documentType: args.documentType,
      fileId: args.fileId,
      originalFilename: args.originalFilename,
      uploadedBy: user._id,
      uploadedAt: Date.now(),
    });
  },
});
