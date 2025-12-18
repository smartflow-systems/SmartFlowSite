import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Express } from "express";
import express from "express";
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
export function attachStatic(app: Express) {
  const dist = path.resolve(__dirname, "../client/dist");
  const index = path.join(dist, "index.html");
  app.use(express.static(dist, { index: false }));
  app.get("/", (_req,res)=>res.sendFile(index));
  app.get(/^(?!\/api\/|\/status(?:\/|$)|\/health(?:\/|$)|\/__diag\/).*/, (_req,res)=>res.sendFile(index));
}