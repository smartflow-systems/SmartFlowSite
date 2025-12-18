import type { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
export function attachDevProxy(app: Express) {
  const target = process.env.DEV_PROXY_TARGET; // e.g. https://your-flask.repl.co
  if (!target) return;
  const common = { target, changeOrigin: true };
  app.use("/api",    createProxyMiddleware(common));
  app.use("/status", createProxyMiddleware(common));
  app.use("/data",   createProxyMiddleware(common));
}
