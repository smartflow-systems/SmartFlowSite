document.addEventListener("DOMContentLoaded",()=>{fetch("/data/posts.json",{cache:"no-store"})
 .then(r=>r.json()).then(posts=>{const w=document.querySelector("#latest-posts"); if(!w)return;
 w.innerHTML=posts.slice(0,3).map(p=>`<a class="card" href="${p.url}" target="_blank" rel="noopener">
 <h4>${p.title}</h4><small class="muted">${p.date}</small><p>${p.snippet||""}</p></a>`).join("");})
 .catch(()=>{});});