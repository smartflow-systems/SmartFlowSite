export default function Home() {
  return (
    <main style={{padding:20,fontFamily:"ui-sans-serif"}}>
      <h1>SmartFlowSite</h1>
      <p>API health: <a href="/api/health">/api/health</a></p>
      <p>GH sync: <a href="/api/gh-sync">/api/gh-sync</a></p>
    </main>
  );
}
