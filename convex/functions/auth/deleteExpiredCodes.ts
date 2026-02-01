import { internalMutation } from "../../_generated/server";

export const deleteExpiredCodes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("authCodes")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect();

    await Promise.all(expired.map((code) => ctx.db.delete(code._id)));
    console.log(`Cleaned up ${expired.length} expired codes`);
    return { deleted: expired.length };
  },
});
