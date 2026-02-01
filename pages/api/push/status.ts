import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { isPushSubscribed } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const endpoint =
    typeof req.query.endpoint === "string" ? req.query.endpoint : undefined;
  const subscribed = await isPushSubscribed(payload.userId, endpoint);

  return res.json({ subscribed });
}
