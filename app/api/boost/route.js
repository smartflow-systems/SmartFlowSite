let count = 0;
export async function GET() {
  count++;
  return new Response(JSON.stringify({
    ok: true, boost: "#smartflow", count, ts: new Date().toISOString()
  }), { headers: { "content-type": "application/json" }});
}
