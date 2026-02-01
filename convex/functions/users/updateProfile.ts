import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    birthday: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    if (args.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();
      if (existing && existing._id !== user._id) {
        throw new Error("Username is already taken.");
      }
    }

    await ctx.db.patch(user._id, {
      firstName: args.firstName,
      lastName: args.lastName,
      username: args.username,
      avatarUrl: args.avatarUrl,
      birthday: args.birthday,
    });

    return await ctx.db.get(user._id);
  },
});
