import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});


import { v } from "convex/values";

export const attachDocument = mutation({
  args: {
    ownerType: v.string(),
    ownerId: v.string(),
    documentType: v.string(),
    fileId: v.id("_storage"),
    originalFilename: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    await ctx.db.insert("documents", {
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      documentType: args.documentType,
      fileId: args.fileId,
      originalFilename: args.originalFilename,
      uploadedBy: user.subject,
      uploadedAt: Date.now(),
    });
  },
});
