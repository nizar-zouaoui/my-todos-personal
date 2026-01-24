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
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    console.log(userId);
    const todoPayload = { title, description, userId };
    if (req.body.completedAt) {
      (todoPayload as any).completedAt = req.body.completedAt;
    }
    if (req.body.expiresAt) {
      (todoPayload as any).expiresAt = req.body.expiresAt;
    }
    console.log(todoPayload);
    const todo = await createTodo(todoPayload);
    return res.json({ todo });
  }

  return res.status(405).end();
}
