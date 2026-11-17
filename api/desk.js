import { createHmac, timingSafeEqual } from "node:crypto";

const USERNAME = "peter";
const CODE = "051203#Interpol";
const COOKIE = "harbour_desk";

const WINDOWS = [
  { label: "1 month", key: "1M", months: 1 },
  { label: "3 months", key: "3M", months: 3 },
  { label: "6 months", key: "6M", months: 6 },
];

const BOOK = [
  {
    ticker: "2388.HK",
    symbol: "2388.HK",
    name: "BOC Hong Kong",
    track: "Income / Defensive · banking core",
    shares: 1000,
    shareLabel: "1,000",
    avgCost: 49.26,
    totalCost: 49457.48,
    lots: [{ date: "2026-10-23", shares: 1000, price: 49.26 }],
    buyBelow: 47.5,
    sellFrom: 55,
    sellTo: 57.5,
    thesis: "Active. Quality banking core. Q3 results due around 30 Oct.",
    adviceNote: "Add only at or below the buy price. Trim inside the sell band.",
    subSymbol: "^HSNF",
    subName: "Hang Seng Financial Classification",
  },
  {
    ticker: "0728.HK",
    symbol: "0728.HK",
    name: "China Telecom",
    track: "Income / Defensive · telecom satellite",
    shares: 6000,
    shareLabel: "6,000",
    avgCost: 4.35,
    totalCost: 26259.21,
    lots: [{ date: "2026-10-23", shares: 6000, price: 4.35 }],
    buyBelow: 4.2,
    sellFrom: 5.5,
    sellTo: 5.7,
    thesis: "Active. Income satellite. Near-term profit pressure; yield still the support.",
    adviceNote: "Hold for the yield. Add only at or below the buy price.",
    subSymbol: "^HSNU",
    subName: "Hang Seng Utilities Classification",
  },
];

function relation(current, compared) {
  if (current > compared + 1e-9) return "above";
  if (current < compared - 1e-9) return "below";
  return "flat";
}

function figureRelation(figure, current) {
  if (figure > current + 1e-9) return "above";
  if (figure < current - 1e-9) return "below";
  return "flat";
}

function num(n, digits = 2) {
  return new Intl.NumberFormat("en-HK", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function hkd(n) {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function signedHkd(n) {
  const body = hkd(Math.abs(n));
  if (n > 0) return `+${body}`;
  if (n < 0) return `−${body}`;
  return body;
}

function pct(current, compared) {
  const delta = ((current - compared) / compared) * 100;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta).toFixed(2)}%`;
}

function pts(current, compared) {
  const delta = current - compared;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta).toFixed(2)}`;
}

function compare(label, current, compared) {
  return {
    label,
    compared: num(compared),
    relation: relation(current, compared),
    delta: `${pts(current, compared)} (${pct(current, compared)})`,
  };
}

function shiftMonths(iso, months) {
  const [year, month, day] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1 - months, day));
  return dt.toISOString().slice(0, 10);
}

function sliceWindow(bars, months) {
  const end = bars[bars.length - 1]?.date;
  if (!end) return [];
  const start = shiftMonths(end, months);
  return bars.filter((bar) => bar.date > start && bar.date <= end);
}

function band(window, current, bars, months) {
  const slice = sliceWindow(bars, months);
  const low = Math.min(...slice.map((bar) => bar.low));
  const high = Math.max(...slice.map((bar) => bar.high));
  const avg = slice.reduce((sum, bar) => sum + bar.close, 0) / slice.length;
  return {
    window,
    low: num(low),
    high: num(high),
    avg: num(avg),
    vsLow: figureRelation(low, current),
    vsHigh: figureRelation(high, current),
    vsAvg: figureRelation(avg, current),
  };
}

function bandsFor(current, bars) {
  return WINDOWS.map((window) => band(window.label, current, bars, window.months));
}

function chartFor(bars) {
  const points = sliceWindow(bars, 6).map((bar) => ({ date: bar.date, close: bar.close }));
  const levels = WINDOWS.map((window) => {
    const slice = sliceWindow(bars, window.months);
    return {
      window: window.key,
      low: Math.min(...slice.map((bar) => bar.low)),
      high: Math.max(...slice.map((bar) => bar.high)),
    };
  });
  return { points, levels };
}

function adviceFor(price, buyBelow, sellFrom, sellTo, note) {
  const sellAt = `${num(sellFrom)}–${num(sellTo)}`;
  if (price <= buyBelow + 1e-9) {
    return { action: "Buy", tone: "above", buyAt: num(buyBelow), sellAt, note };
  }
  if (price >= sellFrom - 1e-9) {
    return { action: "Sell", tone: "below", buyAt: num(buyBelow), sellAt, note };
  }
  return { action: "Hold", tone: "flat", buyAt: num(buyBelow), sellAt, note };
}

function dayKey(unix) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(unix * 1000));
}

async function loadSeries(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=8mo`;
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Quote failed for ${symbol}.`);
  const body = await response.json();
  const result = body.chart?.result?.[0];
  const times = result?.timestamp ?? [];
  const quote = result?.indicators?.quote?.[0];
  const bars = [];
  for (let i = 0; i < times.length; i += 1) {
    const high = quote?.high?.[i];
    const low = quote?.low?.[i];
    const close = quote?.close?.[i];
    if (high == null || low == null || close == null) continue;
    bars.push({ date: dayKey(times[i]), high, low, close });
  }
  if (bars.length < 40) throw new Error(`Not enough bars for ${symbol}.`);
  const price = result?.meta?.regularMarketPrice ?? bars[bars.length - 1].close;
  return { price, previous: bars[bars.length - 2].close, bars };
}

function prettyDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function closeOn(bars, date) {
  const exact = bars.find((row) => row.date === date);
  if (exact) return exact.close;
  const earlier = [...bars].reverse().find((row) => row.date <= date);
  if (earlier) return earlier.close;
  return bars[0].close;
}

function purchaseFor(lots, avgCost, price, hsiBars, hsiPrice, subBars, subPrice, subName) {
  const dates = lots.map((lot) => lot.date);
  const hsiAt = dates.reduce((sum, date) => sum + closeOn(hsiBars, date), 0) / dates.length;
  const subAt = dates.reduce((sum, date) => sum + closeOn(subBars, date), 0) / dates.length;
  const asOf = `${prettyDate(dates[0])} session close`;
  const mark = (label, at, latest) => ({
    label,
    at: num(at),
    latest: num(latest),
    relation: relation(latest, at),
    delta: pct(latest, at),
  });
  return {
    asOf,
    marks: [mark("Stock", avgCost, price), mark("HSI", hsiAt, hsiPrice), mark(subName, subAt, subPrice)],
  };
}

export async function pullReport() {
  const [hsi, ...rest] = await Promise.all([
    loadSeries("^HSI"),
    ...BOOK.map(async (row) => ({
      row,
      series: await loadSeries(row.symbol),
      sub: await loadSeries(row.subSymbol),
    })),
  ]);

  const holdings = rest.map(({ row, series, sub }) => {
    const value = row.shares * series.price;
    const pnl = value - row.totalCost;
    return {
      ticker: row.ticker,
      name: row.name,
      track: row.track,
      shares: row.shareLabel,
      avgCost: hkd(row.avgCost),
      totalCost: hkd(row.totalCost),
      price: hkd(series.price),
      priceRelation: relation(series.price, series.previous),
      priceDelta: `${pts(series.price, series.previous)} (${pct(series.price, series.previous)}) vs prior close ${hkd(series.previous)}`,
      marketValue: hkd(value),
      unrealized: `${signedHkd(pnl)} (${pct(value, row.totalCost)})`,
      unrealizedRelation: relation(value, row.totalCost),
      realized: signedHkd(0),
      realizedRelation: "flat",
      advice: adviceFor(series.price, row.buyBelow, row.sellFrom, row.sellTo, row.adviceNote),
      chart: chartFor(series.bars),
      thesis: row.thesis,
      bands: bandsFor(series.price, series.bars),
      purchase: purchaseFor(row.lots, row.avgCost, series.price, hsi.bars, hsi.price, sub.bars, sub.price, row.subName),
      subIndex: {
        name: row.subName,
        level: num(sub.price),
        vsLast: compare("Last market day", sub.price, sub.previous),
        bands: bandsFor(sub.price, sub.bars),
        bandNote:
          "Low is the lowest daily low, high is the highest daily high, and average is the mean of daily closes over that calendar window.",
      },
    };
  });

  const stamped = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Hong_Kong",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

  return {
    asOf: `${stamped} HKT`,
    confidence: "Medium — live daily bars, refreshed on update",
    capitalLeft: hkd(74283.31),
    realizedTotal: signedHkd(0),
    realizedRelation: "flat",
    realizedNote: "Accumulated realized result is zero. No sale has been locked.",
    sales: [],
    hsi: {
      level: num(hsi.price),
      vsLast: compare("Last market day close", hsi.price, hsi.previous),
      bands: bandsFor(hsi.price, hsi.bars),
      chart: chartFor(hsi.bars),
    },
    holdings,
    alerts: [
      "Hold unless the live price is at or below the buy price, or inside the sell band.",
      "Chart lines are the period low (red) and period high (green). 1 month is the lightest, 6 months the darkest.",
    ],
    source:
      "Daily bars from Yahoo Finance. Low is the lowest daily low and high is the highest daily high in each calendar window. Costs are the locked fills.",
  };
}

function token() {
  return createHmac("sha256", CODE).update(`harbour-desk-v1:${USERNAME}`).digest("hex");
}

function safeEqual(given, expected) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function cookieHeader(req) {
  return req.headers?.cookie || req.headers?.Cookie || "";
}

export function authed(req) {
  const jar = Object.fromEntries(
    String(cookieHeader(req))
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf("=");
        return [part.slice(0, i), part.slice(i + 1)];
      }),
  );
  return jar[COOKIE] === token();
}

export function checkLogin(username, code) {
  return safeEqual(String(username || ""), USERNAME) && safeEqual(String(code || ""), CODE);
}

export function sessionCookie(maxAge) {
  const secure = "; Secure";
  return `${COOKIE}=${maxAge ? token() : ""}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}
