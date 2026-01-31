import type { NextApiRequest, NextApiResponse } from "next";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../../lib/jwt";
import {
  storeRefreshToken,
  verifyRefreshTokenStored,
} from "../../../lib/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const refresh = req.cookies.refresh;
  if (!refresh) return res.status(401).json({ error: "missing refresh" });

  const payload = verifyToken(refresh);
  const userId = payload?.userId as string | undefined;
  if (!userId) return res.status(401).json({ error: "invalid refresh" });

  const storedUserId = await verifyRefreshTokenStored(refresh);
  if (!storedUserId || storedUserId !== userId) {
    return res.status(401).json({ error: "refresh revoked" });
  }

  const accessToken = signAccessToken({ userId });
  const refreshToken = signRefreshToken({ userId });
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
  await storeRefreshToken(refreshToken, userId, expiresAt);

  res.setHeader("Set-Cookie", [
    `token=${accessToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`,
    `refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`,
  ]);

  return res.json({ ok: true });
}
