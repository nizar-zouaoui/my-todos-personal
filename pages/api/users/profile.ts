import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../../lib/jwt";
import { getUserById, updateUserProfile } from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = req.cookies.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: "unauthenticated" });

  if (req.method === "GET") {
    const user = await getUserById(payload.userId);
    if (!user) return res.status(404).json({ error: "not found" });
    return res.json({ user });
  }

  if (req.method === "PUT") {
    const { firstName, lastName, username, avatarUrl, birthday } =
      req.body || {};
    try {
      const user = await updateUserProfile(payload.userId, {
        firstName,
        lastName,
        username,
        avatarUrl,
        birthday: typeof birthday === "number" ? birthday : undefined,
      });
      return res.json({ user });
    } catch (e) {
      const message = (e as Error)?.message || "failed to update profile";
      return res.status(400).json({ error: message });
    }
  }

  return res.status(405).end();
}
