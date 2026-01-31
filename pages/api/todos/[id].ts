import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { deleteTodo, getTodo, updateTodo } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  const { id } = req.query as { id: string };
  const userId = payload.userId;

  if (req.method === "GET") {
    const t = await getTodo(id, userId);
    if (!t || t.userId !== userId)
      return res.status(404).json({ error: "not found" });
    return res.json({ todo: t });
  }

  if (req.method === "PUT") {
    const patch = req.body;
    const t = await getTodo(id, userId);
    if (!t || t.userId !== userId)
      return res.status(404).json({ error: "not found" });
    const updated = await updateTodo(id, patch, userId);
    return res.json({ todo: updated });
  }

  if (req.method === "DELETE") {
    const t = await getTodo(id, userId);
    if (!t || t.userId !== userId)
      return res.status(404).json({ error: "not found" });
    const ok = await deleteTodo(id, userId);
    return res.json({ ok });
  }

  return res.status(405).end();
}
