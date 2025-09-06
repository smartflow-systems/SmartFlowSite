const t = (v) => (v ?? '').toString().replace(/[<>]/g, '');

async function getConfig(){
  try {
    const res = await fetch('site.config.json', {cache: 'no-store'});
    return await res.json();
  } catch (e) {
    return {};
  }
}

async function loadLatest() {
  const target = document.getElementById('latest-list');
  if (!target) return;

  try {
    // Try multiple sources for latest posts
    let items = [];
    const sources = ['data/posts.json', 'blog/index.json', 'content/index.json'];
    
    for (const src of sources) {
      try {
        const res = await fetch(src, { cache: 'no-store' });
        items = await res.json();
        if (Array.isArray(items) && items.length > 0) break;
      } catch (e) {
        continue;
      }
    }

    if (!Array.isArray(items)) items = [];
    
    // sort by date desc and take top 3
    items.sort((a,b)=> new Date(b.date) - new Date(a.date));
    const top3 = items.slice(0,3);

    if (top3.length > 0) {
      target.innerHTML = top3.map(p => `
        <article class="latest-card">
          <a href="${t(p.url || p.link || '#')}">
            <h3>${t(p.title)}</h3>
          </a>
          <time datetime="${t(p.date)}">${new Date(p.date).toLocaleDateString()}</time>
        </article>
      `).join('');
    } else {
      target.innerHTML = `<p class="muted">No posts yet.</p>`;
    }
  } catch (e) {
    target.innerHTML = `<p class="muted">No posts yet.</p>`;
    console.error('Latest load error', e);
  }
}

async function loadPricingCards() {
  const target = document.getElementById('pricing-cards');
  if (!target) return;

  try {
    const res = await fetch('pricing.json', {cache: 'no-store'});
    const data = await res.json();
    const plans = data.plans || [];

    target.innerHTML = plans.map(plan => `
      <article class="pricing-card ${plan.popular ? 'popular' : ''}">
        ${plan.popular ? '<div class="badge">Most Popular</div>' : ''}
        <header class="plan-header">
          <h3>${t(plan.name)}</h3>
          <p class="subtitle">${t(plan.subtitle)}</p>
          <div class="price">${t(plan.price)}<span class="period">/${t(plan.period)}</span></div>
        </header>
        <ul class="features">
          ${(plan.features || []).map(f => `<li>${t(f)}</li>`).join('')}
        </ul>
        <footer class="plan-footer">
          <a href="book.html?plan=${plan.id}" class="btn ${plan.popular ? 'btn-gold' : 'btn-ghost'} btn-full">
            Choose ${t(plan.name)}
          </a>
        </footer>
      </article>
    `).join('');
  } catch (e) {
    target.innerHTML = '<p class="muted">Pricing data unavailable.</p>';
    console.error('Pricing load error', e);
  }
}

function rotateTestimonials() {
  const wrap = document.querySelector('.testimonials');
  if (!wrap) return;
  const speed = Number(wrap.dataset.rotate || 7000);
  const items = [...wrap.querySelectorAll('.t-item')];
  if (items.length < 2) return;

  let i = 0;
  setInterval(()=>{
    items[i].classList.remove('active');
    i = (i + 1) % items.length;
    items[i].classList.add('active');
  }, speed);
}

async function setupLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const cfg = await getConfig();
  
  // Smart Part links (live microapp)
  const sp1 = document.getElementById('smart-part-live');
  if (sp1 && cfg.smartPartUrl) sp1.href = cfg.smartPartUrl;

  const sp2 = document.getElementById('smart-part-live-2');
  if (sp2 && cfg.smartPartUrl) sp2.href = cfg.smartPartUrl;
  
  // Setup Calendly button
  const calBtn = document.getElementById('cal-btn');
  if (calBtn && cfg.calendlyUrl) {
    calBtn.href = cfg.calendlyUrl;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const note = document.getElementById('form-note');
    
    if (!btn || !note) return;
    
    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      business: formData.get('business'),
      plan: formData.get('plan'),
      goal: formData.get('goal'),
      page: location.pathname,
      source: 'smartflow-site'
    };

    // Basic validation
    if (!payload.name?.trim() || !payload.email?.includes('@')) {
      note.textContent = 'Please fill in name and valid email.';
      note.style.color = '#d4af37';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    note.textContent = 'Submitting your brief...';
    note.style.color = '#9a8f80';

    try {
      const endpoint = cfg.leadWebhook || '/lead';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        form.innerHTML = `
          <div class="success">
            <h3>Thanks ${t(payload.name)}!</h3>
            <p>We'll review your brief and reply within 1 business day.</p>
            ${cfg.leadMagnetUrl ? `<p><a href="${cfg.leadMagnetUrl}" class="btn btn-ghost">Download our free pack</a></p>` : ''}
          </div>
        `;
      } else {
        throw new Error('Submission failed');
      }
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Send brief';
      note.textContent = 'Something went wrong. Please try again or email us directly.';
      note.style.color = '#d4af37';
      console.error('Lead submission error:', e);
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Set current year in footer
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load content
  await Promise.all([
    loadLatest(),
    loadPricingCards(),
    setupLeadForm()
  ]);
  
  // Start testimonials rotation
  rotateTestimonials();
});