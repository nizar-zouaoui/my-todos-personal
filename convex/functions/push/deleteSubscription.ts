import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const deleteSubscription = mutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
