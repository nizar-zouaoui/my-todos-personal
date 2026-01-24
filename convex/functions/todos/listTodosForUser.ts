import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listTodosForUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = (ctx as any).auth?.userId ?? args.userId;
    if (!userId) return [];
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});
