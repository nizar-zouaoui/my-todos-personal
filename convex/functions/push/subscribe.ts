import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const subscribe = mutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new Error("Unauthenticated call to subscribe");
    }
    if (!args.endpoint || !args.keys?.p256dh || !args.keys?.auth) {
      throw new Error("Invalid subscription payload");
    }
    const existing = await ctx.db
      .query("pushSubscriptions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("endpoint"), args.endpoint),
        ),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { keys: args.keys });
      return existing._id;
    }

    const id = await ctx.db.insert("pushSubscriptions", {
      userId: args.userId,
      endpoint: args.endpoint,
      keys: args.keys,
    });
    return id;
  },
});
