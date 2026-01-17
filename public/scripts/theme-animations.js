/**
 * SMARTFLOW SYSTEMS - THEME ANIMATIONS
 * ============================================================================
 * Circuit flow animations, particle effects, glass card interactions
 *
 * Version: 3.0
 * Updated: 2026-01-03
 * Author: SmartFlow Systems
 * ============================================================================
 */

(function() {
  'use strict';

  // ========================================================================
  // CIRCUIT FLOW BACKGROUND ANIMATION
  // ========================================================================

  class CircuitFlow {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.nodes = [];
      this.connections = [];
      this.particles = [];

      this.colors = {
        gold: '#FFD700',
        goldMedium: '#FFA500',
        goldDark: '#B8860B',
        brown: '#3E2723',
        brownLight: '#5D4037'
      };

      this.resize();
      this.init();
      this.animate();

      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    init() {
      // Create nodes in a grid pattern
      const nodeSpacing = 150;
      const cols = Math.ceil(this.canvas.width / nodeSpacing);
      const rows = Math.ceil(this.canvas.height / nodeSpacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          this.nodes.push({
            x: i * nodeSpacing + Math.random() * 50,
            y: j * nodeSpacing + Math.random() * 50,
            radius: 3,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03
          });
        }
      }

      // Create connections between nearby nodes
      this.nodes.forEach((node, i) => {
        this.nodes.slice(i + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200 && Math.random() > 0.7) {
            this.connections.push({
              from: node,
              to: otherNode,
              progress: Math.random()
            });
          }
        });
      });

      // Create flowing particles
      for (let i = 0; i < 20; i++) {
        this.createParticle();
      }
    }

    createParticle() {
      if (this.connections.length === 0) return;

      const connection = this.connections[Math.floor(Math.random() * this.connections.length)];
      this.particles.push({
        connection: connection,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? this.colors.gold : this.colors.goldMedium
      });
    }

    animate() {
      this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw connections
      this.connections.forEach(conn => {
        const gradient = this.ctx.createLinearGradient(
          conn.from.x, conn.from.y,
          conn.to.x, conn.to.y
        );
        gradient.addColorStop(0, 'rgba(62, 39, 35, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(62, 39, 35, 0.3)');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(conn.from.x, conn.from.y);
        this.ctx.lineTo(conn.to.x, conn.to.y);
        this.ctx.stroke();
      });

      // Draw nodes with pulsing effect
      this.nodes.forEach(node => {
        node.pulse += node.pulseSpeed;
        const pulseSize = 1 + Math.sin(node.pulse) * 0.5;

        const gradient = this.ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * pulseSize * 2
        );
        gradient.addColorStop(0, this.colors.gold);
        gradient.addColorStop(0.5, this.colors.goldMedium);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius * pulseSize * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Core node
        this.ctx.fillStyle = this.colors.gold;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Draw and update particles
      this.particles = this.particles.filter(particle => {
        particle.progress += particle.speed;

        if (particle.progress > 1) {
          return false;
        }

        const x = particle.connection.from.x +
                  (particle.connection.to.x - particle.connection.from.x) * particle.progress;
        const y = particle.connection.from.y +
                  (particle.connection.to.y - particle.connection.from.y) * particle.progress;

        // Glow effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 3);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Core particle
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();

        return true;
      });

      // Maintain particle count
      while (this.particles.length < 20) {
        this.createParticle();
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // ========================================================================
  // HERO PARTICLES ANIMATION
  // ========================================================================

  class HeroParticles {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];

      this.resize();
      this.init();
      this.animate();

      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas.parentElement) return;
      this.canvas.width = this.canvas.parentElement.offsetWidth;
      this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    init() {
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;

        // Draw particle with glow
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, ${particle.opacity})`);
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // ========================================================================
  // REVEAL ON SCROLL ANIMATION
  // ========================================================================

  class ScrollReveal {
    constructor() {
      this.elements = document.querySelectorAll('.reveal');
      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersect(entries),
        {
          threshold: 0.1,
          rootMargin: '0px 0px -100px 0px'
        }
      );

      this.elements.forEach(el => this.observer.observe(el));
    }

    handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          this.observer.unobserve(entry.target);
        }
      });
    }
  }

  // ========================================================================
  // BURGER MENU FUNCTIONALITY
  // ========================================================================

  class BurgerMenu {
    constructor() {
      this.burger = document.querySelector('.burger-menu');
      this.mobileMenu = document.querySelector('.mobile-menu');

      if (!this.burger || !this.mobileMenu) return;

      this.burger.addEventListener('click', () => this.toggle());

      // Close menu when clicking on a link
      this.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
          this.close();
        }
      });
    }

    toggle() {
      this.burger.classList.toggle('active');
      this.mobileMenu.classList.toggle('active');
      document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    close() {
      this.burger.classList.remove('active');
      this.mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ========================================================================
  // STAT COUNTER ANIMATION
  // ========================================================================

  class StatCounter {
    constructor() {
      this.counters = document.querySelectorAll('.stat-number');
      this.animated = new Set();

      const observer = new IntersectionObserver(
        (entries) => this.handleIntersect(entries),
        { threshold: 0.5 }
      );

      this.counters.forEach(counter => observer.observe(counter));
    }

    handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated.has(entry.target)) {
          this.animateCounter(entry.target);
          this.animated.add(entry.target);
        }
      });
    }

    animateCounter(element) {
      const target = parseInt(element.dataset.count || 0);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          element.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current).toLocaleString();
        }
      }, 16);
    }
  }

  // ========================================================================
  // LIVE VISITORS COUNTER (SIMULATED)
  // ========================================================================

  class LiveVisitors {
    constructor() {
      this.element = document.getElementById('live-visitors');
      if (!this.element) return;

      this.baseCount = 47;
      this.update();
      setInterval(() => this.update(), 5000 + Math.random() * 5000);
    }

    update() {
      const variation = Math.floor(Math.random() * 5) - 2;
      this.baseCount = Math.max(30, Math.min(75, this.baseCount + variation));

      this.element.style.transition = 'none';
      this.element.style.transform = 'scale(1.2)';
      this.element.textContent = this.baseCount;

      setTimeout(() => {
        this.element.style.transition = 'transform 0.3s ease';
        this.element.style.transform = 'scale(1)';
      }, 50);
    }
  }

  // ========================================================================
  // TESTIMONIAL CAROUSEL
  // ========================================================================

  class TestimonialCarousel {
    constructor() {
      this.container = document.getElementById('testimonials-carousel');
      if (!this.container) return;

      this.testimonials = Array.from(this.container.children);
      this.currentIndex = 0;

      if (this.testimonials.length <= 1) return;

      this.showTestimonial(0);
      this.autoRotate();
    }

    showTestimonial(index) {
      this.testimonials.forEach((testimonial, i) => {
        testimonial.style.display = i === index ? 'block' : 'none';
        testimonial.style.animation = i === index ? 'fadeInUp 0.5s ease-out' : 'none';
      });
    }

    autoRotate() {
      setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.showTestimonial(this.currentIndex);
      }, 5000);
    }
  }

  // ========================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ========================================================================
  // INITIALIZE ALL ANIMATIONS
  // ========================================================================

  function init() {
    // Initialize circuit flow background
    new CircuitFlow('circuit-canvas');

    // Initialize hero particles
    new HeroParticles('hero-particles');

    // Initialize scroll reveal
    new ScrollReveal();

    // Initialize burger menu
    new BurgerMenu();

    // Initialize stat counters
    new StatCounter();

    // Initialize live visitors
    new LiveVisitors();

    // Initialize testimonial carousel
    new TestimonialCarousel();

    // Initialize smooth scroll
    initSmoothScroll();

    // Update year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    console.log('SmartFlow theme animations initialized');
  }

  // ========================================================================
  // AUTO-INITIALIZE ON DOM READY
  // ========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
