import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("todos", {
      title: args.title,
      description: args.description ?? null,
      createdAt: now,
      expiresAt: args.expiresAt ?? null,
      completedAt: null,
      userId: args.userId,
    });
  },
});
