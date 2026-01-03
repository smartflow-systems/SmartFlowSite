import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

/**
 * Sanitize input for safe logging
 * @param input - The input to sanitize
 * @returns Sanitized string safe for logging
 */
function sanitizeForLog(input: any): string {
  if (input === null || input === undefined) {
    return String(input);
  }

  let str = String(input);

  // Remove dangerous characters
  str = str
    .replace(/\r\n/g, '\\r\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\x1b/g, '\\x1b')
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  const MAX_LENGTH = 500;
  if (str.length > MAX_LENGTH) {
    str = str.substring(0, MAX_LENGTH) + '... [truncated]';
  }

  return str;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["x-hub-signature-256"] as string || "";
  const secret = process.env.SYNC_TOKEN || "";
  const raw = JSON.stringify(req.body || {});
  const h = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const okHmac = sig && secret && (()=>{try{
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig));
  }catch{return false}})();

  const okBearer = (req.headers.authorization||"") === `Bearer ${process.env.REPLIT_TOKEN}`;
  if (!okHmac && !okBearer) return res.status(401).send("nope");

  // Sanitize body for logging to prevent log injection
  const sanitizedBody = typeof req.body === 'object'
    ? Object.keys(req.body).reduce((acc, key) => ({...acc, [key]: sanitizeForLog(req.body[key])}), {})
    : sanitizeForLog(req.body);

  console.log("[SFS] Deploy", sanitizedBody);
  res.json({ status: "ok" });
}
