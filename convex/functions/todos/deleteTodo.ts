import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const deleteTodo = mutation({
  args: { id: v.id("todos"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) return null;

    if (todo.userId === args.userId) {
      const collaborators = await ctx.db
        .query("taskCollaborators")
        .withIndex("by_task", (q) => q.eq("taskId", args.id))
        .collect();
      await Promise.all(collaborators.map((row) => ctx.db.delete(row._id)));
      return await ctx.db.delete(args.id);
    }

    const row = await ctx.db
      .query("taskCollaborators")
      .withIndex("by_pair", (q) =>
        q.eq("taskId", args.id).eq("userId", args.userId),
      )
      .first();

    if (row) {
      await ctx.db.delete(row._id);
      return { left: true };
    }

    throw new Error("Unauthorized");
  },
});
