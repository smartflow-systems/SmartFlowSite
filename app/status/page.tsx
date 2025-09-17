export const metadata = { title: "Status • SmartFlow" };
async function getHealth() {
  try { const r = await fetch("/api/health", { cache:"no-store" }); return r.ok ? r.json() : null; }
  catch { return null; }
}
export default async function StatusPage() {
  const data = await getHealth();
  const actionsUrl = "https://github.com/smartflow-systems/SmartFlowSite/actions";
  const badge = "https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sfs-ping.yml/badge.svg";
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <section className="max-w-2xl mx-auto rounded-2xl p-6" style={{border:'1px solid #FFD700'}}>
        <h1 className="text-2xl font-semibold">System Status</h1>
        <p className="mt-2 text-sm text-[#F5F5DC]">Zero-touch deploys with GitHub Actions.</p>
        <div className="mt-4 bg-black/40 rounded-xl p-4">
          {/* eslint-disable @next/next/no-img-element */}
          <img alt="Ping status" src={badge} />
          <div className="mt-3"><a className="underline" href={actionsUrl} target="_blank" rel="noreferrer">View workflow runs →</a></div>
        </div>
        <div className="mt-6 text-sm text-[#F5F5DC] font-mono">
          {data ? (
            <>
              <div>latest: <code>{String(data.file)}</code></div>
              {"commit" in data && <div>commit: <code>{String(data.commit)}</code></div>}
              {"kernel" in data && <div>runner: <code>{String(data.kernel)}</code></div>}
            </>
          ) : <div>No marker yet. Push one under <code>.sfs/health</code>.</div>}
        </div>
      </section>
    </main>
  );
}
