import type { NextApiRequest, NextApiResponse } from "next";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import {
  consumeAuthCode,
  findOrCreateUser,
  storeRefreshToken,
} from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ error: "email and code required" });

  const ok = await consumeAuthCode(email, code);
  if (!ok) return res.status(400).json({ error: "invalid or expired code" });

  const user = await findOrCreateUser(email);
  const userId =
    typeof user === "object" && user !== null && "id" in user
      ? String((user as { id: unknown }).id)
      : typeof user === "object" && user !== null && "_id" in user
        ? String((user as { _id: unknown })._id)
        : null;
  if (!userId)
    return res.status(500).json({ error: "failed to resolve user id" });

  const accessToken = signAccessToken({ userId });
  const refreshToken = signRefreshToken({ userId });

  // Store refresh token server-side for revocation (in-memory or Convex)
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
  await storeRefreshToken(refreshToken, userId, expiresAt);

  // Set cookies
  res.setHeader("Set-Cookie", [
    `token=${accessToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`,
    `refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`,
  ]);

  return res.json({ ok: true, user });
}
