import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { listTodosForUser } from "../../../lib/storage";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });
  const userId = payload.userId;

  const todos = await listTodosForUser(userId);
  const now = Date.now();
  const notifications = todos.filter((t) => {
    if (t.completedAt || !t.expiresAt) return false;
    const expiresAt = new Date(t.expiresAt).getTime();
    const diff = expiresAt - now;
    return diff >= 0 && diff <= TWO_DAYS_MS;
  });

  return res.json({ todos: notifications });
}
