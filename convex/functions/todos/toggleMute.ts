import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const toggleMute = mutation({
  args: {
    id: v.id("todos"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db
      .query("todos")
      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), args.id),
          q.eq(q.field("userId"), args.userId),
        ),
      )
      .first();
    if (!todo) return null;

    const nextMuted = !todo.isMuted;
    await ctx.db.patch(args.id, { isMuted: nextMuted });
    return await ctx.db.get(args.id);
  },
});
