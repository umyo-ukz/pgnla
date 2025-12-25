import { mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const signInParent = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const parent = await ctx.db.query("parents").withIndex("by_email", (q) => q.eq("email", args.email)).first();
    if (!parent) throw new Error("Invalid credentials");
    if (!parent.isActive) throw new Error("Account inactive");

    const ok = bcrypt.compareSync(args.password, parent.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    // Successful sign-in; return minimal parent info.
    return { id: parent._id, email: parent.email, fullName: parent.fullName };
  },
});
