import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const deleteTodo = mutation({
  args: { id: v.id("todos"), userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const q = await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(q.eq(q.field("_id"), args.id), q.eq(q.field("userId"), userId)),
      )
      .first();
    if (!q) return null;
    return await ctx.db.delete("todos", args.id);
  },
});
