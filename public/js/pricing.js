const prices = {
  starter: { gbp: 49, usd: 62, eur: 57 },
  pro: { gbp: 149, usd: 188, eur: 173 },
  premium: { gbp: 299, usd: 378, eur: 348 }
};

const currencySymbols = { gbp: '£', usd: '$', eur: '€' };
let currentCurrency = 'gbp';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.currency-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.currency-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      currentCurrency = btn.dataset.currency;
      updatePrices();
    });
  });

  document.querySelectorAll('.cta-button[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.dataset.plan;
      window.location.href = '/checkout.html?plan=' + encodeURIComponent(plan);
    });
  });
});

function updatePrices() {
  var symbol = currencySymbols[currentCurrency];
  document.querySelectorAll('.pricing-card').forEach(function (card) {
    var btn = card.querySelector('.cta-button[data-plan]');
    if (!btn) return;
    var plan = btn.dataset.plan;
    var amount = prices[plan][currentCurrency];
    card.querySelector('.currency').textContent = symbol;
    card.querySelector('.amount').textContent = amount;
  });
}

if (typeof gtag !== 'undefined') {
  gtag('event', 'page_view', { page_title: 'Pricing', page_location: window.location.href });
}
