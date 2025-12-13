/**
 * SmartFlow Systems - Master JavaScript
 * All-in-one script for landing page interactivity
 */

(function() {
  'use strict';

  // ======================
  // Mobile Navigation
  // ======================
  const initMobileNav = () => {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      menu.classList.toggle('active');
    });

    // Close menu when clicking links
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
      }
    });
  };

  // ======================
  // Solution Category Filtering
  // ======================
  const initSolutionFiltering = () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('[data-category]');

    if (tabs.length === 0 || cards.length === 0) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.getAttribute('data-category');

        // Update active tab
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Filter cards
        cards.forEach(card => {
          if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  };

  // ======================
  // Animated Counter for Stats
  // ======================
  const initCounters = () => {
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length === 0) return;

    const animateCounter = (element) => {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // 60 FPS
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };

      updateCounter();
    };

    // Intersection Observer to trigger animation when in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  // ======================
  // Live Visitor Count (Simulated)
  // ======================
  const initLiveVisitors = () => {
    const liveCount = document.getElementById('live-count');
    if (!liveCount) return;

    const updateCount = () => {
      const baseCount = 42;
      const variation = Math.floor(Math.random() * 15) - 7; // ±7
      const newCount = Math.max(25, baseCount + variation);
      liveCount.textContent = newCount;
    };

    // Update every 10-20 seconds
    setInterval(updateCount, Math.random() * 10000 + 10000);
  };

  // ======================
  // Circuit Flow Canvas Background
  // ======================
  const initCircuitCanvas = () => {
    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const nodes = [];
    const connections = [];
    const nodeCount = 50;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    // Find connections
    const findConnections = () => {
      connections.length = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            connections.push({
              from: nodes[i],
              to: nodes[j],
              opacity: 1 - (distance / 150)
            });
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw node
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      findConnections();
      connections.forEach(conn => {
        ctx.strokeStyle = `rgba(255, 215, 0, ${conn.opacity * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  };

  // ======================
  // Scroll Reveal Animation
  // ======================
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal, .value-card, .solution-card, .step-card, .stat-card, .testimonial-card, .trust-badge, .price-card');

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
      observer.observe(el);
    });
  };

  // ======================
  // Testimonial Carousel Duplication (for infinite scroll)
  // ======================
  const initTestimonialCarousel = () => {
    const track = document.querySelector('.testimonial-track');
    if (!track) return;

    const cards = Array.from(track.children);

    // Duplicate cards for infinite scroll
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  };

  // ======================
  // Smooth Scroll
  // ======================
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 80; // Account for fixed nav
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  };

  // ======================
  // Navbar Background on Scroll
  // ======================
  const initNavbarScroll = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        nav.style.background = 'linear-gradient(135deg, rgba(13, 13, 13, 0.95), rgba(20, 17, 15, 0.9))';
      } else {
        nav.style.boxShadow = 'none';
        nav.style.background = 'linear-gradient(135deg, rgba(13, 13, 13, 0.9), rgba(20, 17, 15, 0.85))';
      }

      lastScroll = currentScroll;
    });
  };

  // ======================
  // Particle Effect for Hero
  // ======================
  const initHeroParticles = () => {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const particleCount = 30;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        animation: float ${duration}s ${delay}s infinite ease-in-out;
        opacity: 0.4;
      `;

      container.appendChild(particle);
      particles.push(particle);
    }

    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(-40px) translateX(-10px); }
        75% { transform: translateY(-20px) translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  };

  // ======================
  // Form Validation (if contact form exists)
  // ======================
  const initFormValidation = () => {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        let isValid = true;

        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            field.classList.add('error');
          } else {
            field.classList.remove('error');
          }
        });

        // Required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
          } else {
            field.classList.remove('error');
          }
        });

        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  };

  // ======================
  // Lazy Loading Images
  // ======================
  const initLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  };

  // ======================
  // Loading Performance Optimization
  // ======================
  const initPerformanceOptimizations = () => {
    // Defer non-critical CSS
    const deferredCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
    deferredCSS.forEach(link => {
      link.rel = 'stylesheet';
    });

    // Preload critical resources
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  };

  // ======================
  // Analytics & Tracking (placeholder)
  // ======================
  const initAnalytics = () => {
    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.btn-gold, .btn-ghost');
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const label = btn.textContent.trim();
        console.log('CTA Click:', label);
        // Add your analytics tracking here (GA4, Mixpanel, etc.)
        // Example: gtag('event', 'cta_click', { 'label': label });
      });
    });

    // Track section views
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          console.log('Section View:', sectionId);
          // Example: gtag('event', 'section_view', { 'section': sectionId });
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(section => sectionObserver.observe(section));
  };

  // ======================
  // Copy to Clipboard Utility
  // ======================
  const initCopyButtons = () => {
    const copyButtons = document.querySelectorAll('[data-copy]');

    copyButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const textToCopy = btn.getAttribute('data-copy');

        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  };

  // ======================
  // Accessibility: Skip to Content
  // ======================
  const initAccessibility = () => {
    // Add skip link if it doesn't exist
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link sr-only';
      skipLink.textContent = 'Skip to main content';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--sf-gold);
        color: var(--sf-black);
        padding: 8px;
        z-index: 10000;
        text-decoration: none;
      `;

      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });

      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });

      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Ensure main content has ID
    const mainSection = document.querySelector('main, section');
    if (mainSection && !mainSection.id) {
      mainSection.id = 'main-content';
    }
  };

  // ======================
  // Initialize All
  // ======================
  const init = () => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all features
    initMobileNav();
    initSolutionFiltering();
    initCounters();
    initLiveVisitors();
    initCircuitCanvas();
    initScrollReveal();
    initTestimonialCarousel();
    initSmoothScroll();
    initNavbarScroll();
    initHeroParticles();
    initFormValidation();
    initLazyLoading();
    initPerformanceOptimizations();
    initAnalytics();
    initCopyButtons();
    initAccessibility();

    console.log('✨ SmartFlow Systems - Master App Initialized');
  };

  // Start initialization
  init();

})();