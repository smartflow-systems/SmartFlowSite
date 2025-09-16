export default function Home(){
  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif"}}>
      <h1>SmartFlowSite <span style={{color:"#FFD700"}}>✓</span></h1>
      <p><a href="/api/health" style={{color:"#FFD700"}}>/api/health</a> • <a href="/api/gh-sync" style={{color:"#FFD700"}}>/api/gh-sync</a></p>
    </main>
  );
}
