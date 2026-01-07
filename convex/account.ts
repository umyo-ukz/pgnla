import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const changeParentPassword = mutation({
  args: {
    parentId: v.id("parents"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { parentId, currentPassword, newPassword }) => {
    const parent = await ctx.db.get(parentId);
    if (!parent) throw new Error("Parent not found");

    const valid = bcrypt.compareSync(currentPassword, parent.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");

    const newHash = bcrypt.hashSync(newPassword, 10);

    await ctx.db.patch(parentId, {
      passwordHash: newHash,
    });
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { userId, currentPassword, newPassword }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const valid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");

    const newHash = bcrypt.hashSync(newPassword, 10);

    await ctx.db.patch(userId, {
      passwordHash: newHash,
    });
  },
});