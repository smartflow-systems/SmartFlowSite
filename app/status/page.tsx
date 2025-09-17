// Simple CI Status page (brand: black + gold)
export const metadata = { title: "Status • SmartFlow" };
export default function StatusPage() {
  const actionsUrl = "https://github.com/smartflow-systems/SmartFlowSite/actions";
  const badge = "https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/deploy.yml/badge.svg";
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <section className="max-w-2xl mx-auto rounded-2xl p-6" style={{border:'1px solid #FFD700'}}>
        <h1 className="text-2xl font-semibold">System Status</h1>
        <p className="mt-2 text-sm text-[#F5F5DC]">Zero-touch deploys with GitHub Actions.</p>
        <div className="mt-4 bg-black/40 rounded-xl p-4">
          {/* Live badge */}
          {/* eslint-disable @next/next/no-img-element */}
          <img alt="Deploy status" src={badge} />
          <div className="mt-3">
            <a className="underline" href={actionsUrl} target="_blank" rel="noreferrer">View workflow runs →</a>
          </div>
        </div>
        <div className="mt-6 text-sm text-[#F5F5DC]">
          Latest marker file lives in <code>.sfs/health/</code>. Each commit should trigger CI.
        </div>
      </section>
    </main>
  );
}
