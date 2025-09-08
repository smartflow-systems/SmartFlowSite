import express from 'express';
import { exec } from 'child_process';
const app = express(); app.use(express.json());

app.post('/gh-sync', (req, res) => {
  if ((req.get('authorization')||'') !== `Bearer ${process.env.SYNC_TOKEN}`)
    return res.status(401).json({ok:false});
  const ref = (req.body?.ref as string) || 'main';
  exec(`bash scripts/sync.sh ${ref}`, (err, out, errout) =>
    err ? res.status(500).json({ok:false, err:String(errout||err)})
        : res.json({ok:true, ref}));
});

const PORT = Number(process.env.PORT)||3000;
app.listen(PORT, '0.0.0.0', () => console.log(`/gh-sync on ${PORT}`));
