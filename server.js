import express from "express";
import { readFileSync } from "fs";

const app = express();

// Load config once at startup
const config = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

// serve everything from /public
app.use(express.static("public"));

// health check with site info
app.get("/health", (_req, res) => res.json({
  ok: true,
  siteName: config.siteName,
  version: config.version
}));
app.get("/api/health", (_req, res) => res.json({
  ok: true,
  siteName: config.siteName,
  version: config.version
}));

// port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`serving on ${port}`));
export default app;