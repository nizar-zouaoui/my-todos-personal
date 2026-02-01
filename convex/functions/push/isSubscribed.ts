import { v } from "convex/values";
import { query } from "../../_generated/server";

export const isSubscribed = query({
  args: {
    userId: v.string(),
    endpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.endpoint) {
      const existing = await ctx.db
        .query("pushSubscriptions")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("endpoint"), args.endpoint),
          ),
        )
        .first();
      return Boolean(existing);
    }

    const any = await ctx.db
      .query("pushSubscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return Boolean(any);
  },
});
