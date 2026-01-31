import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      expiresAt: v.optional(v.string()),
      completedAt: v.optional(v.string()),
    }),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const q = await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(q.eq(q.field("_id"), args.id), q.eq(q.field("userId"), userId)),
      )
      .first();
    if (!q) return null;
    await ctx.db.patch("todos", args.id, args.patch);
    return await ctx.db.get("todos", args.id);
  },
});
