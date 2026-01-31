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
  const userId = payload.userId;

  if (req.method === "GET") {
    const todos = await listTodosForUser(userId);
    return res.json({ todos });
  }

  if (req.method === "POST") {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });
    type CreateTodoInput = Parameters<typeof createTodo>[0];
    const todoPayload: CreateTodoInput = {
      title,
      description,
      userId,
      completedAt: req.body.completedAt ?? undefined,
      expiresAt: req.body.expiresAt ?? undefined,
    };
    const todo = await createTodo(todoPayload);
    return res.json({ todo });
  }

  return res.status(405).end();
}
