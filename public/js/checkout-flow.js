// Plan catalogue — must stay in sync with server.js planCatalogue
var planCatalogue = {
  starter: {
    name: 'Smart Starter',
    desc: 'Perfect for small businesses getting started',
    price: { gbp: 49 },
    billingType: 'subscription',
    period: '/month after trial',
    trialLine: '14 days free, then £49/month'
  },
  pro: {
    name: 'Flow Kit',
    desc: 'For growing businesses ready to scale',
    price: { gbp: 149 },
    billingType: 'subscription',
    period: '/month after trial',
    trialLine: '14 days free, then £149/month'
  },
  premium: {
    name: 'Salon Launch Pack',
    desc: 'Enterprise solution for multi-location businesses',
    price: { gbp: 299 },
    billingType: 'subscription',
    period: '/month after trial',
    trialLine: '14 days free, then £299/month'
  },
  starter_build: {
    name: 'Starter Build',
    desc: '1 system setup, brand colours & logo, email support',
    price: { gbp: 199 },
    billingType: 'onetime',
    period: 'one-time payment',
    trialLine: 'Single payment, no recurring fees'
  },
  pro_build: {
    name: 'Pro Build',
    desc: '2 systems + integrations, Stripe + Calendar, priority support',
    price: { gbp: 499 },
    billingType: 'onetime',
    period: 'one-time payment',
    trialLine: 'Single payment, no recurring fees'
  },
  premium_build: {
    name: 'Premium Build',
    desc: 'All systems + presets, analytics + training, 30-day optimisation',
    price: { gbp: 999 },
    billingType: 'onetime',
    period: 'one-time payment',
    trialLine: 'Single payment, no recurring fees'
  }
};

var params = new URLSearchParams(window.location.search);
var planId = params.get('plan') || 'pro';
var plan = planCatalogue[planId] || planCatalogue['pro'];
var currency = 'gbp';
var symbol = '£';

var customerData = null;
var csrfToken = null;

// Render plan banner
document.getElementById('banner-name').textContent = plan.name;
document.getElementById('banner-desc').textContent = plan.desc;
document.getElementById('banner-price').innerHTML =
  symbol + plan.price[currency] + '<span> ' + plan.period + '</span>';

// Fetch CSRF token on load
fetch('/api/csrf-token')
  .then(function(r) { return r.json(); })
  .then(function(d) { csrfToken = d.csrfToken; })
  .catch(function(e) { console.warn('CSRF token fetch failed:', e); });

// Step navigation helpers
function setStep(n) {
  [1, 2, 3].forEach(function(i) {
    var el = document.getElementById('step-' + i);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  });
  [1, 2].forEach(function(i) {
    var line = document.getElementById('line-' + i);
    line.classList.toggle('done', i < n);
  });
}

function goBack() {
  document.getElementById('section-details').classList.remove('hidden');
  document.getElementById('section-review').classList.add('hidden');
  setStep(1);
}

// Step 1: details form submit
document.getElementById('details-form').addEventListener('submit', function(e) {
  e.preventDefault();

  var firstName = document.getElementById('firstName').value.trim();
  var lastName = document.getElementById('lastName').value.trim();
  var email = document.getElementById('email').value.trim();
  var valid = true;

  function setError(fieldId, show) {
    var f = document.getElementById('field-' + fieldId);
    if (f) f.classList.toggle('has-error', show);
    if (show) valid = false;
  }

  setError('firstName', !firstName);
  setError('lastName', !lastName);
  setError('email', !email || email.indexOf('@') < 1 || email.indexOf('.') < 0);

  if (!valid) return;

  customerData = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    company: document.getElementById('company').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  // Populate review section
  var rc = document.getElementById('review-customer');
  var rows = '<div class="review-row"><span class="review-label">Name</span><span class="review-value">' +
    escHtml(firstName + ' ' + lastName) + '</span></div>' +
    '<div class="review-row"><span class="review-label">Email</span><span class="review-value">' +
    escHtml(email) + '</span></div>';
  if (customerData.company) {
    rows += '<div class="review-row"><span class="review-label">Company</span><span class="review-value">' +
      escHtml(customerData.company) + '</span></div>';
  }
  if (customerData.phone) {
    rows += '<div class="review-row"><span class="review-label">Phone</span><span class="review-value">' +
      escHtml(customerData.phone) + '</span></div>';
  }
  rc.innerHTML = rows;

  document.getElementById('review-plan-name').textContent = plan.name;
  document.getElementById('review-billing').textContent = plan.trialLine;
  document.getElementById('review-period').textContent = plan.period;
  document.getElementById('review-total').textContent =
    plan.billingType === 'onetime' ? (symbol + plan.price[currency]) : symbol + '0.00';

  // Show/hide trial row based on plan type
  var trialRow = document.getElementById('review-trial-text');
  if (trialRow) {
    var trialRowEl = trialRow.closest('.review-row');
    if (trialRowEl) {
      trialRowEl.style.display = plan.billingType === 'onetime' ? 'none' : '';
    }
  }

  document.getElementById('section-details').classList.add('hidden');
  document.getElementById('section-review').classList.remove('hidden');
  setStep(2);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Wire up edit button and pay button via addEventListener (CSP-safe)
document.getElementById('edit-btn').addEventListener('click', goBack);
document.getElementById('pay-btn').addEventListener('click', proceedToPayment);

// Clear field errors on input
['firstName', 'lastName', 'email'].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', function() {
      var field = document.getElementById('field-' + id);
      if (field) field.classList.remove('has-error');
    });
  }
});

function proceedToPayment() {
  var btn = document.getElementById('pay-btn');
  var errBox = document.getElementById('error-box');
  errBox.style.display = 'none';

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Connecting to Stripe...';

  var body = {
    planId: planId,
    customerEmail: customerData.email,
    customerName: customerData.firstName + ' ' + customerData.lastName,
    company: customerData.company,
    phone: customerData.phone,
    successUrl: window.location.origin + '/success.html?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: window.location.href
  };

  var headers = { 'Content-Type': 'application/json' };
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.success || !data.url) {
        throw new Error(data.message || 'Could not create checkout session.');
      }
      setStep(3);
      window.location.href = data.url;
    })
    .catch(function(err) {
      console.error('Checkout error:', err);
      errBox.textContent = err.message || 'Something went wrong. Please try again.';
      errBox.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
        ' Pay Securely with Stripe';
    });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
