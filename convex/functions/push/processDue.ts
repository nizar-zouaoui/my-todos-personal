"use node";
import webpush from "web-push";
import { api } from "../../_generated/api";
import { action } from "../../_generated/server";

export const processDue = action({
  args: {},
  handler: async (ctx) => {
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const subject =
      process.env.VAPID_SUBJECT || "mailto:hello@mytodospersonal.app";

    if (!privateKey || !publicKey) {
      throw new Error("Missing VAPID keys");
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);

    const now = new Date();
    const nowIso = now.toISOString();
    const windowIso = new Date(
      now.getTime() + 48 * 60 * 60 * 1000,
    ).toISOString();

    const dueTodos = await ctx.runQuery(
      api.functions.push.listDueTodos.listDueTodos,
      {
        nowIso,
        windowIso,
      },
    );

    for (const todo of dueTodos) {
      const subs = await ctx.runQuery(
        api.functions.push.listByUser.listByUser,
        {
          userId: todo.userId,
        },
      );
      if (subs.length === 0) continue;

      const payload = JSON.stringify({
        title: "Task Due Soon!",
        body: todo.title,
        url: `/todos/task/${String(todo._id)}`,
      });

      await Promise.all(
        subs.map(async (sub) => {
          try {
            const sendNotification = await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload,
            );
            console.log(sendNotification);
          } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number })?.statusCode;
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

      //   await ctx.runMutation(api.functions.push.markNotified.markNotified, {
      //     id: todo._id,
      //     userId: todo.userId,
      //   });
    }

    return { checked: dueTodos.length };
  },
});
