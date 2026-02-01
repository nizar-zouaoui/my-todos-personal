"use node";
import { v } from "convex/values";
import webpush from "web-push";
import { api } from "../../_generated/api";
import { action } from "../../_generated/server";

export const send = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const subject =
      process.env.VAPID_SUBJECT || "mailto:hello@mytodospersonal.app";

    if (!privateKey || !publicKey) {
      throw new Error("Missing VAPID keys");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const subs = await ctx.runQuery(api.functions.push.listByUser.listByUser, {
      userId: args.userId,
    });

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/todos",
    });
    console.log("[push.send] payload:", payload);

    await Promise.all(
      subs.map(async (sub) => {
        console.log("[push.send] sending to:", sub.endpoint);
        try {
          const result = await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload,
          );
          console.log("[push.send] response:", {
            statusCode: result?.statusCode,
            headers: result?.headers,
            body: result?.body,
          });
        } catch (err: unknown) {
          console.error("[push.send] error:", err);
          const statusCode = (err as { statusCode?: number })?.statusCode;
          const headers = (err as { headers?: unknown })?.headers;
          const body = (err as { body?: unknown })?.body;
          console.error("[push.send] error details:", {
            statusCode,
            headers,
            body,
          });
          if (statusCode === 410) {
            await ctx.runMutation(
              api.functions.push.deleteSubscription.deleteSubscription,
              {
                id: sub._id,
              },
            );
          } else {
            console.error("Push send failed", err);
          }
        }
      }),
    );

    return { sent: subs.length };
  },
});
