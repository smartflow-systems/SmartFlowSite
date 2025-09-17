import express from 'express';
import { attachDevProxy } from "./dev-proxy.js";
import { attachStatic } from "./serve-static.js";
import { execFile } from 'child_process';

const app = express();
app.use(express.json());

// Attach dev proxy for backend routes (/api, /status, /data)
attachDevProxy(app);

// Health endpoint for monitoring
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: "SmartFlowSite", via: "express-server", ts: Date.now() });
});

// Attach static file serving for SPA
attachStatic(app);

// Simple rate limiting for /gh-sync
app.post('/gh-sync', (req, res) => {
  if ((req.get('authorization')||'') !== `Bearer ${process.env.SYNC_TOKEN}`)
    return res.status(401).json({ok:false});
  const ref = (req.body?.ref as string) || 'main';
  execFile('bash', ['scripts/sync.sh', ref], (err, out, errout) =>
    err ? res.status(500).json({ok:false, err:String(errout||err)})
        : res.json({ok:true, ref}));
});

const PORT = Number(process.env.PORT)||5000;
app.listen(PORT, '0.0.0.0', () => console.log(`SmartFlowSite Express server running on ${PORT}`));