import { v } from "convex/values";
import { query } from "../../_generated/server";

export const listTodosForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const owned = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const collaboratorRows = await ctx.db
      .query("taskCollaborators")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const shared = await Promise.all(
      collaboratorRows.map((row) => ctx.db.get(row.taskId)),
    );

    const merged = new Map(
      [...owned, ...shared.filter(Boolean)].map((todo) => [todo._id, todo]),
    );

    return Array.from(merged.values()).sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  },
});
