import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listTodosForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId;
    return await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});
