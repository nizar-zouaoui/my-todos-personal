import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listDueTodos = query({
  args: {
    nowIso: v.string(),
    windowIso: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.neq(q.field("expiresAt"), undefined),
          q.eq(q.field("completedAt"), undefined),
          q.neq(q.field("isNotified"), true),
          q.gte(q.field("expiresAt"), args.nowIso),
          q.lte(q.field("expiresAt"), args.windowIso),
        ),
      )
      .collect();
  },
});
