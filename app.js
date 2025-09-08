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
        // Safe DOM manipulation instead of innerHTML with user data
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        
        const heading = document.createElement('h3');
        heading.textContent = `Thanks ${payload.name}!`; // textContent auto-escapes
        
        const message = document.createElement('p');
        message.textContent = "We'll review your brief and reply within 1 business day.";
        
        successDiv.appendChild(heading);
        successDiv.appendChild(message);
        
        if (cfg.leadMagnetUrl) {
          const linkPara = document.createElement('p');
          const link = document.createElement('a');
          link.href = cfg.leadMagnetUrl;
          link.className = 'btn btn-ghost';
          link.textContent = 'Download our free pack';
          linkPara.appendChild(link);
          successDiv.appendChild(linkPara);
        }
        
        form.innerHTML = ''; // Clear form
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
});async function loadCfg(){return (await fetch("site.config.json")).json()}
function timeAgo(d){const s=Math.floor((Date.now()-d.getTime())/1e3),t=[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]];for(const[sec,l]of t){const v=Math.floor(s/sec);if(v>=1)return`${v}${l} ago`}return`${s}s ago`}
async function renderLatest(){const w=document.querySelector("#latest-feed");if(!w)return;const{projects}=await loadCfg(),k="sf_latest_v1",ttl=9e5;try{const c=JSON.parse(localStorage.getItem(k)||"null");if(c&&Date.now()-c.when<ttl){w.innerHTML=c.html;return}}catch(e){}const cs=[];for(const p of projects){if(!p.repo)continue;try{const r=await fetch(`https://api.github.com/repos/${p.repo}/commits?per_page=3`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)continue;const data=await r.json();for(const c of data){cs.push({repo:p.repo.split("/")[1],msg:(c.commit?.message||"Update").split("\n")[0],url:c.html_url,when:new Date(c.commit?.author?.date||c.commit?.committer?.date||Date.now())})}}catch(e){}}cs.sort((a,b)=>b.when-a.when);const top=cs.slice(0,3);if(!top.length){w.innerHTML="<p class=\"latest-item\">No recent updates yet.</p>";return}w.innerHTML=top.map(c=>`<article class="latest-item"><h3>${c.msg}</h3><div class="latest-meta"><span class="latest-repo">${c.repo}</span><span>⏱ ${timeAgo(c.when)}</span></div><div class="latest-actions"><a class="link" href="${c.url}" target="_blank" rel="noopener">View commit →</a></div></article>`).join("");try{localStorage.setItem(k,JSON.stringify({when:Date.now(),html:w.innerHTML}))}catch(e){}}
document.addEventListener("DOMContentLoaded",()=>{typeof renderProjects==="function"&&renderProjects();renderLatest()})
