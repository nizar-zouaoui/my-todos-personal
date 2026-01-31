import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const findOrCreateUser = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((u) => u.eq(u.field("email"), args.email))
      .first();
    if (existing) return existing;
    const id = await ctx.db.insert("users", { email: args.email });
    return await ctx.db.get(id);
  },
});
