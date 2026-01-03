export default function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
    const ok = (req.headers.authorization || "") === `Bearer ${process.env.REPLIT_TOKEN}`;
    if (!ok) return res.status(401).send("nope");
    console.log("[SFS] Deploy", req.body);
    res.json({ status: "ok" });
}