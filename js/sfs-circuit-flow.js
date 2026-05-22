/*!
 * SmartFlow Systems — Circuit Flow Animation v3
 * Gold-on-dark, traveling pulses, hub nodes, DPR-aware, IntersectionObserver
 */
(function () {
  'use strict';
  const CFG = {
    BG: '#0D0D0D', TRACK: '#3B2F2F', NODE: '#FFD700',
    HUB_GLOW: 'rgba(255,215,0,0.18)', PULSE: '#FFD700',
    PULSE_TRAIL: 'rgba(255,215,0,0)', NODE_COUNT: 9,
    HUB_INDICES: [0, 4, 8], NODE_R: 5, HUB_R: 10,
    PULSE_R: 4, PULSE_SPEED: 0.004, PULSE_COUNT: 6, HUB_PULSE_SPEED: 0.018,
  };
  function init(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W, H, nodes, edges, pulses, frame, hubPhase = 0, running = true;
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width || 600; H = rect.height || 340;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); buildGraph();
    }
    function buildGraph() {
      nodes = [];
      const cols = 4, rows = 3, padX = W * 0.12, padY = H * 0.18;
      const stepX = (W - padX * 2) / (cols - 1), stepY = (H - padY * 2) / (rows - 1);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c; if (i >= CFG.NODE_COUNT) break;
        nodes.push({ x: padX + c * stepX + (r % 2 === 1 ? stepX * 0.35 : 0), y: padY + r * stepY, hub: CFG.HUB_INDICES.includes(i) });
      }
      edges = [];
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx*dx + dy*dy) < W * 0.38) edges.push([i, j]);
      }
      pulses = [];
      for (let p = 0; p < CFG.PULSE_COUNT; p++) pulses.push({ ei: Math.floor(Math.random() * edges.length), t: p / CFG.PULSE_COUNT, dir: Math.random() > 0.5 ? 1 : -1 });
    }
    function drawTrack() {
      ctx.strokeStyle = CFG.TRACK; ctx.lineWidth = 1.5;
      edges.forEach(([a,b]) => { ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke(); });
    }
    function drawNodes() {
      nodes.forEach((n, i) => {
        if (n.hub) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, CFG.HUB_R * 3);
          const p = 0.12 + 0.08 * Math.sin(hubPhase + i);
          g.addColorStop(0, `rgba(255,215,0,${p + 0.1})`); g.addColorStop(1, 'rgba(255,215,0,0)');
          ctx.beginPath(); ctx.arc(n.x, n.y, CFG.HUB_R * 3, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, CFG.HUB_R, 0, Math.PI * 2); ctx.fillStyle = CFG.NODE; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, CFG.NODE_R, 0, Math.PI * 2);
          ctx.fillStyle = '#5a4a2a'; ctx.fill(); ctx.strokeStyle = CFG.NODE; ctx.lineWidth = 1; ctx.stroke();
        }
      });
    }
    function drawPulses() {
      pulses.forEach((p) => {
        const [a,b] = edges[p.ei], na = nodes[a], nb = nodes[b];
        const x = na.x + (nb.x - na.x) * p.t, y = na.y + (nb.y - na.y) * p.t;
        const tr = ctx.createRadialGradient(x, y, 0, x, y, CFG.PULSE_R * 5);
        tr.addColorStop(0, 'rgba(255,215,0,0.7)'); tr.addColorStop(1, CFG.PULSE_TRAIL);
        ctx.beginPath(); ctx.arc(x, y, CFG.PULSE_R * 5, 0, Math.PI * 2); ctx.fillStyle = tr; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, CFG.PULSE_R, 0, Math.PI * 2); ctx.fillStyle = CFG.PULSE; ctx.fill();
      });
    }
    function tick() {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, W, H);
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.9);
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
      hubPhase += CFG.HUB_PULSE_SPEED; drawTrack(); drawNodes(); drawPulses();
      pulses.forEach((p) => {
        p.t += CFG.PULSE_SPEED * p.dir;
        if (p.t > 1 || p.t < 0) {
          p.dir *= -1; p.t = Math.max(0, Math.min(1, p.t));
          if (Math.random() > 0.6) { p.ei = Math.floor(Math.random() * edges.length); p.t = p.dir === 1 ? 0 : 1; }
        }
      });
    }
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement); resize();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { running = true; tick(); } else { running = false; cancelAnimationFrame(frame); } }));
    io.observe(canvas);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { running = false; cancelAnimationFrame(frame); } else if (!running) { running = true; tick(); } });
    tick();
    return { destroy: () => { running = false; cancelAnimationFrame(frame); ro.disconnect(); io.disconnect(); } };
  }
  function mount(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    let canvas = el.querySelector('canvas.sfs-circuit-flow');
    if (!canvas) { canvas = document.createElement('canvas'); canvas.className = 'sfs-circuit-flow'; canvas.style.cssText = 'display:block;width:100%;height:100%;'; el.appendChild(canvas); }
    return init(canvas);
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { mount, init }; }
  else { window.SFSCircuitFlow = { mount, init }; document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('[data-sfs-circuit-flow]').forEach(mount); }); }
})();
