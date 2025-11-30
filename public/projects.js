async function loadProjects() {
  try {
    const res = await fetch('/data/systems.json', { cache: 'no-store' });
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    if (!grid) return console.error('projects-grid not found');
    
    const html = projects.map(p => `
      <a class="project-card" href="${p.link}" target="_blank" rel="noopener" title="${p.description}">
        <div style="font-size:1.8rem;margin-bottom:4px">${p.icon}</div>
        <h3>${p.name}</h3>
        <p class="description">${p.description}</p>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${p.tags.map(t => `<span style="font-size:.7rem;background:rgba(212,175,55,.2);padding:2px 6px;border-radius:4px;color:var(--gold)">${t}</span>`).join('')}
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
