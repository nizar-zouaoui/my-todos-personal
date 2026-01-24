import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const consumeAuthCode = mutation({
  args: { email: v.string(), code: v.string(), now: v.number() },
  handler: async (ctx, args) => {
    const q = await ctx.db
      .query("authCodes")
      .filter((q) =>
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("code"), args.code),
        ),
      )
      .first();
    if (!q || q.expiresAt < args.now) return false;
    await ctx.db.delete("authCodes", q._id);
    return true;
  },
});
