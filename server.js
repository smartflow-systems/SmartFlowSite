// Hardened static server (prevents path traversal, MIME whitelist, no dir list)
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

const send = (res, code, body, h = {}) => {
  res.writeHead(code, {
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json",
    "Access-Control-Allow-Origin": "*",
    ...h,
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const publicRoot = path.resolve(__dirname);

const safePathname = (u) => {
  try {
    const { pathname } = new URL(u, "http://local");
    return decodeURIComponent(pathname.replace(/\/+/g, "/"));
  } catch {
    return "/";
  }
};

const serveStatic = (req, res) => {
  const pathname = safePathname(req.url);
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  let candidate = path.resolve(publicRoot, rel);

  if (!candidate.startsWith(publicRoot + path.sep)) {
    return send(res, 403, { error: "Forbidden" });
  }

  fs.stat(candidate, (err, st) => {
    if (!err && st.isDirectory()) candidate = path.join(candidate, "index.html");

    const ext = path.extname(candidate).toLowerCase();
    const type = MIME[ext];
    if (!type) return send(res, 404, { error: "Not found" });

    fs.stat(candidate, (e2, st2) => {
      if (e2 || !st2.isFile()) return send(res, 404, { error: "Not found" });
      res.writeHead(200, { "Content-Type": type, "Access-Control-Allow-Origin": "*" });
      fs.createReadStream(candidate).pipe(res);
    });
  });
};

const ok = (res, obj) => send(res, 200, obj);

http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.url === "/health" || req.url.startsWith("/api/health")) return ok(res, { ok: true });

  // add other API routes above; static last:
  return serveStatic(req, res);
}).listen(PORT, () => console.log(`listening on :${PORT}`));
