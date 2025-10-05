import express from 'express';
import rateLimit from 'express-rate-limit';
import { execFile as defaultExecFile } from 'node:child_process';

export function createApp(options = {}) {
  const { execFile = defaultExecFile } = options;
  const app = express();
  app.use(express.json());

  const syncLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/gh-sync', syncLimiter, (req, res) => {
    if ((req.get('authorization') || '') !== `Bearer ${process.env.SYNC_TOKEN}`) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const refBody = typeof req.body?.ref === 'string' ? req.body.ref.trim() : '';
    const ref = refBody.length > 0 ? refBody : 'main';

    execFile('bash', ['scripts/sync.sh', ref], (err, stdout, stderr) => {
      if (err) {
        const message = (stderr || err.message || 'sync failed').toString();
        return res.status(500).json({ ok: false, error: message });
      }

      const output = stdout ? stdout.toString() : '';
      return res.json({ ok: true, ref, output });
    });
  });

  return app;
}
