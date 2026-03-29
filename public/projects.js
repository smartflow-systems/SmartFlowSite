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
      iconDiv.className = 'project-icon';
      iconDiv.textContent = p.icon;
      
      const nameH3 = document.createElement('h3');
      nameH3.textContent = p.name;
      
      const descP = document.createElement('p');
      descP.textContent = p.description;
      
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'project-tags';
      
      p.tags.forEach(t => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'project-tag';
        tagSpan.textContent = t;
        tagsDiv.appendChild(tagSpan);
      });
      
      card.appendChild(iconDiv);
      card.appendChild(nameH3);
      card.appendChild(descP);
      card.appendChild(tagsDiv);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('❌ Failed to load projects:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProjects);
} else {
  loadProjects();
}
