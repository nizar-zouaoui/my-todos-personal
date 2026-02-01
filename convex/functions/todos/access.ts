import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export const hasAccess = async (
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"todos">,
  userId: Id<"users">,
) => {
  const todo = await ctx.db.get(taskId);
  if (!todo) return false;
  if (todo.userId === userId) return true;

  const collaborator = await ctx.db
    .query("taskCollaborators")
    .withIndex("by_pair", (q) => q.eq("taskId", taskId).eq("userId", userId))
    .first();

  return Boolean(collaborator);
};
