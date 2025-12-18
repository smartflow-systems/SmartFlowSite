#!/usr/bin/env node
console.log("ok");
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'SmartFlowSite', via: 'src-index', ts: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'SmartFlowSite', via: 'src-index', ts: Date.now() });
});

// GitHub sync endpoint
app.post('/api/gh-sync', (req, res) => {
  console.log('[SFS] Deploy webhook:', req.body);
  res.json({ ok: true, route: 'gh-sync', method: 'POST', body: req.body });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartFlowSite API running on port ${PORT}`);
  });
}

module.exports = app;