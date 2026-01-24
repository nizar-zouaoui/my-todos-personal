import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const storeRefreshToken = mutation({
  args: { token: v.string(), userId: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("refreshTokens", {
      token: args.token,
      userId: args.userId,
      expiresAt: args.expiresAt,
    });
  },
});
