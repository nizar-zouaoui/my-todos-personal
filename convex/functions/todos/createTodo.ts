import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const todoElement = {
      title: args.title,
      createdAt: now,
      userId: args.userId,
    };
    if (args.description) {
      (todoElement as any).description = args.description;
    }
    if (args.expiresAt) {
      (todoElement as any).expiresAt = args.expiresAt;
    }
    if (args.completedAt) {
      (todoElement as any).completedAt = args.completedAt;
    }
    return await ctx.db.insert("todos", todoElement);
  },
});
