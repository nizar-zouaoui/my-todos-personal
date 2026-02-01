import type { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import { verifyToken } from "../../../lib/jwt";
import {
  deletePushSubscription,
  listPushSubscriptions,
} from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const subject =
    process.env.VAPID_SUBJECT || "mailto:hello@mytodospersonal.app";

  if (!privateKey || !publicKey) {
    return res.status(500).json({ error: "Missing VAPID keys" });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const subs = await listPushSubscriptions(payload.userId);
  if (!subs.length) {
    return res.status(404).json({ error: "no subscriptions" });
  }

  const payloadBody = JSON.stringify({
    title: "Hello World",
    body: "This is a test notification.",
    url: "/todos",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payloadBody,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410) {
          await deletePushSubscription(String(sub._id));
        } else {
          console.error("Test push failed", err);
        }
      }
    }),
  );

  return res.json({ ok: true, sent: subs.length });
}
