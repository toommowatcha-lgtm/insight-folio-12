export interface Stock {
  id: string;
  symbol: string;
  companyName: string;
  currentPrice: number;
  dayChange: number;
  businessOverview?: {
    whatTheyDo: string;
    customers: string;
    revenueBreakdown: RevenueSegment[];
    moat: MoatPower[];
    growthEngine: string;
  };
  tam?: {
    tam: number;
    sam: number;
    som: number;
  };
  financials?: FinancialData[];
  valuation?: ValuationData;
  story?: StoryData;
}

export interface RevenueSegment {
  segment: string;
  percentage: number;
  revenue: number;
}

export interface MoatPower {
  name: string;
  description: string;
}

export interface FinancialData {
  period: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  rdExpense: number;
  smExpense: number;
  gaExpense: number;
  freeCashFlow: number;
  sharesOutstanding: number;
  capex: number;
  [key: string]: number | string;
}

export interface ValuationData {
  peRatio: number;
  psRatio: number;
  pfcfRatio: number;
  growthRate: number;
  discountRate: number;
  bearCase: number;
  baseCase: number;
  bullCase: number;
}

export interface StoryData {
  narrative: string;
  guidanceTone: "Bullish" | "Neutral" | "Bearish";
  keyHighlights: string[];
}
