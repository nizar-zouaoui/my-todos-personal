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
    const todoElement: {
      title: string;
      createdAt: string;
      userId: string;
      description?: string;
      expiresAt?: string;
      completedAt?: string;
    } = {
      title: args.title,
      createdAt: now,
      userId: args.userId,
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
