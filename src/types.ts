export type Relation = "above" | "below" | "flat";

export type Compare = {
  label: string;
  compared: string;
  relation: Relation;
  delta: string;
};

export type RangeBand = {
  window: string;
  low: string;
  high: string;
  avg: string;
  vsLow: Relation;
  vsHigh: Relation;
  vsAvg: Relation;
};

export type AdviceAction = "Buy" | "Hold" | "Sell";

export type PricePoint = { date: string; close: number };

export type ChartLevel = { window: "1M" | "3M" | "6M"; low: number; high: number };

export type PriceChart = { points: PricePoint[]; levels: ChartLevel[] };

export type Sale = {
  date: string;
  ticker: string;
  name: string;
  shares: string;
  sellPrice: string;
  proceeds: string;
  costBasis: string;
  gain: string;
  gainRelation: Relation;
  note: string;
};

export type PurchaseMark = {
  label: string;
  at: string;
  latest: string;
  relation: Relation;
  delta: string;
};

export type Holding = {
  ticker: string;
  name: string;
  track: string;
  shares: string;
  avgCost: string;
  totalCost: string;
  price: string;
  priceRelation: Relation;
  priceDelta: string;
  marketValue: string;
  unrealized: string;
  unrealizedRelation: Relation;
  realized: string;
  realizedRelation: Relation;
  advice: {
    action: AdviceAction;
    tone: Relation;
    buyAt: string;
    sellAt: string;
    note: string;
  };
  chart: PriceChart;
  thesis: string;
  bands: RangeBand[];
  purchase: { asOf: string; marks: PurchaseMark[] };
  subIndex: {
    name: string;
    level: string;
    vsLast: Compare;
    bands: RangeBand[];
    bandNote: string;
  };
};

export type DeskReport = {
  asOf: string;
  confidence: string;
  capitalLeft: string;
  realizedTotal: string;
  realizedRelation: Relation;
  realizedNote: string;
  sales: Sale[];
  hsi: {
    level: string;
    vsLast: Compare;
    bands: RangeBand[];
    chart: PriceChart;
  };
  holdings: Holding[];
  alerts: string[];
  source: string;
};
