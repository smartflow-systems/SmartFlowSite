// Latest posts loader + testimonials rotator

async function loadLatest() {
  const target = document.getElementById('latest-list');
  if (!target) return;

  try {
    const res = await fetch('data/posts.json', { cache: 'no-store' });
    const items = await res.json();

    // sort by date desc and take top 3
    items.sort((a,b)=> new Date(b.date) - new Date(a.date));
    const top3 = items.slice(0,3);

    target.innerHTML = top3.map(p => `
      <article class="latest-card">
        <a href="${p.url}">
          <h3>${p.title}</h3>
        </a>
        <time datetime="${p.date}">${new Date(p.date).toLocaleDateString()}</time>
      </article>
    `).join('');
  } catch (e) {
    target.innerHTML = `<p class="muted">No posts yet.</p>`;
    console.error('Latest load error', e);
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

document.addEventListener('DOMContentLoaded', () => {
  loadLatest();
  rotateTestimonials();
});