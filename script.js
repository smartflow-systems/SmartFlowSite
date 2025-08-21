async function loadConfig(){
  try{
    const res = await fetch("/api/config");
    const cfg = await res.json();
    document.getElementById("siteName").textContent = cfg.siteName || "SmartFlow Systems";
    document.getElementById("tagline").textContent = cfg.tagline || "";
    
    // Set the site URL link in navigation
    const siteUrl = cfg.siteUrl || window.location.origin;
    document.getElementById("siteUrl").href = siteUrl;
    
    if (cfg.calendlyUrl) {
      const a = document.getElementById("bookLink");
      a.href = cfg.calendlyUrl;
      a.textContent = "Book a Demo";
    }
    if (cfg.leadMagnetUrl) {
      const g = document.getElementById("leadMagnet");
      g.href = cfg.leadMagnetUrl;
      g.textContent = "Download Guide";
    }
  }catch(e){console.warn("Config load failed", e);}
}
async function submitLead(evt){
  evt.preventDefault();
  const form = evt.target;
  const status = document.getElementById("leadStatus");
  status.textContent = "Sending…";
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim()
  };
  try{
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) {
      status.textContent = "Thanks! We'll be in touch.";
      form.reset();
    } else {
      status.textContent = data.error || "Something went wrong.";
    }
  }catch(e){
    status.textContent = "Network error.";
  }
}
document.getElementById("leadForm").addEventListener("submit", submitLead);
document.getElementById("year").textContent = new Date().getFullYear();
loadConfig();