import express, { type Express } from "express";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, createLogger, type InlineConfig } from "vite";
import { type Server } from "node:http";
import viteUserConfig from "../vite.config";
import { nanoid } from "nanoid";

// --- ESM-safe paths
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Project roots with safe defaults
const ROOT       = process.env.PROJECT_ROOT ?? path.resolve(__dirname, "..");
const CLIENT_DIR = process.env.CLIENT_DIR   ?? path.join(ROOT, "client");
const DIST_DIR   = process.env.DIST_DIR     ?? path.join(ROOT, "dist", "public");

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  console.log(`${t} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = { middlewareMode: true, hmr: { server }, allowedHosts: true as const };
  const cfg: InlineConfig = {
    ...(viteUserConfig as any),
    configFile: false,
    server: { ...(viteUserConfig as any)?.server, ...serverOptions, port: Number(process.env.PORT) || 5000, host: true },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, opts) => { viteLogger.error(msg, opts); throw new Error(String(msg)); },
    },
  };

  const vite = await createViteServer(cfg);
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const candidates = [
        path.join(CLIENT_DIR, "index.html"),
        path.join(ROOT, "index.html"),
        path.join(ROOT, "index-smartflow.html"),
      ];
      const tplPath = candidates.find(p => fs.existsSync(p));
      if (!tplPath) throw new Error(`index.html not found in: ${candidates.join(", ")}`);

      let template = await fsp.readFile(tplPath, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);

      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).setHeader("Content-Type", "text/html");
      res.end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = DIST_DIR;
  if (!fs.existsSync(distPath)) {
    throw new Error(`Build not found at ${distPath}. Run: npm run build`);
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}
