import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { upsertPushSubscription } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const { endpoint, keys } = req.body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "invalid subscription" });
  }

  await upsertPushSubscription({
    userId: payload.userId,
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
  });

  return res.json({ ok: true });
}
