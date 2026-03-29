/**
 * SmartFlow Friendly UX Enhancements
 * Micro-interactions and delightful user experience touches
 */

// 1. Smooth scroll with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed nav
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// 2. Add loading state to buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Only for buttons that navigate away
    if (this.href && !this.href.startsWith('#')) {
      this.style.opacity = '0.7';
      this.style.pointerEvents = 'none';
    }
  });
});

// 3. Add ripple effect to clickable elements
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');

  // Remove existing ripples
  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

// Add ripple to buttons and cards
document.querySelectorAll('.btn, .card, .price-card').forEach(element => {
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.addEventListener('click', createRipple);
});

// Add ripple styles
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 4. Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Animate cards and sections on scroll
document.querySelectorAll('.card, .price-card, .testimonial, .section').forEach((el, index) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
  observer.observe(el);
});

// 5. Add active state to navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.menu-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// 6. Add loading indicator for page transitions
window.addEventListener('beforeunload', () => {
  const loader = document.createElement('div');
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    z-index: 9999;
    animation: loading 1s ease-in-out infinite;
  `;
  document.body.appendChild(loader);
});

// 7. Show scroll-to-top button
const scrollToTop = document.createElement('button');
scrollToTop.innerHTML = '↑';
scrollToTop.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #0D0D0D;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-weight: bold;
`;

scrollToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.body.appendChild(scrollToTop);

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollToTop.style.opacity = '1';
    scrollToTop.style.transform = 'scale(1)';
  } else {
    scrollToTop.style.opacity = '0';
    scrollToTop.style.transform = 'scale(0)';
  }
});

// 8. Add hover sound effect (optional, respectful)
let audioEnabled = false; // Disabled by default

function playHoverSound() {
  if (!audioEnabled) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// 9. Add success feedback for form interactions
document.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('focus', function() {
    this.style.borderColor = '#FFD700';
    this.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
  });

  input.addEventListener('blur', function() {
    this.style.borderColor = '';
    this.style.boxShadow = '';
  });
});

// 10. Add copy-to-clipboard with feedback
function addCopyButton(codeBlock) {
  const button = document.createElement('button');
  button.textContent = 'Copy';
  button.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #FFD700;
    border-radius: 4px;
    color: #FFD700;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  `;

  button.addEventListener('click', async () => {
    const text = codeBlock.textContent;
    await navigator.clipboard.writeText(text);
    button.textContent = '✓ Copied!';
    button.style.background = 'rgba(0, 255, 0, 0.2)';
    setTimeout(() => {
      button.textContent = 'Copy';
      button.style.background = 'rgba(255, 215, 0, 0.2)';
    }, 2000);
  });

  codeBlock.style.position = 'relative';
  codeBlock.appendChild(button);
}

document.querySelectorAll('pre code').forEach(addCopyButton);

// 11. Performance monitoring (send to analytics)
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const metrics = {
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstByte: perfData.responseStart - perfData.requestStart
      };

      console.log('⚡ Performance Metrics:', metrics);

      // Show performance badge if load time is under 2s
      if (metrics.loadTime < 2000) {
        const badge = document.createElement('div');
        badge.textContent = '⚡ Lightning Fast!';
        badge.style.cssText = `
          position: fixed;
          bottom: 90px;
          right: 30px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          animation: slideInRight 0.5s ease-out;
          z-index: 1000;
        `;
        document.body.appendChild(badge);

        setTimeout(() => {
          badge.style.animation = 'slideOutRight 0.5s ease-in';
          setTimeout(() => badge.remove(), 500);
        }, 3000);
      }
    }, 0);
  });
}

// 12. Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K to open menu
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) menuBtn.click();
  }

  // Escape to close menu
  if (e.key === 'Escape') {
    const menuClose = document.getElementById('menu-close');
    if (menuClose) menuClose.click();
  }
});

// 13. Add animations CSS
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  @keyframes loading {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .menu-links a.active {
    background: rgba(212,175,55,.15);
    border-left-color: var(--gold, #FFD700);
    color: var(--gold, #FFD700);
  }
`;
document.head.appendChild(animStyle);

console.log('✨ SmartFlow UX enhancements loaded!');
