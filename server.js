const express = require('express');
const { exec } = require('child_process');
const app = express();
app.use(express.json());

app.get('/', (_req,res)=>res.send('SmartFlow alive'));
app.post('/gh-sync', (req, res) => {
  const ok = (req.get('authorization')||'') === `Bearer ${process.env.SYNC_TOKEN}`;
  if (!ok) return res.status(401).json({ ok:false, msg:'bad token' });
  const ref = (req.body && req.body.ref) ? String(req.body.ref) : 'main';
  // Sanitize ref to prevent command injection - only allow safe git ref characters
  if (!/^[a-zA-Z0-9._/-]+$/.test(ref)) {
    return res.status(400).json({ ok:false, msg:'invalid ref format' });
  }
  exec(`bash scripts/sync.sh ${ref}`, (err, out, errout) =>
    err ? res.status(500).json({ ok:false, err: String(errout||err) })
        : res.json({ ok:true, ref, log: out?.slice(-300) || '' })
  );
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`SmartFlow webhook on ${PORT}`));
