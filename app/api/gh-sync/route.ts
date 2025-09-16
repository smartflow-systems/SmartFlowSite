export async function GET(){ return Response.json({ ok:true, route:"gh-sync", method:"GET", via:"app-router" }); }
export async function POST(req:Request){ const body=await req.json().catch(()=>({})); return Response.json({ ok:true, route:"gh-sync", method:"POST", body, via:"app-router" }); }
