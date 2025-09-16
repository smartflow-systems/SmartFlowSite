import http from "node:http";
const PORT = process.env.PORT || 3000;
const ok = (res, body, type="text/plain") => { res.writeHead(200, {"content-type": type}); res.end(body); };
const routes = {
  "/":            (_req, res) => ok(res, "SmartFlowSite ✓ (emergency online)"),
  "/api/health":  (_req, res) => ok(res, JSON.stringify({ ok:true, service:"SmartFlowSite", via:"emergency", ts:Date.now() }), "application/json"),
  "/api/gh-sync": (req, res) => {
    if (req.method === "POST") { let d=""; req.on("data",c=>d+=c); req.on("end",()=> ok(res, JSON.stringify({ ok:true, route:"gh-sync", method:"POST", body:d?JSON.parse(d):{} }), "application/json")); }
    else ok(res, JSON.stringify({ ok:true, route:"gh-sync", method:"GET" }), "application/json");
  },
};
http.createServer((req, res) => (routes[req.url] || routes["/"])(req, res)).listen(PORT, () => {
  console.log(`EMERGENCY ONLINE on :${PORT}`);
});
