import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const unsubscribe = mutation({
  args: {
    userId: v.string(),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("endpoint"), args.endpoint),
        ),
      )
      .collect();

    await Promise.all(existing.map((sub) => ctx.db.delete(sub._id)));
    return { removed: existing.length };
  },
});
