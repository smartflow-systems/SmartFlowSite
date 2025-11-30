async function loadProjects() {
  try {
    const res = await fetch('/data/systems.json', { cache: 'no-store' });
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    if (!grid) return console.error('projects-grid not found');
    
    const html = projects.map(p => `
      <a class="project-card" href="${p.link}" target="_blank" rel="noopener" title="${p.description}">
        <div style="font-size:1.8rem;margin-bottom:6px">${p.icon}</div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
          ${p.tags.map(t => `<span style="font-size:.7rem;background:rgba(212,175,55,.2);padding:3px 8px;border-radius:3px;color:var(--gold);white-space:nowrap">${t}</span>`).join('')}
        </div>
      </a>
    `).join('');
    
    grid.innerHTML = html;
    console.log('✅ Loaded', projects.length, 'apps');
  } catch (err) {
    console.error('❌ Failed to load projects:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProjects);
} else {
  loadProjects();
}
