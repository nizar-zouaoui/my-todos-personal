import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { createTodo, listTodosForUser } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });
  const userId = (payload as any).userId;

  if (req.method === "GET") {
    const todos = await listTodosForUser(userId);
    return res.json({ todos });
  }

  if (req.method === "POST") {
    const { title, description, expires_at } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    const todo = await createTodo({
      title,
      description,
      expires_at: expires_at || null,
      completed_at: null,
      user_id: userId,
    });
    return res.json({ todo });
  }

  return res.status(405).end();
}
