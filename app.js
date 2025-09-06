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
      // Clear existing content safely
      target.textContent = '';
      
      // Create elements safely using DOM methods
      top3.forEach(p => {
        const article = document.createElement('article');
        article.className = 'latest-card';
        
        const link = document.createElement('a');
        link.href = t(p.url || p.link || '#');
        
        const title = document.createElement('h3');
        title.textContent = p.title || '';
        link.appendChild(title);
        
        const time = document.createElement('time');
        time.setAttribute('datetime', p.date || '');
        time.textContent = new Date(p.date).toLocaleDateString();
        
        article.appendChild(link);
        article.appendChild(time);
        target.appendChild(article);
      });
    } else {
      target.textContent = '';
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'No posts yet.';
      target.appendChild(p);
    }
  } catch (e) {
    target.textContent = '';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'No posts yet.';
    target.appendChild(p);
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

    // Clear existing content safely
    target.textContent = '';
    
    // Create elements safely using DOM methods
    plans.forEach(plan => {
      const article = document.createElement('article');
      article.className = `pricing-card ${plan.popular ? 'popular' : ''}`;
      
      // Add badge if popular
      if (plan.popular) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = 'Most Popular';
        article.appendChild(badge);
      }
      
      // Create header
      const header = document.createElement('header');
      header.className = 'plan-header';
      
      const h3 = document.createElement('h3');
      h3.textContent = t(plan.name);
      header.appendChild(h3);
      
      const subtitle = document.createElement('p');
      subtitle.className = 'subtitle';
      subtitle.textContent = t(plan.subtitle);
      header.appendChild(subtitle);
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'price';
      priceDiv.textContent = t(plan.price);
      
      const periodSpan = document.createElement('span');
      periodSpan.className = 'period';
      periodSpan.textContent = `/${t(plan.period)}`;
      priceDiv.appendChild(periodSpan);
      header.appendChild(priceDiv);
      
      article.appendChild(header);
      
      // Create features list
      const featuresList = document.createElement('ul');
      featuresList.className = 'features';
      (plan.features || []).forEach(feature => {
        const li = document.createElement('li');
        li.textContent = t(feature);
        featuresList.appendChild(li);
      });
      article.appendChild(featuresList);
      
      // Create footer with safe link
      const footer = document.createElement('footer');
      footer.className = 'plan-footer';
      
      const link = document.createElement('a');
      link.href = `book.html?plan=${encodeURIComponent(t(plan.id))}`;
      link.className = `btn ${plan.popular ? 'btn-gold' : 'btn-ghost'} btn-full`;
      link.textContent = `Choose ${t(plan.name)}`;
      
      footer.appendChild(link);
      article.appendChild(footer);
      target.appendChild(article);
    });
  } catch (e) {
    target.textContent = '';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Pricing data unavailable.';
    target.appendChild(p);
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
        // Clear form and create success message safely
        form.textContent = '';
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        
        const h3 = document.createElement('h3');
        h3.textContent = `Thanks ${t(payload.name)}!`;
        successDiv.appendChild(h3);
        
        const p1 = document.createElement('p');
        p1.textContent = 'We\'ll review your brief and reply within 1 business day.';
        successDiv.appendChild(p1);
        
        if (cfg.leadMagnetUrl) {
          const p2 = document.createElement('p');
          const link = document.createElement('a');
          link.href = cfg.leadMagnetUrl;
          link.className = 'btn btn-ghost';
          link.textContent = 'Download our free pack';
          p2.appendChild(link);
          successDiv.appendChild(p2);
        }
        
        form.appendChild(successDiv);
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