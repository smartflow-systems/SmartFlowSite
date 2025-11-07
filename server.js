// SmartFlowSite • Express (ESM) • JSON health + static
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5100;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Basics
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// HEALTH: JSON for probes (no-cache)
app.get(['/health','/healthz'], (_req, res) => {
  res.set('Cache-Control','no-store');
  res.status(200).json({ ok: true });
});

// Root → landing (optional)
app.get('/', (_req, res) => res.redirect('/landing'));

// 404 JSON
app.use((_req, res) => res.status(404).json({ ok:false, error:'not_found' }));

app.listen(PORT, '0.0.0.0', () =>
  console.log(`SmartFlowSite server running on ${PORT}`)
);
