function initMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const sidebar = document.getElementById('menu-sidebar');
  const menuLinks = document.querySelectorAll('.menu-links a');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  // Open menu
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  });

  // Close menu
  const closeMenu = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  menuClose.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Close on link click
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  console.log('✅ Menu initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
