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
  thinkForMarket?: {
    tam: string;
    marketShare: string;
    unitEconomics: string;
  };
  tippingPoint?: string;
  financials?: FinancialData[];
  customMetrics?: CustomMetric[];
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

export interface CustomMetric {
  key: string;
  label: string;
  color: string;
}

export interface ValuationData {
  // Current metrics
  currentPrice: number;
  investmentHorizon: number;
  
  // Sales & Growth
  currentSales: number;
  salesGrowthCAGR: number;
  
  // Profitability
  netProfitMargin: number;
  normalizedNetProfitMargin: number;
  
  // Shares & EPS
  sharesOutstanding: number;
  normalizedEPS: number;
  
  // P/E metrics
  normalizedCurrentPE: number;
  expectedPEAtYearEnd: number;
  peExpansionPercent: number;
  
  // Capital allocation
  shareRepurchasePercent: number;
  dividendYieldPercent: number;
  shareIssuePercent: number;
  
  // Risk
  marginOfSafetyPercent: number;
  
  // TAM/SAM/SOM
  tam: number;
  sam: number;
  som: number;
  penetrationPercent: number;
  
  // Scenarios (optional overrides)
  bearScenario?: {
    peRatio: number;
    growthRate: number;
    margin: number;
  };
  baseScenario?: {
    peRatio: number;
    growthRate: number;
    margin: number;
  };
  bullScenario?: {
    peRatio: number;
    growthRate: number;
    margin: number;
  };
}

export interface QuarterlyNote {
  quarter: string;
  content: string;
}

export interface StoryData {
  quarters: QuarterlyNote[];
  guidanceTone: "Bullish" | "Neutral" | "Bearish";
}
