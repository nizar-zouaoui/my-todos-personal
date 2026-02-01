import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";

export const listCollaborators = query({
  args: { taskId: v.id("todos") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("taskCollaborators")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    const users = await Promise.all(rows.map((row) => ctx.db.get(row.userId)));
    return users.filter(Boolean);
  },
});

export const addCollaborator = mutation({
  args: {
    taskId: v.id("todos"),
    friendId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    if (task.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const friendEdge = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("user1", args.userId).eq("user2", args.friendId),
      )
      .first();
    if (!friendEdge) throw new Error("Not friends");

    const existing = await ctx.db
      .query("taskCollaborators")
      .withIndex("by_pair", (q) =>
        q.eq("taskId", args.taskId).eq("userId", args.friendId),
      )
      .first();
    if (existing) return { ok: true };

    await ctx.db.insert("taskCollaborators", {
      taskId: args.taskId,
      userId: args.friendId,
    });

    return { ok: true };
  },
});

export const removeCollaborator = mutation({
  args: {
    taskId: v.id("todos"),
    friendId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found.");
    if (task.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const row = await ctx.db
      .query("taskCollaborators")
      .withIndex("by_pair", (q) =>
        q.eq("taskId", args.taskId).eq("userId", args.friendId),
      )
      .first();

    if (row) await ctx.db.delete(row._id);
    return { ok: true };
  },
});
