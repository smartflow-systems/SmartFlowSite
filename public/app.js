const $=q=>document.querySelector(q);
(async()=>{
 const b=$("#copyBtn"),c=$("#copyCnt"); if(b) b.onclick=async()=>{await navigator.clipboard.writeText(location.origin+"/api/boost"); c.textContent=+c.textContent+1;}
 const u=await fetch("./updates.json").then(r=>r.json()).catch(()=>[]);
 $("#latest").innerHTML=u.map(p=>`<a class=card href="${p.url}"><b>${p.title}</b><div class=muted>${p.date}</div></a>`).join("")||"<div class=muted>No updates yet.</div>";
 const t=await fetch("./testimonials.json").then(r=>r.json()).catch(()=>[]);
 $("#proof").innerHTML=t.map(x=>`<div class=card>“${x.quote}”<div class=muted>— ${x.name}</div></div>`).join("");
})();
