import express from "express";
const app = express();

// serve everything from /public
app.use(express.static("public"));

// health check (optional)
app.get("/health", (_req, res) => res.json({ ok: true }));

// port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`serving on ${port}`));
export default app;