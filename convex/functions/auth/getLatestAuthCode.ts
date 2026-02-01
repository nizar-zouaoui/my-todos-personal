import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getLatestAuthCode = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("authCodes")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    if (list.length === 0) return null;
    const latest = list.reduce((acc, item) =>
      item.expiresAt > acc.expiresAt ? item : acc,
    );
    return { expiresAt: latest.expiresAt };
  },
});
