import { v } from "convex/values";
import { api } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { hasAccess } from "./access";

export const toggle = mutation({
  args: { id: v.id("todos"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) throw new Error("Task not found");

    const allowed = await hasAccess(ctx, args.id, args.userId);
    if (!allowed) throw new Error("Unauthorized");

    const completedAt = todo.completedAt ? undefined : new Date().toISOString();
    const completedBy = completedAt ? args.userId : undefined;

    await ctx.db.patch(args.id, { completedAt, completedBy });
    const updated = await ctx.db.get(args.id);

    if (completedAt && updated) {
      const actor = await ctx.db.get(args.userId);
      const actorName =
        `${actor?.firstName || ""} ${actor?.lastName || ""}`.trim() ||
        actor?.username ||
        "Someone";

      const collaborators = await ctx.db
        .query("taskCollaborators")
        .withIndex("by_task", (q) => q.eq("taskId", args.id))
        .collect();

      const targets = collaborators
        .map((row) => row.userId)
        .filter((id) => String(id) !== String(args.userId));

      await Promise.all(
        targets.map((userId) =>
          ctx.scheduler.runAfter(0, api.functions.push.send.send, {
            userId: String(userId),
            title: "Task completed",
            body: `${actorName} completed '${updated.title}'`,
            url: `/todos/task/${String(updated._id)}`,
          }),
        ),
      );
    }

    return updated;
  },
});
