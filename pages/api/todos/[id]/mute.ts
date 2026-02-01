import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../../lib/jwt";
import { toggleMute } from "../../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const id = req.query.id as string | undefined;
  if (!id) return res.status(400).json({ error: "missing id" });

  const todo = await toggleMute(id, payload.userId);
  if (!todo) return res.status(404).json({ error: "not found" });

  return res.json({ todo });
}
