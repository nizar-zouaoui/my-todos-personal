import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  res.setHeader("Set-Cookie", [
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
    "refresh=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
  ]);

  return res.json({ ok: true });
}
