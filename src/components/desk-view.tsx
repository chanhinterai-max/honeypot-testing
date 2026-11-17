import { useState } from "react";
import { ChevronDown, Lock, RefreshCw } from "lucide-react";
import type { Compare, DeskReport, RangeBand, Relation, Sale } from "../types";
import { PriceChart } from "./price-chart";
import { Tone } from "./tone";

function BandTable({ bands }: { bands: RangeBand[] }) {
  if (bands.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2 text-xs tracking-wide text-muted uppercase">
        <span>Low</span>
        <span>High</span>
        <span>Average</span>
      </div>
      {bands.map((band) => (
        <div key={band.window} className="mt-3 border-t border-line pt-3">
          <p className="text-sm text-fg">{band.window}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <Tone relation={band.vsLow}>{band.low}</Tone>
            <Tone relation={band.vsHigh}>{band.high}</Tone>
            <Tone relation={band.vsAvg}>{band.avg}</Tone>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareLine({ compare }: { compare: Compare }) {
  return (
    <p className="mt-2 text-sm">
      <span className="text-muted">{compare.label} </span>
      <span className="text-fg">{compare.compared}</span>
      <span className="text-muted"> · </span>
      <Tone relation={compare.relation}>{compare.delta}</Tone>
    </p>
  );
}

function Mark({ relation }: { relation: Relation }) {
  return (
    <Tone relation={relation}>
      {relation === "above" ? "Higher" : relation === "below" ? "Lower" : "Flat"}
    </Tone>
  );
}

function SaleList({ sales }: { sales: Sale[] }) {
  if (sales.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted">No sale has been locked.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {sales.map((sale) => (
        <li key={`${sale.date}-${sale.ticker}`} className="px-4 py-3 text-sm">
          <p className="text-fg">
            {sale.date} · {sale.ticker} {sale.name}
          </p>
          <p className="mt-1 text-muted">
            {sale.shares} shares at {sale.sellPrice} · proceeds {sale.proceeds} · cost {sale.costBasis}
          </p>
          <p className="mt-1">
            <Tone relation={sale.gainRelation}>{sale.gain}</Tone>
            {sale.note ? <span className="text-muted"> · {sale.note}</span> : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

function RealizedBar({
  total,
  relation,
  note,
  sales,
}: {
  total: string;
  relation: Relation;
  note: string;
  sales: Sale[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-xs tracking-wide text-muted uppercase">Realized</span>
          <span className="mt-1 block font-serif text-2xl">
            <Tone relation={relation}>{total}</Tone>
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-muted ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="border-t border-line">
          <p className="px-4 pt-3 text-sm text-muted">{note}</p>
          <SaleList sales={sales} />
        </div>
      ) : null}
    </section>
  );
}

export function DeskView({
  report,
  onLock,
  onUpdate,
  pending,
  note,
}: {
  report: DeskReport;
  onLock: () => void;
  onUpdate: () => void;
  pending: "lock" | "update" | null;
  note: string;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-brass uppercase">Harbour Desk</p>
          <h1 className="mt-2 font-serif text-4xl font-medium text-fg">Daily portfolio monitor</h1>
          <p className="mt-2 text-sm text-muted">{report.asOf}</p>
        </div>
        <div className="flex gap-2 self-start">
          <button
            type="button"
            onClick={onUpdate}
            disabled={pending !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-card bg-brass px-4 text-sm font-semibold text-brass-ink disabled:opacity-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {pending === "update" ? "Updating…" : "Update"}
          </button>
          <button
            type="button"
            onClick={onLock}
            disabled={pending !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-card border border-line bg-surface px-4 text-sm text-fg"
          >
            <Lock className="size-4" aria-hidden="true" />
            {pending === "lock" ? "Locking…" : "Lock"}
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-card border border-line bg-surface p-5 sm:col-span-1">
          <p className="text-xs tracking-wide text-muted uppercase">Capital left</p>
          <p className="mt-2 font-serif text-3xl text-fg">{report.capitalLeft}</p>
          <p className="mt-2 text-sm text-muted">Available pool after locked buys.</p>
        </article>
        <article className="min-w-0 rounded-card border border-line bg-surface p-5 sm:col-span-2">
          <p className="text-xs tracking-wide text-muted uppercase">Hang Seng Index</p>
          <p className="mt-2 font-serif text-3xl">
            <Tone relation={report.hsi.vsLast.relation}>{report.hsi.level}</Tone>
          </p>
          <CompareLine compare={report.hsi.vsLast} />
          <PriceChart chart={report.hsi.chart} />
          {note ? <p className="mt-2 text-sm text-down">{note}</p> : null}
        </article>
      </section>

      <section className="mt-4 rounded-card border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl text-fg">HSI versus recent ranges</h2>
        <BandTable bands={report.hsi.bands} />
      </section>

      <section className="mt-4 grid gap-4">
        {report.holdings.map((holding) => (
          <article key={holding.ticker} className="min-w-0 rounded-card border border-line bg-surface p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-serif text-2xl text-fg">
                {holding.ticker}
                <span className="ml-2 text-muted">{holding.name}</span>
              </h2>
              <p className="text-sm text-muted">{holding.track}</p>
            </div>
            <div className="mt-4 rounded-card border border-line bg-surface-2 p-4">
              <p className="text-xs tracking-wide text-muted uppercase">Recommendation</p>
              <p className="mt-1 font-serif text-3xl">
                <Tone relation={holding.advice.tone}>{holding.advice.action}</Tone>
              </p>
              <p className="mt-2 text-sm text-fg">
                {holding.advice.action === "Buy"
                  ? `Buy at or below ${holding.advice.buyAt}`
                  : holding.advice.action === "Sell"
                    ? `Sell from ${holding.advice.sellAt}`
                    : "Hold"}
              </p>
              <p className="mt-1 text-sm text-muted">
                Buy at or below {holding.advice.buyAt} · sell {holding.advice.sellAt}
              </p>
              <p className="mt-1 text-sm text-muted">{holding.advice.note}</p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Price</dt>
                <dd className="mt-1 text-lg">
                  <Tone relation={holding.priceRelation}>{holding.price}</Tone>
                </dd>
                <dd className="mt-1 text-xs">
                  <Mark relation={holding.priceRelation} />
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Market value</dt>
                <dd className="mt-1 text-lg text-fg">{holding.marketValue}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Unrealized</dt>
                <dd className="mt-1 text-lg">
                  <Tone relation={holding.unrealizedRelation}>{holding.unrealized}</Tone>
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">Realized</dt>
                <dd className="mt-1 text-lg">
                  <Tone relation={holding.realizedRelation}>{holding.realized}</Tone>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-muted">{holding.priceDelta}</p>
            <p className="mt-1 text-sm text-muted">
              {holding.shares} shares · average {holding.avgCost} · cost {holding.totalCost}
            </p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs tracking-wide text-muted uppercase">Versus purchase</p>
              <p className="mt-1 text-sm text-muted">{holding.purchase.asOf}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {holding.purchase.marks.map((mark) => (
                  <div key={mark.label}>
                    <p className="text-xs tracking-wide text-muted uppercase">{mark.label}</p>
                    <p className="mt-1 text-sm text-fg">
                      {mark.at}
                      <span className="text-muted"> vs </span>
                      {mark.latest}
                    </p>
                    <p className="mt-1 text-sm">
                      <Tone relation={mark.relation}>{mark.delta}</Tone>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <PriceChart chart={holding.chart} />
            <p className="mt-3 text-sm text-fg">{holding.thesis}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs tracking-wide text-muted uppercase">Price versus ranges</p>
              <BandTable bands={holding.bands} />
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs tracking-wide text-muted uppercase">Sub-index</p>
              <p className="mt-2 font-serif text-xl text-fg">{holding.subIndex.name}</p>
              <p className="mt-1 text-lg">
                <Tone relation={holding.subIndex.vsLast.relation}>{holding.subIndex.level}</Tone>
              </p>
              <CompareLine compare={holding.subIndex.vsLast} />
              <BandTable bands={holding.subIndex.bands} />
              <p className="mt-3 text-sm text-muted">{holding.subIndex.bandNote}</p>
            </div>
          </article>
        ))}
      </section>

      <RealizedBar
        total={report.realizedTotal}
        relation={report.realizedRelation}
        note={report.realizedNote}
        sales={report.sales}
      />

      <section className="mt-4 rounded-card border border-line bg-surface-2 p-5">
        <h2 className="font-serif text-2xl text-fg">Notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg">
          {report.alerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">{report.confidence}</p>
        <p className="mt-2 text-sm text-muted">{report.source}</p>
        <p className="mt-4 text-xs text-muted">
          Not a recommendation and not a guarantee. Verify prices independently before any order.
        </p>
      </section>
    </main>
  );
}
