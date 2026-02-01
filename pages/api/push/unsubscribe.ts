import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { unsubscribePush } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const { endpoint } = req.body || {};
  if (!endpoint) return res.status(400).json({ error: "missing endpoint" });

  await unsubscribePush(payload.userId, endpoint);
  return res.json({ ok: true });
}
