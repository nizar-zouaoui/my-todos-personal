import { v } from "convex/values";
import { query } from "../../_generated/server";
import { hasAccess } from "./access";

export const getTask = query({
  args: { todoId: v.id("todos"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const allowed = await hasAccess(ctx, args.todoId, args.userId);
    if (!allowed) return null;
    return await ctx.db.get(args.todoId);
  },
});
