(() => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];

  const state = {
    theme: localStorage.getItem('sf-theme') || 'dark',
    kpi: { activeWorkflows: 6, tasksToday: 18, avgDuration: '3m 42s', successRate: '97.4%' },
    recentRuns: [
      { id: 'RUN-5831', wf: 'Invoice ETL', status: 'Success', dur: '2m 14s', start: '10:05' },
      { id: 'RUN-5830', wf: 'CSV Import', status: 'Warning', dur: '5m 20s', start: '09:40' },
      { id: 'RUN-5829', wf: 'Webhook Sync', status: 'Failed',  dur: '0m 10s', start: '09:20' }
    ],
    spark: [12,18,9,22,35,28,40],
    workflows: [
      { name:'Invoice ETL', version:'2.3.1', status:'Active', owner:'Ops', updated:'Today' },
      { name:'Webhook Sync', version:'1.9.0', status:'Paused', owner:'Integrations', updated:'Yesterday' },
      { name:'CSV Import', version:'0.9.4', status:'Draft', owner:'Data', updated:'2 days ago' }
    ],
    tasks: [
      { title:'Ingest 5k rows', status:'Queued',   tag:'High' },
      { title:'Retry webhook 42', status:'Running', tag:'Normal' },
      { title:'Reindex invoices', status:'Running', tag:'High' },
      { title:'Archive old runs', status:'Done',     tag:'Low' }
    ],
    settingsStatus: ''
  };

  function route() {
    const hash = (location.hash || '#overview').replace('#', '');
    qsa('[data-view]').forEach(s => s.hidden = true);
    const active = qs(`[data-view="${hash}"]`);
    if (active) active.hidden = false;
    qsa('[data-route]').forEach(a =>
      a.setAttribute('aria-current', a.getAttribute('href') === `#${hash}` ? 'page' : 'false'));
    if (hash === 'overview') renderOverview();
    if (hash === 'workflows') renderWorkflows();
    if (hash === 'tasks') renderTasks();
  }

  function bindKpis() {
    for (const [k, v] of Object.entries(state.kpi)) {
      const el = qs(`[data-bind="kpi.${k}"]`);
      if (el) el.textContent = v;
    }
  }
  function renderRecentRuns() {
    const tbody = qs('[data-list="recentRuns"]');
    tbody.innerHTML = state.recentRuns.map(row => `
      <tr>
        <td>${row.id}</td><td>${row.wf}</td>
        <td><span class="status ${cls(row.status)}">${row.status}</span></td>
        <td>${row.dur}</td><td>${row.start}</td>
      </tr>`).join('');
  }
  function renderSpark() {
    const max = Math.max(...state.spark, 1);
    const pts = state.spark.map((v, i) => {
      const x = Math.round((i/(state.spark.length-1)) * 100);
      const y = Math.round(40 - (v/max)*36) + 2;
      return `${x},${y}`;
    }).join(' ');
    const poly = qs('[data-bind="sparkline"]');
    if (poly) poly.setAttribute('points', pts);
  }
  function renderOverview(){ bindKpis(); renderRecentRuns(); renderSpark(); }

  function renderWorkflows() {
    const statusFilter = qs('[data-filter="status"]').value;
    const tbody = qs('[data-list="workflows"]');
    const rows = state.workflows
      .filter(w => !statusFilter || w.status === statusFilter)
      .map(w => `<tr><td>${w.name}</td><td>${w.version}</td><td>${w.status}</td><td>${w.owner}</td><td>${w.updated}</td></tr>`)
      .join('');
    tbody.innerHTML = rows || `<tr><td colspan="5" class="muted">No workflows</td></tr>`;
  }

  function renderTasks() {
    const buckets = { Queued:[], Running:[], Done:[] };
    state.tasks.forEach(t => buckets[t.status]?.push(t));
    for (const [k, items] of Object.entries(buckets)) {
      const ul = qs(`[data-list="tasks:${k}"]`);
      ul.innerHTML = items.map(t => `<li><div>${t.title}</div><span class="badge">${t.tag}</span></li>`).join('');
    }
  }

  function toggleNav() { qs('.sf-aside').classList.toggle('open'); }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sf-theme', state.theme);
    applyTheme();
  }
  function applyTheme() {
    const light = state.theme === 'light';
    document.documentElement.style.setProperty('--bg', light ? '#f6f7fb' : '#0b0e14');
    document.documentElement.style.setProperty('--bg-soft', light ? '#ffffff' : '#111522');
    document.documentElement.style.setProperty('--panel', light ? '#ffffff' : '#161a2b');
    document.documentElement.style.setProperty('--card', light ? '#ffffff' : '#1b2033');
    document.documentElement.style.setProperty('--text', light ? '#0e1320' : '#e6e6e6');
    document.documentElement.style.setProperty('--line', light ? '#e7e9ee' : '#27314a');
  }
  function openQuickAdd() { qs('[data-modal]').showModal(); }
  function quickAddSubmit(ev) {
    ev.preventDefault();
    const form = ev.target.closest('form');
    const f = Object.fromEntries(new FormData(form));
    if (!f.name) return;
    if (f.type === 'Workflow') {
      state.workflows.unshift({ name:f.name, version:'0.1.0', status:'Draft', owner:'You', updated:'Just now' });
      location.hash = '#workflows'; renderWorkflows();
    } else {
      state.tasks.unshift({ title:f.name, status:'Queued', tag:'New' });
      location.hash = '#tasks'; renderTasks();
    }
    qs('[data-modal]').close();
  }
  function refreshRuns(){
    state.recentRuns.unshift({
      id:`RUN-${Math.floor(Math.random()*9000)+1000}`, wf:'Ad-hoc', status:'Success', dur:'1m 10s',
      start:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    renderRecentRuns();
  }
  function saveSettings(ev) {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.target));
    try {
      if (!data.orgName) throw new Error('Organization name is required');
      if (Number(data.concurrency) < 1) throw new Error('Concurrency must be >= 1');
      localStorage.setItem('sf-settings', JSON.stringify(data));
      state.settingsStatus = 'Saved';
    } catch (e) { state.settingsStatus = e.message; }
    const status = qs('[data-bind="settingsStatus"]');
    if (status) status.textContent = state.settingsStatus;
  }

  const cls = (s) => s === 'Success' ? 'ok' : s === 'Warning' ? 'warn' : 'bad';

  window.addEventListener('hashchange', route);
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]'); if (!el) return;
    const act = el.getAttribute('data-action');
    if (act === 'toggleNav') toggleNav();
    if (act === 'openQuickAdd') openQuickAdd();
    if (act === 'refreshRuns') refreshRuns();
    if (act === 'toggleTheme') toggleTheme();
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-filter="status"]')) renderWorkflows();
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'quickAddForm') quickAddSubmit(e);
    if (e.target.id === 'settingsForm') saveSettings(e);
  });

  applyTheme();
  route();
})();
