import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Stock } from "@/types/stock";
import { useStocks } from "@/contexts/StockContext";
import { Button } from "@/components/ui/button";
import { Save, Download, RotateCcw, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ValuationProps {
  stock: Stock;
}

export const Valuation: React.FC<ValuationProps> = ({ stock }) => {
  const { updateStock } = useStocks();
  const [editing, setEditing] = useState(false);

  const defaultValuation = {
    currentPrice: stock.currentPrice || 0,
    investmentHorizon: 5,
    currentSales: 0,
    salesGrowthCAGR: 15,
    netProfitMargin: 20,
    normalizedNetProfitMargin: 20,
    sharesOutstanding: 1000000,
    normalizedEPS: 0,
    normalizedCurrentPE: 25,
    expectedPEAtYearEnd: 30,
    peExpansionPercent: 20,
    shareRepurchasePercent: 2,
    dividendYieldPercent: 0,
    shareIssuePercent: 0,
    marginOfSafetyPercent: 25,
    tam: stock.tam?.tam || 0,
    sam: stock.tam?.sam || 0,
    som: stock.tam?.som || 0,
    penetrationPercent: 5,
  };

  const [valuation, setValuation] = useState({
    ...defaultValuation,
    ...stock.valuation,
  });

  // Core calculations
  const calculations = useMemo(() => {
    const projectedSales = valuation.currentSales * Math.pow(1 + valuation.salesGrowthCAGR / 100, valuation.investmentHorizon);
    const margin = valuation.normalizedNetProfitMargin || valuation.netProfitMargin;
    const netProfitAtYearEnd = projectedSales * (margin / 100);
    const adjustedShares = valuation.sharesOutstanding * (1 - valuation.shareRepurchasePercent / 100 + valuation.shareIssuePercent / 100);
    const epsAtYearEnd = netProfitAtYearEnd / adjustedShares;
    const normalizedEPS = valuation.normalizedEPS || epsAtYearEnd;
    
    // Base scenario
    const fairPriceBase = normalizedEPS * valuation.normalizedCurrentPE;
    const fairPriceWithPE = normalizedEPS * valuation.expectedPEAtYearEnd;
    const fairPriceWithMOS = fairPriceBase * (1 - valuation.marginOfSafetyPercent / 100);
    
    // Returns
    const priceReturn = valuation.currentPrice > 0 ? ((fairPriceWithPE - valuation.currentPrice) / valuation.currentPrice) * 100 : 0;
    const buybackImpact = valuation.shareRepurchasePercent;
    const totalReturn = priceReturn + valuation.dividendYieldPercent + buybackImpact;
    const annualizedReturn = valuation.investmentHorizon > 0 ? (Math.pow(1 + totalReturn / 100, 1 / valuation.investmentHorizon) - 1) * 100 : 0;
    
    // Scenarios
    const bearPE = valuation.bearScenario?.peRatio || valuation.normalizedCurrentPE * 0.7;
    const bearGrowth = valuation.bearScenario?.growthRate || valuation.salesGrowthCAGR * 0.5;
    const bearMargin = valuation.bearScenario?.margin || margin * 0.8;
    
    const bearSales = valuation.currentSales * Math.pow(1 + bearGrowth / 100, valuation.investmentHorizon);
    const bearNetProfit = bearSales * (bearMargin / 100);
    const bearEPS = bearNetProfit / adjustedShares;
    const bearPrice = bearEPS * bearPE;
    
    const bullPE = valuation.bullScenario?.peRatio || valuation.expectedPEAtYearEnd * 1.3;
    const bullGrowth = valuation.bullScenario?.growthRate || valuation.salesGrowthCAGR * 1.5;
    const bullMargin = valuation.bullScenario?.margin || margin * 1.2;
    
    const bullSales = valuation.currentSales * Math.pow(1 + bullGrowth / 100, valuation.investmentHorizon);
    const bullNetProfit = bullSales * (bullMargin / 100);
    const bullEPS = bullNetProfit / adjustedShares;
    const bullPrice = bullEPS * bullPE;
    
    // TAM/SAM/SOM
    const salesAtFullPenetration = valuation.som * (valuation.penetrationPercent / 100);
    const impliedMarketShare = valuation.currentSales > 0 ? (valuation.currentSales / valuation.sam) * 100 : 0;
    
    return {
      projectedSales,
      netProfitAtYearEnd,
      epsAtYearEnd,
      normalizedEPS,
      fairPriceBase,
      fairPriceWithPE,
      fairPriceWithMOS,
      priceReturn,
      totalReturn,
      annualizedReturn,
      bearPrice,
      bullPrice,
      salesAtFullPenetration,
      impliedMarketShare,
    };
  }, [valuation]);

  const handleSave = () => {
    updateStock(stock.id, { valuation });
    setEditing(false);
  };

  const handleReset = () => {
    setValuation({ ...defaultValuation, ...stock.valuation });
  };

  const exportToCSV = () => {
    const data = [
      ['Valuation Analysis', stock.symbol],
      [''],
      ['INPUTS', ''],
      ['Current Price', valuation.currentPrice],
      ['Investment Horizon (years)', valuation.investmentHorizon],
      ['Current Sales (MB)', valuation.currentSales],
      ['Sales Growth CAGR (%)', valuation.salesGrowthCAGR],
      ['Net Profit Margin (%)', valuation.netProfitMargin],
      ['Normalized Net Profit Margin (%)', valuation.normalizedNetProfitMargin],
      ['Shares Outstanding', valuation.sharesOutstanding],
      ['Normalized EPS', valuation.normalizedEPS],
      ['Normalized Current P/E', valuation.normalizedCurrentPE],
      ['Expected P/E at Year-End', valuation.expectedPEAtYearEnd],
      ['Share Repurchase (%)', valuation.shareRepurchasePercent],
      ['Dividend Yield (%)', valuation.dividendYieldPercent],
      ['Margin of Safety (%)', valuation.marginOfSafetyPercent],
      [''],
      ['CALCULATED OUTPUTS', ''],
      ['Projected Sales @ Year-End', calculations.projectedSales.toFixed(2)],
      ['Net Profit @ Year-End', calculations.netProfitAtYearEnd.toFixed(2)],
      ['EPS @ Year-End', calculations.epsAtYearEnd.toFixed(2)],
      ['Fair Price (Base)', calculations.fairPriceBase.toFixed(2)],
      ['Fair Price (with P/E expansion)', calculations.fairPriceWithPE.toFixed(2)],
      ['Fair Price (with MOS)', calculations.fairPriceWithMOS.toFixed(2)],
      ['Expected Total Return (%)', calculations.totalReturn.toFixed(2)],
      ['Annualized Return (%)', calculations.annualizedReturn.toFixed(2)],
      [''],
      ['SCENARIOS', ''],
      ['Bear Case Price', calculations.bearPrice.toFixed(2)],
      ['Base Case Price', calculations.fairPriceWithPE.toFixed(2)],
      ['Bull Case Price', calculations.bullPrice.toFixed(2)],
    ];
    
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stock.symbol}_valuation.csv`;
    a.click();
  };

  const scenarioData = [
    { case: "Bear", value: calculations.bearPrice, fill: "hsl(var(--destructive))" },
    { case: "Base", value: calculations.fairPriceWithPE, fill: "hsl(var(--chart-1))" },
    { case: "Bull", value: calculations.bullPrice, fill: "hsl(var(--chart-2))" },
  ];

  const sensitivityData = useMemo(() => {
    const data = [];
    const peRange = [15, 20, 25, 30, 35, 40];
    const growthRange = [5, 10, 15, 20, 25, 30];
    
    for (const pe of peRange) {
      for (const growth of growthRange) {
        const sales = valuation.currentSales * Math.pow(1 + growth / 100, valuation.investmentHorizon);
        const margin = valuation.normalizedNetProfitMargin || valuation.netProfitMargin;
        const profit = sales * (margin / 100);
        const eps = profit / valuation.sharesOutstanding;
        const price = eps * pe;
        data.push({ pe, growth, price });
      }
    }
    return data;
  }, [valuation]);

  const FormulaTooltip = ({ formula }: { formula: string }) => (
    <TooltipProvider>
      <TooltipUI>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs">{formula}</p>
        </TooltipContent>
      </TooltipUI>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        {editing ? (
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline">
            Edit
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              Fair Price (Base)
              <FormulaTooltip formula="Normalized EPS × Normalized P/E" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculations.fairPriceBase.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              Fair Price (MOS)
              <FormulaTooltip formula="Fair Price × (1 - Margin of Safety %)" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculations.fairPriceWithMOS.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              Expected Return
              <FormulaTooltip formula="(Fair Price - Current Price) / Current Price + Dividend + Buyback" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${calculations.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
              {calculations.totalReturn.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {calculations.annualizedReturn.toFixed(1)}% annualized
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              EPS @ Year-End
              <FormulaTooltip formula="Net Profit @ Year-End / Shares Outstanding" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculations.epsAtYearEnd.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              Net Profit @ Year-End
              <FormulaTooltip formula="Projected Sales × Net Profit Margin" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(calculations.netProfitAtYearEnd / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
      </div>

      {/* Input Fields */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle>Valuation Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Current Price ($)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.currentPrice}
                onChange={(e) => setValuation({ ...valuation, currentPrice: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Investment Horizon (years)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.investmentHorizon}
                onChange={(e) => setValuation({ ...valuation, investmentHorizon: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Sales (MB)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.currentSales}
                onChange={(e) => setValuation({ ...valuation, currentSales: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Sales Growth CAGR (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.salesGrowthCAGR}
                onChange={(e) => setValuation({ ...valuation, salesGrowthCAGR: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Net Profit Margin (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.netProfitMargin}
                onChange={(e) => setValuation({ ...valuation, netProfitMargin: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Normalized Net Profit Margin (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.normalizedNetProfitMargin}
                onChange={(e) => setValuation({ ...valuation, normalizedNetProfitMargin: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Shares Outstanding</Label>
              <Input
                type="number"
                step="any"
                value={valuation.sharesOutstanding}
                onChange={(e) => setValuation({ ...valuation, sharesOutstanding: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Normalized EPS ($)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.normalizedEPS}
                onChange={(e) => setValuation({ ...valuation, normalizedEPS: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
                placeholder="Auto-calculated if 0"
              />
            </div>

            <div className="space-y-2">
              <Label>Normalized Current P/E</Label>
              <Input
                type="number"
                step="any"
                value={valuation.normalizedCurrentPE}
                onChange={(e) => setValuation({ ...valuation, normalizedCurrentPE: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected P/E at Year-End</Label>
              <Input
                type="number"
                step="any"
                value={valuation.expectedPEAtYearEnd}
                onChange={(e) => setValuation({ ...valuation, expectedPEAtYearEnd: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>P/E Expansion (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.peExpansionPercent}
                onChange={(e) => setValuation({ ...valuation, peExpansionPercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Share Repurchase (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.shareRepurchasePercent}
                onChange={(e) => setValuation({ ...valuation, shareRepurchasePercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Dividend Yield (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.dividendYieldPercent}
                onChange={(e) => setValuation({ ...valuation, dividendYieldPercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Share Issue (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.shareIssuePercent}
                onChange={(e) => setValuation({ ...valuation, shareIssuePercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Margin of Safety (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.marginOfSafetyPercent}
                onChange={(e) => setValuation({ ...valuation, marginOfSafetyPercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>TAM (Total Addressable Market)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.tam}
                onChange={(e) => setValuation({ ...valuation, tam: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>SAM (Serviceable Addressable Market)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.sam}
                onChange={(e) => setValuation({ ...valuation, sam: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>SOM (Serviceable Obtainable Market)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.som}
                onChange={(e) => setValuation({ ...valuation, som: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label>Penetration / Market Share (%)</Label>
              <Input
                type="number"
                step="any"
                value={valuation.penetrationPercent}
                onChange={(e) => setValuation({ ...valuation, penetrationPercent: parseFloat(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-destructive/10 to-card border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Bear Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Target Price</div>
              <div className="text-3xl font-bold text-destructive">${calculations.bearPrice.toFixed(2)}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Conservative assumptions: Lower P/E, reduced growth, margin compression
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Base Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Target Price</div>
              <div className="text-3xl font-bold text-primary">${calculations.fairPriceWithPE.toFixed(2)}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Expected assumptions: Normal P/E expansion, steady growth
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-card border-success/20">
          <CardHeader>
            <CardTitle className="text-success">Bull Case</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Target Price</div>
              <div className="text-3xl font-bold text-success">${calculations.bullPrice.toFixed(2)}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimistic assumptions: Higher P/E, accelerated growth, margin expansion
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Chart */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle>Valuation Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="case" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Formula Summary */}
      <Card className="bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle>Formula Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Projected Sales:</strong> Current Sales × (1 + CAGR)^Investment Horizon</div>
          <div><strong>Net Profit @ Year-End:</strong> Projected Sales × Net Profit Margin</div>
          <div><strong>EPS @ Year-End:</strong> Net Profit / (Shares Outstanding × (1 - Buyback% + Issue%))</div>
          <div><strong>Fair Price (Base):</strong> Normalized EPS × Normalized P/E</div>
          <div><strong>Fair Price (with P/E):</strong> EPS @ Year-End × Expected P/E</div>
          <div><strong>Fair Price (with MOS):</strong> Fair Price × (1 - Margin of Safety%)</div>
          <div><strong>Total Return:</strong> Price Return + Dividend Yield + Buyback Impact</div>
          <div><strong>Market Share:</strong> Current Sales / SAM × 100</div>
        </CardContent>
      </Card>
    </div>
  );
};
