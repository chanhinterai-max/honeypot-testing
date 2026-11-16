export function DeskView({ report }: { report: any }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-serif mb-6">Portfolio Desk</h1>
      <p className="mb-4">Welcome. This is the Honeypot Testing desk view.</p>
      <div className="rounded border border-line p-4 bg-surface">
        <p>Holdings summary (from daily monitor):</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>2388.HK ~HK$49.6 (MV ~HK$49.6k)</li>
          <li>0728.HK ~HK$4.445 (MV ~HK$26.7k)</li>
          <li>Total MV ~HK$76.3k</li>
          <li>Remaining capital ~HK$104k</li>
        </ul>
      </div>
      <p className="mt-6 text-xs text-gray-500">Full original desk components are being restored. Sign-out available via session clear.</p>
    </main>
  );
}
