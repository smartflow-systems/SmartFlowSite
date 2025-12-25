/**
 * SmartFlow Systems - ULTIMATE SICK FEATURES 🔥
 * Investor-ready, conversion-optimized, absolutely stunning
 */

// ==========================================
// 1. HERO PARTICLE ANIMATION - Mind-Blowing Effect
// ==========================================
class ParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;

    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((p, i) => {
      // Move particle
      p.x += p.vx;
      p.y += p.vy;

      // Mouse interaction
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const force = (150 - distance) / 150;
        p.x -= dx * force * 0.03;
        p.y -= dy * force * 0.03;
      }

      // Bounce off edges
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
      this.ctx.fill();

      // Draw connections
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p2.x - p.x;
        const dy = p2.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(255, 215, 0, ${(1 - distance / 120) * 0.2})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 2. TESTIMONIALS CAROUSEL - Auto-Rotating
// ==========================================
class TestimonialsCarousel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentIndex = 0;
    this.testimonials = Array.from(this.container.children);
    this.interval = null;

    this.init();
  }

  init() {
    if (this.testimonials.length <= 1) return;

    // Hide all except first
    this.testimonials.forEach((t, i) => {
      t.style.display = i === 0 ? 'block' : 'none';
      t.style.opacity = i === 0 ? '1' : '0';
    });

    // Add navigation
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    nav.innerHTML = `
      <button class="carousel-btn prev" onclick="window.testimonialsCarousel.prev()">‹</button>
      <div class="carousel-dots"></div>
      <button class="carousel-btn next" onclick="window.testimonialsCarousel.next()">›</button>
    `;
    this.container.parentElement.appendChild(nav);

    // Add dots
    const dotsContainer = nav.querySelector('.carousel-dots');
    this.testimonials.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.onclick = () => this.goTo(i);
      dotsContainer.appendChild(dot);
    });

    this.dots = Array.from(dotsContainer.children);

    // Auto-rotate
    this.startAutoRotate();

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoRotate());
    this.container.addEventListener('mouseleave', () => this.startAutoRotate());
  }

  goTo(index) {
    const current = this.testimonials[this.currentIndex];
    const next = this.testimonials[index];

    current.style.opacity = '0';
    setTimeout(() => {
      current.style.display = 'none';
      next.style.display = 'block';
      setTimeout(() => next.style.opacity = '1', 50);
    }, 300);

    this.dots[this.currentIndex].classList.remove('active');
    this.dots[index].classList.add('active');

    this.currentIndex = index;
  }

  next() {
    this.goTo((this.currentIndex + 1) % this.testimonials.length);
  }

  prev() {
    this.goTo((this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length);
  }

  startAutoRotate() {
    this.interval = setInterval(() => this.next(), 5000);
  }

  stopAutoRotate() {
    if (this.interval) clearInterval(this.interval);
  }
}

// ==========================================
// 3. PRICING TOGGLE - Monthly/Annual
// ==========================================
const initPricingToggle = () => {
  const toggle = document.querySelector('.pricing-toggle');
  if (!toggle) return;

  const monthlyPrices = {
    starter: 199,
    pro: 499,
    premium: 999
  };

  const annualPrices = {
    starter: 1990, // Save 2 months
    pro: 4990,
    premium: 9990
  };

  toggle.addEventListener('change', (e) => {
    const isAnnual = e.target.checked;
    const prices = isAnnual ? annualPrices : monthlyPrices;

    Object.keys(prices).forEach(plan => {
      const priceEl = document.querySelector(`[data-plan="${plan}"] .price`);
      if (priceEl) {
        const displayPrice = isAnnual ? `£${prices[plan]}` : `£${prices[plan]}`;
        const period = isAnnual ? '/year' : '';
        priceEl.textContent = displayPrice + period;
      }
    });

    // Show/hide savings badge
    document.querySelectorAll('.annual-savings').forEach(el => {
      el.style.display = isAnnual ? 'block' : 'none';
    });
  });
};

// ==========================================
// 4. FAQ ACCORDION - Smooth Expand/Collapse
// ==========================================
const initFAQ = () => {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked if it wasn't open
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
};

// ==========================================
// 5. LOADING SCREEN - Premium Animation
// ==========================================
const showLoadingScreen = () => {
  const loader = document.createElement('div');
  loader.id = 'premium-loader';
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-logo">
        <svg viewBox="0 0 100 100" class="loader-circle">
          <circle cx="50" cy="50" r="45" />
        </svg>
        <span class="loader-text">SF</span>
      </div>
      <h2 class="loader-title">SmartFlow Systems</h2>
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
      <p class="loader-subtitle">Loading your automation platform...</p>
    </div>
  `;

  document.body.appendChild(loader);

  // Animate progress
  const progress = loader.querySelector('.loader-progress');
  let width = 0;
  const interval = setInterval(() => {
    width += Math.random() * 15;
    if (width >= 100) {
      width = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => loader.remove(), 500);
      }, 300);
    }
    progress.style.width = width + '%';
  }, 100);
};

// ==========================================
// 6. LIVE VISITOR COUNTER - Social Proof
// ==========================================
const initLiveCounter = () => {
  const counter = document.getElementById('live-visitors');
  if (!counter) return;

  const baseCount = 47 + Math.floor(Math.random() * 20);
  let currentCount = baseCount;

  const updateCounter = () => {
    const change = Math.random() > 0.5 ? 1 : -1;
    currentCount = Math.max(30, Math.min(100, currentCount + change));
    counter.textContent = currentCount;
  };

  counter.textContent = currentCount;
  setInterval(updateCounter, 3000 + Math.random() * 2000);
};

// ==========================================
// 7. FEATURE CARDS FLIP - 3D Hover Effect
// ==========================================
const initFeatureCards = () => {
  const cards = document.querySelectorAll('.feature-flip-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
};

// ==========================================
// 8. SCROLL PROGRESS BAR
// ==========================================
const initScrollProgress = () => {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
};

// ==========================================
// 9. NEWSLETTER SIGNUP - Inline
// ==========================================
const initNewsletter = () => {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value;
    const button = form.querySelector('button');
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = 'Subscribing...';

    try {
      await fetch('/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter', type: 'subscribe' })
      });

      form.innerHTML = `
        <div class="success-message">
          <h4>✓ You're In!</h4>
          <p>Check your inbox for our welcome email.</p>
        </div>
      `;
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      alert('Something went wrong. Please try again.');
    }
  });
};

// ==========================================
// 10. CTA URGENCY TIMER - Limited Time Offer
// ==========================================
const initUrgencyTimer = () => {
  const timer = document.getElementById('urgency-timer');
  if (!timer) return;

  // Set to end of day
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const updateTimer = () => {
    const now = new Date();
    const distance = endOfDay - now;

    if (distance < 0) {
      timer.textContent = 'Offer ended - New offer tomorrow!';
      timer.className = 'timer-expired';
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Clear existing content
    timer.textContent = '';
    timer.className = '';

    // Create timer elements safely
    const hourSpan = document.createElement('span');
    hourSpan.className = 'timer-unit';
    const hourStrong = document.createElement('strong');
    hourStrong.textContent = `${hours}h`;
    hourSpan.appendChild(hourStrong);

    const sep1 = document.createElement('span');
    sep1.className = 'timer-sep';
    sep1.textContent = ':';

    const minSpan = document.createElement('span');
    minSpan.className = 'timer-unit';
    const minStrong = document.createElement('strong');
    minStrong.textContent = `${minutes}m`;
    minSpan.appendChild(minStrong);

    const sep2 = document.createElement('span');
    sep2.className = 'timer-sep';
    sep2.textContent = ':';

    const secSpan = document.createElement('span');
    secSpan.className = 'timer-unit';
    const secStrong = document.createElement('strong');
    secStrong.textContent = `${seconds}s`;
    secSpan.appendChild(secStrong);

    // Append all elements
    timer.appendChild(hourSpan);
    timer.appendChild(sep1);
    timer.appendChild(minSpan);
    timer.appendChild(sep2);
    timer.appendChild(secSpan);
  };

  updateTimer();
  setInterval(updateTimer, 1000);
};

// ==========================================
// 11. STICKY CTA BAR - Appears on Scroll
// ==========================================
const initStickyCTA = () => {
  const ctaBar = document.createElement('div');
  ctaBar.className = 'sticky-cta-bar';
  ctaBar.innerHTML = `
    <div class="sticky-cta-content">
      <span class="sticky-cta-text">🚀 <strong>Limited Offer:</strong> Get 2 months FREE on annual plans</span>
      <a href="https://calendly.com/smartflow-systems" target="_blank" class="btn btn-gold btn-sm sticky-cta-btn">
        Claim Offer →
      </a>
      <button class="sticky-cta-close" onclick="this.parentElement.parentElement.classList.add('hidden')">×</button>
    </div>
  `;

  document.body.appendChild(ctaBar);

  let hasShown = false;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500 && !hasShown) {
      ctaBar.classList.add('show');
      hasShown = true;
    }
  });
};

// ==========================================
// 12. COOKIE CONSENT BANNER - GDPR Compliant
// ==========================================
const initCookieConsent = () => {
  if (localStorage.getItem('sfs-cookies-accepted')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-content">
      <p>🍪 We use cookies to enhance your experience. By continuing, you accept our <a href="/privacy.html">Privacy Policy</a>.</p>
      <div class="cookie-buttons">
        <button class="btn btn-ghost btn-sm" onclick="window.acceptCookies()">Accept All</button>
        <button class="btn btn-gold btn-sm" onclick="window.acceptEssentialOnly()">Essential Only</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 500);
};

window.acceptCookies = () => {
  localStorage.setItem('sfs-cookies-accepted', 'all');
  document.querySelector('.cookie-banner').classList.remove('show');
  setTimeout(() => document.querySelector('.cookie-banner').remove(), 300);
};

window.acceptEssentialOnly = () => {
  localStorage.setItem('sfs-cookies-accepted', 'essential');
  document.querySelector('.cookie-banner').classList.remove('show');
  setTimeout(() => document.querySelector('.cookie-banner').remove(), 300);
};

// ==========================================
// 13. TYPING ANIMATION - Dynamic Hero Text
// ==========================================
class TypingAnimation {
  constructor(elementId, phrases, typingSpeed = 100, deletingSpeed = 50, pauseDuration = 2000) {
    this.element = document.getElementById(elementId);
    if (!this.element) return;

    this.phrases = phrases;
    this.typingSpeed = typingSpeed;
    this.deletingSpeed = deletingSpeed;
    this.pauseDuration = pauseDuration;
    this.currentPhraseIndex = 0;
    this.currentText = '';
    this.isDeleting = false;

    this.type();
  }

  type() {
    const currentPhrase = this.phrases[this.currentPhraseIndex];

    if (this.isDeleting) {
      this.currentText = currentPhrase.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = currentPhrase.substring(0, this.currentText.length + 1);
    }

    this.element.textContent = this.currentText;

    let timeout = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

    if (!this.isDeleting && this.currentText === currentPhrase) {
      timeout = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
      timeout = 500;
    }

    setTimeout(() => this.type(), timeout);
  }
}

// ==========================================
// 14. ACHIEVEMENT BADGES - Gamification
// ==========================================
const showAchievementBadge = (title, description) => {
  const badge = document.createElement('div');
  badge.className = 'achievement-badge';
  
  const content = document.createElement('div');
  content.className = 'achievement-content';
  
  const icon = document.createElement('div');
  icon.className = 'achievement-icon';
  icon.textContent = '🏆';
  
  const textDiv = document.createElement('div');
  textDiv.className = 'achievement-text';
  
  const titleEl = document.createElement('strong');
  titleEl.textContent = title;
  
  const descEl = document.createElement('p');
  descEl.textContent = description;
  
  textDiv.appendChild(titleEl);
  textDiv.appendChild(descEl);
  content.appendChild(icon);
  content.appendChild(textDiv);
  badge.appendChild(content);

  document.body.appendChild(badge);
  setTimeout(() => badge.classList.add('show'), 100);
  setTimeout(() => {
    badge.classList.remove('show');
    setTimeout(() => badge.remove(), 300);
  }, 4000);
};

// Trigger achievements based on user behavior
let achievementsShown = new Set();

const checkAchievements = () => {
  // Time on site
  setTimeout(() => {
    if (!achievementsShown.has('explorer')) {
      showAchievementBadge('Explorer', 'You\'ve spent 30 seconds exploring SmartFlow!');
      achievementsShown.add('explorer');
    }
  }, 30000);

  // Scroll depth
  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    if (scrollPercent > 50 && !achievementsShown.has('halfway')) {
      showAchievementBadge('Halfway There', 'You\'re really interested in automation!');
      achievementsShown.add('halfway');
    }

    if (scrollPercent > 90 && !achievementsShown.has('dedicated')) {
      showAchievementBadge('Dedicated Reader', 'You\'ve seen it all! Ready to automate?');
      achievementsShown.add('dedicated');
    }
  });
};

// ==========================================
// INITIALIZE ALL ULTIMATE FEATURES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Ultimate features initializing

  // Show loading screen
  if (document.body.dataset.showLoader !== 'false') {
    showLoadingScreen();
  }

  // Initialize all features
  setTimeout(() => {
    new ParticleField('hero-particles');
    window.testimonialsCarousel = new TestimonialsCarousel('testimonials-carousel');

    initPricingToggle();
    initFAQ();
    initLiveCounter();
    initFeatureCards();
    initScrollProgress();
    initNewsletter();
    initUrgencyTimer();
    initStickyCTA();
    initCookieConsent();
    checkAchievements();

    // Typing animation for hero
    new TypingAnimation('hero-typing', [
      'Automate Your Business',
      'Save 70% of Your Time',
      'Increase Revenue 3x',
      'Scale Without Limits'
    ]);

    // Ultimate features activated
  }, 100);
});
