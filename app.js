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

    // Clear existing content safely
    target.textContent = '';
    
    if (top3.length > 0) {
      top3.forEach(p => {
        const article = document.createElement('article');
        article.className = 'latest-card';
        
        const link = document.createElement('a');
        link.href = p.url || p.link || '#';
        
        const h3 = document.createElement('h3');
        h3.textContent = p.title || '';
        link.appendChild(h3);
        
        const time = document.createElement('time');
        time.dateTime = p.date || '';
        time.textContent = new Date(p.date).toLocaleDateString();
        
        article.appendChild(link);
        article.appendChild(time);
        target.appendChild(article);
      });
    } else {
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
    
    // Create pricing cards using safe DOM methods
    plans.forEach(plan => {
      const article = document.createElement('article');
      article.className = `pricing-card ${plan.popular ? 'popular' : ''}`;
      
      // Add popular badge if needed
      if (plan.popular) {
        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = 'Most Popular';
        article.appendChild(badge);
      }
      
      // Create header section
      const header = document.createElement('header');
      header.className = 'plan-header';
      
      const h3 = document.createElement('h3');
      h3.textContent = plan.name || '';
      header.appendChild(h3);
      
      const subtitle = document.createElement('p');
      subtitle.className = 'subtitle';
      subtitle.textContent = plan.subtitle || '';
      header.appendChild(subtitle);
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'price';
      priceDiv.textContent = plan.price || '';
      
      const period = document.createElement('span');
      period.className = 'period';
      period.textContent = `/${plan.period || ''}`;
      priceDiv.appendChild(period);
      header.appendChild(priceDiv);
      
      article.appendChild(header);
      
      // Create features list
      const featuresList = document.createElement('ul');
      featuresList.className = 'features';
      (plan.features || []).forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
      });
      article.appendChild(featuresList);
      
      // Create footer section
      const footer = document.createElement('footer');
      footer.className = 'plan-footer';
      
      const link = document.createElement('a');
      link.href = `book.html?plan=${encodeURIComponent(plan.id || '')}`;
      link.className = `btn ${plan.popular ? 'btn-gold' : 'btn-ghost'} btn-full`;
      link.textContent = `Choose ${plan.name || ''}`;
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
async function renderLatest(){const w=document.querySelector("#latest-feed");if(!w)return;const{projects}=await loadCfg(),k="sf_latest_v1",ttl=9e5;try{const c=JSON.parse(localStorage.getItem(k)||"null");if(c&&Date.now()-c.when<ttl){w.textContent='';const temp=document.createElement('div');temp.innerHTML=c.html;while(temp.firstChild)w.appendChild(temp.firstChild);return}}catch(e){}const cs=[];for(const p of projects){if(!p.repo)continue;try{const r=await fetch(`https://api.github.com/repos/${p.repo}/commits?per_page=3`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)continue;const data=await r.json();for(const c of data){cs.push({repo:p.repo.split("/")[1],msg:(c.commit?.message||"Update").split("\n")[0],url:c.html_url,when:new Date(c.commit?.author?.date||c.commit?.committer?.date||Date.now())})}}catch(e){}}cs.sort((a,b)=>b.when-a.when);const top=cs.slice(0,3);w.textContent='';if(!top.length){const p=document.createElement('p');p.className='latest-item';p.textContent='No recent updates yet.';w.appendChild(p);return}top.forEach(c=>{const article=document.createElement('article');article.className='latest-item';const h3=document.createElement('h3');h3.textContent=c.msg;const meta=document.createElement('div');meta.className='latest-meta';const repo=document.createElement('span');repo.className='latest-repo';repo.textContent=c.repo;const time=document.createElement('span');time.textContent=`⏱ ${timeAgo(c.when)}`;meta.appendChild(repo);meta.appendChild(time);const actions=document.createElement('div');actions.className='latest-actions';const link=document.createElement('a');link.className='link';link.href=c.url;link.target='_blank';link.rel='noopener';link.textContent='View commit →';actions.appendChild(link);article.appendChild(h3);article.appendChild(meta);article.appendChild(actions);w.appendChild(article)});try{localStorage.setItem(k,JSON.stringify({when:Date.now(),html:w.innerHTML}))}catch(e){}}
document.addEventListener("DOMContentLoaded",()=>{typeof renderProjects==="function"&&renderProjects();renderLatest()})
