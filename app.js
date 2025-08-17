// SmartFlow Systems Portfolio App
class SmartFlowApp {
  constructor() {
    this.siteData = {};
    this.systemsData = [];
    this.liveData = {};
    this.editMode = false;
    this.liveMetrics = {
      sessions: 0,
      apiCalls: 0,
      bookings: 0,
      revenue: 0
    };
    this.eventQueue = [];
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.setupHashRouting();
      this.renderContent();
      this.startLiveMetrics();
      this.setCurrentYear();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  async loadData() {
    try {
      // Load site configuration
      const siteResponse = await fetch('./data/site.json');
      this.siteData = await siteResponse.json();

      // Load systems data
      const systemsResponse = await fetch('./data/systems.json');
      this.systemsData = await systemsResponse.json();

      // Load live data
      const liveResponse = await fetch('./data/live.json');
      this.liveData = await liveResponse.json();
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default data if loading fails
      this.siteData = { social: {} };
      this.systemsData = [];
      this.liveData = { events: [] };
    }
  }

  setupEventListeners() {
    // Edit mode toggle
    const editToggle = document.getElementById('editToggle');
    editToggle.addEventListener('click', () => this.toggleEditMode());

    // Live mode toggle
    const liveMode = document.getElementById('liveMode');
    liveMode.addEventListener('change', (e) => this.toggleLiveMode(e.target.checked));

    // Contact form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));

    // Modal close buttons
    document.getElementById('demoClose').addEventListener('click', () => this.closeDemoModal());
    document.getElementById('detailsClose').addEventListener('click', () => this.closeDetailsDrawer());

    // Close modals on backdrop click
    document.getElementById('demoModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeDemoModal();
    });

    document.getElementById('detailsDrawer').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeDetailsDrawer();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDemoModal();
        this.closeDetailsDrawer();
      }
    });
  }

  setupHashRouting() {
    // Simple hash routing for smooth navigation
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const section = document.getElementById(hash);

    if (section) {
      // Update active navigation
      document.querySelectorAll('.nav nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
      });

      // Smooth scroll to section
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderContent() {
    this.renderHeroContent();
    this.renderSystemsGrid();
    this.renderPricingGrid();
    this.renderCaseStudy();
    this.renderSocialLinks();
  }

  renderHeroContent() {
    if (this.siteData.hero) {
      const titleElement = document.getElementById('heroTitle');
      const subtitleElement = document.getElementById('heroSubtitle');

      if (titleElement && this.siteData.hero.title) {
        // Safe DOM manipulation: parse known-safe content structure
        this.renderSafeHeroTitle(titleElement, this.siteData.hero.title);
      }

      if (subtitleElement && this.siteData.hero.subtitle) {
        subtitleElement.textContent = this.siteData.hero.subtitle;
      }
    }
  }

  renderSafeHeroTitle(element, titleContent) {
    // Clear existing content
    element.textContent = '';
    
    // Parse the expected format: '<span class="gold">text</span> — remaining text'
    const match = titleContent.match(/^<span class="gold">([^<]+)<\/span>\s*(.*)$/);
    
    if (match) {
      // Create gold span element safely
      const goldSpan = document.createElement('span');
      goldSpan.className = 'gold';
      goldSpan.textContent = match[1];
      
      // Add gold span
      element.appendChild(goldSpan);
      
      // Add remaining text if present
      if (match[2]) {
        element.appendChild(document.createTextNode(' ' + match[2]));
      }
    } else {
      // Fallback: treat as plain text
      element.textContent = titleContent;
    }
  }

  renderSystemsGrid() {
    const grid = document.getElementById('systemsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    this.systemsData.forEach((system, index) => {
      const card = this.createSystemCard(system, index);
      grid.appendChild(card);
    });
  }

  createSystemCard(system, index) {
    const card = document.createElement('div');
    card.className = 'card';

    const tagsHtml = system.tags ? 
      system.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

    card.innerHTML = `
      <div class="card-icon">${system.icon || '⚡'}</div>
      <h3 class="title">${system.name}</h3>
      <div class="tags">${tagsHtml}</div>
      <p class="desc">${system.description}</p>
      <div class="footer">
        <button class="btn-outline" onclick="app.openDemo('${system.demoUrl}', '${system.name}')">
          Open Demo
        </button>
        <button class="btn-ghost" onclick="app.openDetails(${index})">
          View Details
        </button>
      </div>
      ${this.editMode ? `<div class="json-snippet">${JSON.stringify(system, null, 2)}</div>` : ''}
    `;

    return card;
  }

  renderPricingGrid() {
    const grid = document.getElementById('pricingGrid');
    if (!grid || !this.siteData.pricing) return;

    grid.innerHTML = '';

    this.siteData.pricing.forEach(tier => {
      const card = document.createElement('div');
      card.className = `price-card ${tier.featured ? 'featured' : ''}`;

      const featuresHtml = tier.features ? 
        tier.features.map(feature => `<li>${feature}</li>`).join('') : '';

      card.innerHTML = `
        <h3 class="h3">${tier.name}</h3>
        <div class="price">${tier.price}</div>
        <p class="muted">${tier.description}</p>
        <ul class="price-features">${featuresHtml}</ul>
        <button class="btn" onclick="app.scrollToContact()">
          ${tier.cta || 'Get Started'}
        </button>
      `;

      grid.appendChild(card);
    });
  }

  renderCaseStudy() {
    const wrapper = document.getElementById('caseWrap');
    if (!wrapper || !this.siteData.caseStudy) return;

    const caseStudy = this.siteData.caseStudy;

    const metricsHtml = caseStudy.metrics ? 
      caseStudy.metrics.map(metric => `
        <div class="case-metric">
          <span class="number">${metric.value}</span>
          <small>${metric.label}</small>
        </div>
      `).join('') : '';

    wrapper.innerHTML = `
      <div class="case-metrics">${metricsHtml}</div>
      <div class="case-quote">
        <blockquote>"${caseStudy.quote}"</blockquote>
        <cite>— ${caseStudy.author}, ${caseStudy.company}</cite>
      </div>
    `;
  }

  renderSocialLinks() {
    if (!this.siteData.social) return;

    const xLink = document.getElementById('xLink');
    const igLink = document.getElementById('igLink');
    const ytLink = document.getElementById('ytLink');

    if (xLink && this.siteData.social.twitter) {
      xLink.href = this.siteData.social.twitter;
    }
    if (igLink && this.siteData.social.instagram) {
      igLink.href = this.siteData.social.instagram;
    }
    if (ytLink && this.siteData.social.youtube) {
      ytLink.href = this.siteData.social.youtube;
    }
  }

  startLiveMetrics() {
    // Initialize with base values
    this.liveMetrics = {
      sessions: Math.floor(Math.random() * 50) + 10,
      apiCalls: Math.floor(Math.random() * 100) + 20,
      bookings: Math.floor(Math.random() * 15) + 5,
      revenue: Math.floor(Math.random() * 2000) + 500
    };

    this.updateLiveMetrics();

    // Update metrics every 3-5 seconds
    setInterval(() => {
      if (!document.getElementById('liveMode').checked) {
        this.simulateMetricUpdates();
      }
      this.updateLiveMetrics();
    }, Math.random() * 2000 + 3000);

    // Add events every 4-8 seconds
    setInterval(() => {
      this.addRandomEvent();
    }, Math.random() * 4000 + 4000);
  }

  simulateMetricUpdates() {
    // Randomly increment metrics
    if (Math.random() > 0.7) {
      this.liveMetrics.sessions += Math.floor(Math.random() * 3);
    }
    if (Math.random() > 0.5) {
      this.liveMetrics.apiCalls += Math.floor(Math.random() * 10) + 1;
    }
    if (Math.random() > 0.8) {
      this.liveMetrics.bookings += 1;
      this.liveMetrics.revenue += Math.floor(Math.random() * 200) + 50;
    }
  }

  updateLiveMetrics() {
    document.getElementById('kpiSessions').textContent = this.liveMetrics.sessions;
    document.getElementById('kpiApi').textContent = this.liveMetrics.apiCalls;
    document.getElementById('kpiBookings').textContent = this.liveMetrics.bookings;
    document.getElementById('kpiRevenue').textContent = `£${this.liveMetrics.revenue}`;
  }

  addRandomEvent() {
    const isExternalMode = document.getElementById('liveMode').checked;

    let events;
    if (isExternalMode && this.liveData.events) {
      events = this.liveData.events;
    } else {
      events = [
        'New booking confirmed',
        'Payment processed successfully',
        'User signed up',
        'API key generated',
        'System backup completed',
        'New client onboarded',
        'Invoice sent',
        'Campaign launched',
        'Integration completed',
        'Performance milestone reached'
      ];
    }

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const timestamp = new Date().toLocaleTimeString();

    this.addEventToStream(`${randomEvent} - ${timestamp}`);
  }

  addEventToStream(eventText) {
    const eventList = document.getElementById('eventList');
    if (!eventList) return;

    const eventItem = document.createElement('li');
    eventItem.textContent = eventText;

    // Add to top of list
    eventList.insertBefore(eventItem, eventList.firstChild);

    // Keep only last 20 events
    while (eventList.children.length > 20) {
      eventList.removeChild(eventList.lastChild);
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    const editToggle = document.getElementById('editToggle');

    editToggle.setAttribute('aria-pressed', this.editMode);
    document.body.classList.toggle('edit-mode', this.editMode);

    // Store edit mode state
    localStorage.setItem('smartflow-edit-mode', this.editMode);

    // Re-render systems grid to show/hide JSON snippets
    this.renderSystemsGrid();
  }

  toggleLiveMode(isExternal) {
    // Clear current events when switching modes
    const eventList = document.getElementById('eventList');
    if (eventList) {
      eventList.innerHTML = '';
    }

    if (isExternal) {
      // Load external feed data
      this.loadExternalFeed();
    }
  }

  async loadExternalFeed() {
    try {
      // Simulate loading external data
      if (this.liveData.metrics) {
        this.liveMetrics = { ...this.liveData.metrics };
        this.updateLiveMetrics();
      }

      // Add initial events from external feed
      if (this.liveData.events) {
        this.liveData.events.slice(0, 5).forEach((event, index) => {
          setTimeout(() => {
            this.addEventToStream(`${event} - ${new Date().toLocaleTimeString()}`);
          }, index * 500);
        });
      }
    } catch (error) {
      console.error('Failed to load external feed:', error);
    }
  }

  openDemo(demoUrl, title) {
    const modal = document.getElementById('demoModal');
    const titleEl = document.getElementById('demoTitle');
    const frame = document.getElementById('demoFrame');

    titleEl.textContent = `${title} - Live Demo`;
    frame.src = demoUrl;

    modal.showModal();

    // Focus trap for accessibility
    this.trapFocus(modal);
  }

  closeDemoModal() {
    const modal = document.getElementById('demoModal');
    const frame = document.getElementById('demoFrame');

    modal.close();
    frame.src = ''; // Stop loading iframe
  }

  openDetails(systemIndex) {
    const system = this.systemsData[systemIndex];
    if (!system) return;

    const drawer = document.getElementById('detailsDrawer');
    const titleEl = document.getElementById('detailsTitle');
    const bodyEl = document.getElementById('detailsBody');

    titleEl.textContent = system.name;

    const featuresHtml = system.features ? 
      system.features.map(feature => `<li>${feature}</li>`).join('') : '';

    const linksHtml = system.links ? 
      system.links.map(link => `<a href="${link.url}" class="btn-outline" target="_blank">${link.label}</a>`).join('') : '';

    bodyEl.innerHTML = `
      <p class="muted">${system.description}</p>
      ${system.features ? `
        <h4>Features</h4>
        <ul class="price-features">${featuresHtml}</ul>
      ` : ''}
      ${system.pricing ? `
        <h4>Pricing</h4>
        <p>${system.pricing}</p>
      ` : ''}
      ${system.links ? `
        <h4>Links</h4>
        <div class="actions">${linksHtml}</div>
      ` : ''}
    `;

    drawer.showModal();

    // Focus trap for accessibility
    this.trapFocus(drawer);
  }

  closeDetailsDrawer() {
    const drawer = document.getElementById('detailsDrawer');
    drawer.close();
  }

  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Focus first element
    firstElement?.focus();
  }

  handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate required fields
    const name = data.name?.trim();
    const email = data.email?.trim();
    const message = data.message?.trim();

    if (!name || !email || !message) {
      const status = document.getElementById('contactStatus');
      if (status) {
        status.textContent = 'Please fill in all required fields.';
        status.style.color = '#ff6b6b';
      }
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const status = document.getElementById('contactStatus');
      if (status) {
        status.textContent = 'Please enter a valid email address.';
        status.style.color = '#ff6b6b';
      }
      return;
    }

    console.log('Contact form submission:', data);

    // Simulate form submission
    const status = document.getElementById('contactStatus');
    if (status) {
      status.textContent = 'Message sent! We\'ll be in touch soon.';
      status.style.color = 'var(--gold)';
    }

    // Reset form after a delay
    setTimeout(() => {
      form.reset();
      if (status) {
        status.textContent = '';
      }
    }, 3000);
  }

  scrollToContact() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  }

  setCurrentYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SmartFlowApp();

  // Load edit mode state from localStorage
  const savedEditMode = localStorage.getItem('smartflow-edit-mode');
  if (savedEditMode === 'true') {
    setTimeout(() => app.toggleEditMode(), 100);
  }
});

// Global functions for onclick handlers
window.openDemo = (url, title) => app.openDemo(url, title);
window.openDetails = (index) => app.openDetails(index);