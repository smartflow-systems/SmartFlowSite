import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.send('ok');
});

// GitHub sync webhook
app.post('/gh-sync', (req, res) => {
  const authHeader = req.get('authorization') || '';
  const expectedAuth = `Bearer ${process.env.REPLIT_TOKEN || ''}`;
  
  if (authHeader !== expectedAuth) {
    return res.status(401).send('nope');
  }
  
  console.log('[SFS] Deploy', req.body);
  res.json({ status: 'ok' });
});

// Root redirect
app.get('/', (_req, res) => {
  res.redirect('/landing');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartFlow server running on port ${PORT}`);
});
// --- SFS: /api/boost (lightweight counter) ---
{ let __sfsCount = 0;
  try {
    app.get('/api/boost', (req,res)=>{
      __sfsCount++;
      res.json({ ok:true, boost:'#smartflow', count:__sfsCount, ts:new Date().toISOString() });
    });
  } catch (e) { console.error('SFS /api/boost add failed:', e); }
}
