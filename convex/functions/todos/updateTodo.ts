import { v } from "convex/values";
import { api } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { hasAccess } from "./access";

export const updateTodo = mutation({
  args: {
    id: v.id("todos"),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      expiresAt: v.optional(v.string()),
      completedAt: v.optional(v.string()),
    }),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Task not found");

    const allowed = await hasAccess(ctx, args.id, args.userId);
    if (!allowed) throw new Error("Unauthorized");

    const patch: typeof args.patch & { completedBy?: typeof args.userId } = {
      ...args.patch,
    };

    if (Object.prototype.hasOwnProperty.call(args.patch, "completedAt")) {
      patch.completedBy = args.patch.completedAt ? args.userId : undefined;
    }

    const completedChange =
      Object.prototype.hasOwnProperty.call(args.patch, "completedAt") &&
      args.patch.completedAt &&
      args.patch.completedAt !== existing.completedAt;

    const criticalUpdate = ["title", "description", "expiresAt"].some(
      (key) =>
        Object.prototype.hasOwnProperty.call(args.patch, key) &&
        (args.patch as Record<string, unknown>)[key] !==
          (existing as Record<string, unknown>)[key],
    );

    await ctx.db.patch(args.id, patch);
    const updated = await ctx.db.get(args.id);

    if ((completedChange || criticalUpdate) && updated) {
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

      const title = completedChange ? "Task completed" : "Task updated";
      const body = completedChange
        ? `${actorName} completed '${updated.title}'`
        : `${actorName} updated '${updated.title}'`;

      await Promise.all(
        targets.map((userId) =>
          ctx.scheduler.runAfter(0, api.functions.push.send.send, {
            userId: String(userId),
            title,
            body,
            url: `/todos/task/${String(updated._id)}`,
          }),
        ),
      );
    }

    return updated;
  },
});
