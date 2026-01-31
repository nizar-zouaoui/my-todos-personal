import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getTask = query({
  args: { todoId: v.id("todos"), userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const q = await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), args.todoId),
          q.eq(q.field("userId"), userId),
        ),
      )
      .first();
    if (!q) return null;
    return q;
  },
});
