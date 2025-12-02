const apiUrl = (process.env.SFS_API_URL || "").replace(/\/+$/,"");
const token  = process.env.SFS_TOKEN || "";
const apiKey = process.env.SFS_API_KEY || "";
if (!apiUrl) { console.error("Missing SFS_API_URL"); process.exit(1); }
if (!token && !apiKey) { console.error("Set SFS_TOKEN or SFS_API_KEY in Replit Secrets."); process.exit(1); }
const opts = { method: "GET", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(apiKey ? { "x-api-key": apiKey } : {}) } };
const candidates = ["/v1/me","/v1/projects","/me"];
(async () => { for (const p of candidates) { const url = apiUrl + p; try { const res = await fetch(url, opts); console.log(`GET ${url} → ${res.status}`); const t = await res.text(); console.log(t.slice(0,500)); if (res.ok) process.exit(0); } catch(e){ console.error(`Network error for ${url}:`, e.message); } } process.exit(2); })();
