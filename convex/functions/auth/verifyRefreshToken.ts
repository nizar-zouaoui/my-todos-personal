import { v } from "convex/values";
import { query } from "../../_generated/server";

export const verifyRefreshToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const rec = await ctx.db
      .query("refreshTokens")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();
    if (!rec) return null;
    if (rec.expiresAt < Date.now()) return null;
    return rec.userId;
  },
});
