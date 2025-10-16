// Mobile menu toggle functionality
(function() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;
  
  if (!toggle || !navLinks) return;
  
  toggle.addEventListener('click', function() {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    toggle.classList.toggle('active');
    navLinks.classList.toggle('mobile-open');
    body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking nav links
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', function() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('active');
      navLinks.classList.remove('mobile-open');
      body.classList.remove('menu-open');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      if (navLinks.classList.contains('mobile-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        body.classList.remove('menu-open');
      }
    }
  });
})();
