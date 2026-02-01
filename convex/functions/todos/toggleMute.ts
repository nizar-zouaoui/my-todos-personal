import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { hasAccess } from "./access";

export const toggleMute = mutation({
  args: {
    id: v.id("todos"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allowed = await hasAccess(ctx, args.id, args.userId);
    if (!allowed) throw new Error("Unauthorized");

    const todo = await ctx.db.get(args.id);
    if (!todo) return null;

    const nextMuted = !todo.isMuted;
    await ctx.db.patch(args.id, { isMuted: nextMuted });
    return await ctx.db.get(args.id);
  },
});
