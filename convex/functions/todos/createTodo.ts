import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createTodo = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const todoElement = {
      title: args.title,
      createdAt: now,
      userId: args.userId,
    } as {
      title: string;
      createdAt: string;
      userId: typeof args.userId;
      description?: string;
      expiresAt?: string;
      completedAt?: string;
    };
    if (args.description) {
      todoElement.description = args.description;
    }
    if (args.expiresAt) {
      todoElement.expiresAt = args.expiresAt;
    }
    if (args.completedAt) {
      todoElement.completedAt = args.completedAt;
    }
    const id = await ctx.db.insert("todos", todoElement);
    return await ctx.db.get("todos", id);
  },
});
