import express from 'express';
import { execFile } from 'child_process';
import rateLimit from 'express-rate-limit';
const app = express(); app.use(express.json());

// Rate limit for /gh-sync: 5 requests per 5 minutes per IP
const syncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.post('/gh-sync', syncLimiter, (req, res) => {
  if ((req.get('authorization')||'') !== `Bearer ${process.env.SYNC_TOKEN}`)
    return res.status(401).json({ok:false});
  const ref = (req.body?.ref as string) || 'main';
  execFile('bash', ['scripts/sync.sh', ref], (err, out, errout) =>
    err ? res.status(500).json({ok:false, err:String(errout||err)})
        : res.json({ok:true, ref}));
});

const PORT = Number(process.env.PORT)||3000;
app.listen(PORT, '0.0.0.0', () => console.log(`/gh-sync on ${PORT}`));
