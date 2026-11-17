import { authed, pullReport } from "./desk.js";

export default async function handler(req, res) {
  if (!authed(req)) {
    res.status(401).json({ error: "unauthorised" });
    return;
  }
  try {
    const report = await pullReport();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "update failed" });
  }
}
