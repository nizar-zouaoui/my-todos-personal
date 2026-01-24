import sgMail from "@sendgrid/mail";
import type { NextApiRequest, NextApiResponse } from "next";
import { createAuthCode } from "../../../lib/storage";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com";

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });

  const code = generateCode();
  await createAuthCode(email, code, 60_000);

  // Preferred: SendGrid
  if (SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to: email,
        from: EMAIL_FROM,
        subject: "Your login code",
        text: `Your login code is ${code}. It expires in 1 minute.`,
        html: `<p>Your login code is <strong>${code}</strong>. It expires in 1 minute.</p>`,
      });
      return res.json({ ok: true });
    } catch (e) {
      console.error("sendgrid error", e);
      return res.status(500).json({ error: "failed to send email" });
    }
  }

  // If no provider configured, just return ok (code stored server-side)
  return res.json({ ok: true });
}
