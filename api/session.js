import { checkLogin, sessionCookie } from "./desk.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const ok = checkLogin(body?.username, body?.code);
  if (!ok) {
    res.status(401).json({ ok: false, blocked: false });
    return;
  }
  res.setHeader("Set-Cookie", sessionCookie(60 * 60 * 24 * 14));
  res.status(200).json({ ok: true, blocked: false });
}
