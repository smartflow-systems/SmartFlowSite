// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    const el=document.querySelector(id);
    if(!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth'});
    history.pushState(null,'',id); // why: keep URL hash in sync for sharing
  });
});

// Reveal-on-scroll
const io=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target); // why: one-time reveal for perf
    }
  });
},{threshold:.16});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Sticky nav shadow
const nav=document.querySelector('nav');
const toggleNavShadow=()=>{
  if(window.scrollY>8) nav.classList.add('nav-shadow');
  else nav.classList.remove('nav-shadow');
};
toggleNavShadow();
window.addEventListener('scroll',toggleNavShadow,{passive:true});

// Ripple
document.addEventListener('click',e=>{
  const btn=e.target.closest('.btn');
  if(!btn) return;
  const circle=document.createElement('span');
  circle.className='ripple';
  const rect=btn.getBoundingClientRect();
  circle.style.left=`${e.clientX-rect.left}px`;
  circle.style.top=`${e.clientY-rect.top}px`;
  btn.appendChild(circle);
  setTimeout(()=>circle.remove(),450);
});