/**
 * SmartFlow Systems - Powerhouse Features
 * Advanced interactions, animations, and conversion tools
 */

// ==========================================
// 1. SCROLL ANIMATIONS - Smooth Reveal Effects
// ==========================================
const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
  document.querySelectorAll('.price-card').forEach(el => observer.observe(el));
};

// ==========================================
// 2. ANIMATED STATS COUNTER
// ==========================================
const animateCounter = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
};

const initStatsCounters = () => {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));
};

// ==========================================
// 3. SOCIAL PROOF NOTIFICATIONS
// ==========================================
const socialProofNotifications = [
  { name: "Sarah M.", action: "booked BookFlow Pro", time: "2 minutes ago", location: "London" },
  { name: "James K.", action: "started AI Social Bot trial", time: "5 minutes ago", location: "Manchester" },
  { name: "Emma L.", action: "purchased SmartCommerce", time: "12 minutes ago", location: "Birmingham" },
  { name: "David R.", action: "scheduled a demo", time: "18 minutes ago", location: "Leeds" },
  { name: "Lisa P.", action: "signed up for Premium", time: "25 minutes ago", location: "Glasgow" }
];

const showSocialProof = () => {
  const notification = socialProofNotifications[Math.floor(Math.random() * socialProofNotifications.length)];

  const popup = document.createElement('div');
  popup.className = 'social-proof-popup';

  const content = document.createElement('div');
  content.className = 'social-proof-content';

  const icon = document.createElement('div');
  icon.className = 'social-proof-icon';
  icon.textContent = '✓';

  const textDiv = document.createElement('div');
  textDiv.className = 'social-proof-text';

  const nameStrong = document.createElement('strong');
  nameStrong.textContent = notification.name;
  textDiv.appendChild(nameStrong);

  textDiv.appendChild(document.createTextNode(' from ' + notification.location));
  textDiv.appendChild(document.createElement('br'));

  const actionSpan = document.createElement('span');
  actionSpan.textContent = notification.action;
  textDiv.appendChild(actionSpan);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'social-proof-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => popup.remove());

  content.appendChild(icon);
  content.appendChild(textDiv);
  content.appendChild(closeBtn);
  popup.appendChild(content);

  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add('show'), 100);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 300);
  }, 6000);
};

const initSocialProof = () => {
  // Show first notification after 5 seconds
  setTimeout(showSocialProof, 5000);
  // Then show random notifications every 15-25 seconds
  setInterval(() => {
    if (Math.random() > 0.3) showSocialProof();
  }, 20000);
};

// ==========================================
// 4. ROI CALCULATOR
// ==========================================
const openROICalculator = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content roi-calculator">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <h2>💰 Calculate Your Savings</h2>
      <p class="modal-subtitle">See how much time and money you'll save</p>

      <div class="roi-form">
        <div class="roi-input-group">
          <label>Monthly bookings/transactions</label>
          <input type="number" id="roi-transactions" value="100" min="1" max="10000">
        </div>

        <div class="roi-input-group">
          <label>Average time spent per booking (minutes)</label>
          <input type="number" id="roi-time" value="10" min="1" max="60">
        </div>

        <div class="roi-input-group">
          <label>Hourly staff cost (£)</label>
          <input type="number" id="roi-cost" value="15" min="5" max="100">
        </div>

        <div class="roi-input-group">
          <label>Current no-show rate (%)</label>
          <input type="number" id="roi-noshow" value="15" min="0" max="50">
        </div>

        <button class="btn btn-gold" onclick="calculateROI()">Calculate Savings</button>

        <div id="roi-results" class="roi-results" style="display:none;">
          <h3>Your Monthly Savings:</h3>
          <div class="roi-stat">
            <span class="roi-label">Time Saved</span>
            <span class="roi-value" id="time-saved">0</span>
          </div>
          <div class="roi-stat">
            <span class="roi-label">Money Saved</span>
            <span class="roi-value roi-highlight" id="money-saved">£0</span>
          </div>
          <div class="roi-stat">
            <span class="roi-label">No-Show Recovery</span>
            <span class="roi-value" id="noshow-recovery">£0</span>
          </div>
          <div class="roi-total">
            <strong>Total Monthly Benefit:</strong>
            <span id="total-benefit">£0</span>
          </div>
          <p class="roi-note">Based on industry averages. Individual results may vary.</p>
          <a href="https://calendly.com/smartflow-systems" target="_blank" class="btn btn-gold">
            Book a Demo to Get Started
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
};

const calculateROI = () => {
  const transactions = parseInt(document.getElementById('roi-transactions').value) || 0;
  const timePerBooking = parseInt(document.getElementById('roi-time').value) || 0;
  const hourlyCost = parseInt(document.getElementById('roi-cost').value) || 0;
  const noShowRate = parseInt(document.getElementById('roi-noshow').value) || 0;

  // Calculate time saved (80% automation)
  const totalMinutes = transactions * timePerBooking * 0.8;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  // Calculate money saved
  const moneySaved = (totalMinutes / 60) * hourlyCost;

  // Calculate no-show recovery (average booking value £50)
  const noShowRecovery = (transactions * (noShowRate / 100)) * 50 * 0.7;

  const totalBenefit = moneySaved + noShowRecovery;

  // Display results
  document.getElementById('time-saved').textContent = `${hours}h ${minutes}m`;
  document.getElementById('money-saved').textContent = `£${Math.round(moneySaved).toLocaleString()}`;
  document.getElementById('noshow-recovery').textContent = `£${Math.round(noShowRecovery).toLocaleString()}`;
  document.getElementById('total-benefit').textContent = `£${Math.round(totalBenefit).toLocaleString()}`;
  document.getElementById('roi-results').style.display = 'block';
};

// Make it globally accessible
window.calculateROI = calculateROI;

// ==========================================
// 5. SYSTEM COMPARISON TOOL
// ==========================================
const openComparisonTool = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content comparison-tool">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <h2>⚖️ Compare Systems</h2>
      <p class="modal-subtitle">Find the perfect solution for your business</p>

      <div class="comparison-grid">
        <div class="comparison-header">
          <div class="comparison-cell">Feature</div>
          <div class="comparison-cell">BookFlow Pro</div>
          <div class="comparison-cell">SmartCommerce</div>
          <div class="comparison-cell">AI Social Bot</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Best For</strong></div>
          <div class="comparison-cell">Service businesses</div>
          <div class="comparison-cell">Online retailers</div>
          <div class="comparison-cell">Social media marketing</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Automation Level</strong></div>
          <div class="comparison-cell">⭐⭐⭐⭐⭐</div>
          <div class="comparison-cell">⭐⭐⭐⭐</div>
          <div class="comparison-cell">⭐⭐⭐⭐⭐</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Setup Time</strong></div>
          <div class="comparison-cell">1-2 days</div>
          <div class="comparison-cell">2-3 days</div>
          <div class="comparison-cell">1 day</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Starting Price</strong></div>
          <div class="comparison-cell">£29/mo</div>
          <div class="comparison-cell">£49/mo</div>
          <div class="comparison-cell">£79/mo</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Payment Processing</strong></div>
          <div class="comparison-cell">✓</div>
          <div class="comparison-cell">✓</div>
          <div class="comparison-cell">—</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>AI Features</strong></div>
          <div class="comparison-cell">—</div>
          <div class="comparison-cell">✓</div>
          <div class="comparison-cell">✓✓✓</div>
        </div>

        <div class="comparison-row">
          <div class="comparison-cell"><strong>Mobile App</strong></div>
          <div class="comparison-cell">✓</div>
          <div class="comparison-cell">✓</div>
          <div class="comparison-cell">✓</div>
        </div>

        <div class="comparison-footer">
          <div class="comparison-cell"></div>
          <div class="comparison-cell">
            <a href="https://smartflow-booking-demo.replit.app" target="_blank" class="btn btn-ghost btn-sm">Try Demo</a>
          </div>
          <div class="comparison-cell">
            <a href="https://smartflow-ecom-demo.replit.app" target="_blank" class="btn btn-ghost btn-sm">Try Demo</a>
          </div>
          <div class="comparison-cell">
            <a href="https://socialscalebooster.replit.app" target="_blank" class="btn btn-ghost btn-sm">Try Demo</a>
          </div>
        </div>
      </div>

      <div class="comparison-cta">
        <p>Still not sure? Take our 2-minute quiz to find your perfect system</p>
        <button class="btn btn-gold" onclick="this.closest('.modal-overlay').remove(); openRecommendationQuiz();">
          Take the Quiz →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
};

// ==========================================
// 6. RECOMMENDATION QUIZ
// ==========================================
const openRecommendationQuiz = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content quiz-modal">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <h2>🎯 Find Your Perfect System</h2>
      <p class="modal-subtitle">Answer 3 quick questions</p>

      <div class="quiz-container">
        <div class="quiz-question active" data-question="1">
          <h3>What's your primary business type?</h3>
          <div class="quiz-options">
            <button class="quiz-option" data-value="service">🗓️ Service-based (salon, fitness, consulting)</button>
            <button class="quiz-option" data-value="retail">🛍️ Retail/E-commerce</button>
            <button class="quiz-option" data-value="social">📱 Social media/Marketing</button>
            <button class="quiz-option" data-value="tech">💻 Tech/SaaS</button>
          </div>
        </div>

        <div class="quiz-question" data-question="2">
          <h3>What's your biggest challenge?</h3>
          <div class="quiz-options">
            <button class="quiz-option" data-value="noshow">😤 No-shows and cancellations</button>
            <button class="quiz-option" data-value="sales">📈 Increasing sales</button>
            <button class="quiz-option" data-value="engagement">💬 Customer engagement</button>
            <button class="quiz-option" data-value="time">⏱️ Too much manual work</button>
          </div>
        </div>

        <div class="quiz-question" data-question="3">
          <h3>What's your monthly budget?</h3>
          <div class="quiz-options">
            <button class="quiz-option" data-value="starter">£20-50/month</button>
            <button class="quiz-option" data-value="growth">£50-100/month</button>
            <button class="quiz-option" data-value="scale">£100+/month</button>
          </div>
        </div>

        <div class="quiz-result" style="display:none;">
          <div class="quiz-result-content">
            <h3>Perfect Match Found!</h3>
            <div id="quiz-recommendation"></div>
            <a href="https://calendly.com/smartflow-systems" target="_blank" class="btn btn-gold">
              Book a Demo →
            </a>
          </div>
        </div>
      </div>

      <div class="quiz-progress">
        <div class="quiz-progress-bar" style="width: 33%"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);

  // Quiz logic
  let answers = {};
  let currentQuestion = 1;

  modal.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      answers[`q${currentQuestion}`] = btn.dataset.value;

      const currentQ = modal.querySelector(`.quiz-question[data-question="${currentQuestion}"]`);
      currentQ.classList.remove('active');

      currentQuestion++;

      if (currentQuestion <= 3) {
        const nextQ = modal.querySelector(`.quiz-question[data-question="${currentQuestion}"]`);
        nextQ.classList.add('active');

        const progress = (currentQuestion / 3) * 100;
        modal.querySelector('.quiz-progress-bar').style.width = `${progress}%`;
      } else {
        // Show result
        showQuizResult(modal, answers);
      }
    });
  });
};

const showQuizResult = (modal, answers) => {
  modal.querySelector('.quiz-progress').style.display = 'none';
  modal.querySelector('.quiz-result').style.display = 'block';

  let recommendation = '';

  // Simple recommendation logic
  if (answers.q1 === 'service' || answers.q2 === 'noshow') {
    recommendation = `
      <div class="recommendation-card">
        <h4>📅 BookFlow Pro</h4>
        <p>Perfect for service businesses! Eliminate no-shows with automated reminders and deposits.</p>
        <ul>
          <li>✓ Automated booking management</li>
          <li>✓ Payment integration</li>
          <li>✓ 70% reduction in no-shows</li>
        </ul>
        <strong>Starting at £29/month</strong>
      </div>
    `;
  } else if (answers.q1 === 'retail' || answers.q2 === 'sales') {
    recommendation = `
      <div class="recommendation-card">
        <h4>🛍️ SmartCommerce Suite</h4>
        <p>Boost your online sales with AI-powered recommendations and abandoned cart recovery!</p>
        <ul>
          <li>✓ Complete e-commerce platform</li>
          <li>✓ Smart upsell engine</li>
          <li>✓ Multi-channel selling</li>
        </ul>
        <strong>Starting at £49/month</strong>
      </div>
    `;
  } else if (answers.q1 === 'social' || answers.q2 === 'engagement') {
    recommendation = `
      <div class="recommendation-card">
        <h4>🤖 AI Social Bot Pro</h4>
        <p>Automate your social media and 10x your engagement with AI-powered content!</p>
        <ul>
          <li>✓ Auto-generate captions & hashtags</li>
          <li>✓ DM funnel automation</li>
          <li>✓ Multi-platform support</li>
        </ul>
        <strong>Starting at £79/month</strong>
      </div>
    `;
  } else {
    recommendation = `
      <div class="recommendation-card">
        <h4>🌟 Full Suite Recommended</h4>
        <p>Get maximum efficiency with our complete automation package!</p>
        <ul>
          <li>✓ All systems integrated</li>
          <li>✓ Custom workflows</li>
          <li>✓ Priority support</li>
        </ul>
        <strong>Starting at £199/month</strong>
      </div>
    `;
  }

  modal.querySelector('#quiz-recommendation').innerHTML = recommendation;
};

// ==========================================
// 7. EXIT-INTENT LEAD CAPTURE
// ==========================================
let exitIntentShown = false;

const showExitIntent = () => {
  if (exitIntentShown) return;
  exitIntentShown = true;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay exit-intent';
  modal.innerHTML = `
    <div class="modal-content exit-intent-content">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      <h2>Wait! Before you go...</h2>
      <p class="modal-subtitle">Get our FREE guide: "10 Ways to Automate Your Business in 2025"</p>

      <form class="exit-intent-form" onsubmit="event.preventDefault(); submitExitIntent(this);">
        <input type="email" placeholder="Enter your email" required>
        <button type="submit" class="btn btn-gold">Get Free Guide →</button>
      </form>

      <p class="exit-intent-note">Plus, get exclusive early access to new features!</p>

      <div class="exit-intent-benefits">
        <div class="benefit">✓ 10 automation strategies</div>
        <div class="benefit">✓ Case studies with ROI</div>
        <div class="benefit">✓ Free consultation</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
};

const submitExitIntent = (form) => {
  const email = form.querySelector('input[type="email"]').value;

  // Show success message
  form.innerHTML = `
    <div class="success-message">
      <h3>✓ Success!</h3>
      <p>Check your email for the free guide.</p>
      <p>We'll be in touch soon!</p>
    </div>
  `;

  // Send to backend (if configured)
  fetch('/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'exit-intent', type: 'free-guide' })
  }).catch(() => {});

  setTimeout(() => {
    form.closest('.modal-overlay').remove();
  }, 3000);
};

window.submitExitIntent = submitExitIntent;

const initExitIntent = () => {
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseY = e.clientY;
  });

  document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0 && mouseY <= 100 && !exitIntentShown) {
      setTimeout(showExitIntent, 200);
    }
  });

  // Also show after 45 seconds if not shown
  setTimeout(() => {
    if (!exitIntentShown && Math.random() > 0.5) {
      showExitIntent();
    }
  }, 45000);
};

// ==========================================
// 8. MOBILE MENU
// ==========================================
const initMobileMenu = () => {
  const nav = document.querySelector('.nav nav');
  if (!nav) return;

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  hamburger.setAttribute('aria-label', 'Toggle menu');

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  const navHeader = document.querySelector('.nav');
  navHeader.insertBefore(hamburger, nav);
};

// ==========================================
// 9. ADD FLOATING ACTION BUTTONS
// ==========================================
const addFloatingButtons = () => {
  const fab = document.createElement('div');
  fab.className = 'floating-actions';
  fab.innerHTML = `
    <button class="fab-btn" onclick="openROICalculator()" title="ROI Calculator">
      💰
    </button>
    <button class="fab-btn" onclick="openComparisonTool()" title="Compare Systems">
      ⚖️
    </button>
    <button class="fab-btn" onclick="openRecommendationQuiz()" title="Find Your System">
      🎯
    </button>
  `;

  document.body.appendChild(fab);
};

// Make functions globally accessible
window.openROICalculator = openROICalculator;
window.openComparisonTool = openComparisonTool;
window.openRecommendationQuiz = openRecommendationQuiz;

// ==========================================
// INITIALIZE ALL FEATURES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SmartFlow Powerhouse Features Loading...');

  initScrollAnimations();
  initStatsCounters();
  initSocialProof();
  initExitIntent();
  initMobileMenu();
  addFloatingButtons();

  console.log('✅ Powerhouse Features Active!');
});
