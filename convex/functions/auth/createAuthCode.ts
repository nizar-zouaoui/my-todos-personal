import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createAuthCode = mutation({
  args: { email: v.string(), code: v.string(), expiresAt: v.number() },
  handler: async (ctx, args) => {
    console.log("first");
    return await ctx.db.insert("authCodes", {
      email: args.email,
      code: args.code,
      expiresAt: args.expiresAt,
    });
  },
});
