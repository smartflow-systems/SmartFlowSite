/**
 * SmartFlow Friendly UX Enhancements
 * CSP-compliant version — all styles live in styles.css
 */

/* 1. Smooth scroll with offset for fixed nav */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    var target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

/* 2. Button loading state */
document.querySelectorAll('.btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    if (this.href && !this.href.includes('#')) {
      this.style.opacity = '0.7';
      this.style.pointerEvents = 'none';
    }
  });
});

/* 3. Ripple effect — uses .ripple class defined in styles.css */
function createRipple(event) {
  var button = event.currentTarget;
  var existingRipple = button.querySelector('.ripple');
  if (existingRipple) existingRipple.remove();

  var rect = button.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  var x = event.clientX - rect.left - size / 2;
  var y = event.clientY - rect.top - size / 2;

  var ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width  = size + 'px';
  ripple.style.height = size + 'px';
  ripple.style.left   = x + 'px';
  ripple.style.top    = y + 'px';

  button.appendChild(ripple);
  setTimeout(function () { ripple.remove(); }, 650);
}

document.querySelectorAll('.btn, .price-card').forEach(function (el) {
  el.addEventListener('click', createRipple);
});

/* 4. Scroll-reveal — adds .sfs-revealed class (CSS handles the animation) */
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('sfs-revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .price-card, .testimonial, .section').forEach(function (el) {
  observer.observe(el);
});

/* 5. Active nav state on scroll */
var sections  = document.querySelectorAll('section[id]');
var navLinks  = document.querySelectorAll('.menu-links a[href^="#"]');

window.addEventListener('scroll', function () {
  var current = '';
  sections.forEach(function (section) {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });

/* 6. Page-transition loader — uses .sfs-page-loader class from styles.css */
window.addEventListener('beforeunload', function () {
  var loader = document.createElement('div');
  loader.className = 'sfs-page-loader';
  document.body.appendChild(loader);
});

/* 7. Scroll-to-top button — uses .sfs-scroll-top class from styles.css */
var scrollToTop = document.createElement('button');
scrollToTop.innerHTML = '&#8593;';
scrollToTop.className = 'sfs-scroll-top';
scrollToTop.setAttribute('aria-label', 'Scroll to top');
scrollToTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.body.appendChild(scrollToTop);

window.addEventListener('scroll', function () {
  scrollToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

/* 8. Performance badge — uses .sfs-perf-badge class from styles.css */
if ('performance' in window) {
  window.addEventListener('load', function () {
    setTimeout(function () {
      var perfData = performance.getEntriesByType('navigation')[0];
      if (!perfData) return;
      var loadTime = perfData.loadEventEnd - perfData.fetchStart;
      console.log('\u26A1 Performance Metrics:', {
        loadTime:  loadTime,
        domReady:  perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstByte: perfData.responseStart - perfData.requestStart,
      });

      if (loadTime < 2000) {
        var badge = document.createElement('div');
        badge.className = 'sfs-perf-badge';
        badge.textContent = '\u26A1 Lightning Fast!';
        document.body.appendChild(badge);
        setTimeout(function () {
          badge.classList.add('exiting');
          setTimeout(function () { badge.remove(); }, 500);
        }, 3000);
      }
    }, 0);
  });
}

/* 9. Keyboard shortcuts */
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.click();
  }
  if (e.key === 'Escape') {
    var menuClose = document.getElementById('menu-close');
    if (menuClose) menuClose.click();
  }
});

/* 10. Input focus highlight (using style — not blocked by CSP when done via JS) */
document.querySelectorAll('input, textarea').forEach(function (input) {
  input.addEventListener('focus', function () {
    this.style.borderColor = '#FFD700';
    this.style.boxShadow   = '0 0 0 3px rgba(255,215,0,0.15)';
  });
  input.addEventListener('blur', function () {
    this.style.borderColor = '';
    this.style.boxShadow   = '';
  });
});

console.log('\u2728 SmartFlow UX enhancements loaded!');
