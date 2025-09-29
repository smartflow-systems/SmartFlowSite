(async function(){
  const el=document.querySelector("#latest"); if(!el) return;
  try{
    const r=await fetch("/updates.json",{cache:"no-store"});
    const items=(await r.json()).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
    el.innerHTML = items.map(i=>`
      <article class="card">
        <h3><a href="${i.url}" target="_blank" rel="noopener">${i.title}</a></h3>
        <p class="muted">${new Date(i.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</p>
        <p class="muted">${i.summary||""}</p>
        <a class="btn" href="${i.url}" target="_blank" rel="noopener">Read →</a>
      </article>`).join("");
  }catch(e){ el.innerHTML=`<p class="muted">Couldn’t load updates.</p>`; }
})();
