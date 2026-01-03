async function loadProjects() {
  try {
    const res = await fetch('/data/systems.json', { cache: 'no-store' });
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    if (!grid) return console.error('projects-grid not found');
    
    // Clear existing content
    grid.textContent = '';
    
    // Create project cards using safe DOM methods
    projects.forEach(p => {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = p.demoUrl || '#';
      card.target = '_blank';
      card.rel = 'noopener';
      card.title = p.description;
      
      const iconDiv = document.createElement('div');
      iconDiv.style.cssText = 'font-size:1.8rem;margin-bottom:6px';
      iconDiv.textContent = p.icon;
      
      const nameH3 = document.createElement('h3');
      nameH3.textContent = p.name;
      
      const descP = document.createElement('p');
      descP.textContent = p.description;
      
      const tagsDiv = document.createElement('div');
      tagsDiv.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin-top:8px';
      
      p.tags.forEach(t => {
        const tagSpan = document.createElement('span');
        tagSpan.style.cssText = 'font-size:.7rem;background:rgba(212,175,55,.2);padding:3px 8px;border-radius:3px;color:var(--gold);white-space:nowrap';
        tagSpan.textContent = t;
        tagsDiv.appendChild(tagSpan);
      });
      
      card.appendChild(iconDiv);
      card.appendChild(nameH3);
      card.appendChild(descP);
      card.appendChild(tagsDiv);
      grid.appendChild(card);
    });
    
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
