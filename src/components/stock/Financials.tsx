import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Stock, FinancialData, CustomMetric } from "@/types/stock";
import { useStocks } from "@/contexts/StockContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Save, TrendingUp, TrendingDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FinancialsProps {
  stock: Stock;
}

export const Financials: React.FC<FinancialsProps> = ({ stock }) => {
  const { updateStock } = useStocks();
  const [viewMode, setViewMode] = useState<"quarterly" | "annual">("quarterly");
  const [editing, setEditing] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["revenue", "netIncome"]);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [newMetricLabel, setNewMetricLabel] = useState("");

  const [financials, setFinancials] = useState<FinancialData[]>(
    stock.financials || [
      {
        period: "Q1 2024",
        revenue: 0,
        grossProfit: 0,
        operatingIncome: 0,
        netIncome: 0,
        rdExpense: 0,
        smExpense: 0,
        gaExpense: 0,
        freeCashFlow: 0,
        sharesOutstanding: 0,
        capex: 0,
      },
    ]
  );

  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>(
    stock.customMetrics || []
  );

  const handleSave = () => {
    updateStock(stock.id, { financials, customMetrics });
    setEditing(false);
  };

  const addPeriod = () => {
    const newPeriod: FinancialData = {
      period: viewMode === "quarterly" ? `Q${financials.length + 1} 2024` : `FY ${2024 + financials.length}`,
      revenue: 0,
      grossProfit: 0,
      operatingIncome: 0,
      netIncome: 0,
      rdExpense: 0,
      smExpense: 0,
      gaExpense: 0,
      freeCashFlow: 0,
      sharesOutstanding: 0,
      capex: 0,
    };
    setFinancials([...financials, newPeriod]);
  };

  const addCustomMetric = () => {
    if (!newMetricLabel.trim()) return;
    
    const key = newMetricLabel.toLowerCase().replace(/\s+/g, "_");
    const colors = [
      "hsl(var(--chart-5))",
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
    ];
    const color = colors[customMetrics.length % colors.length];
    
    const newMetric: CustomMetric = {
      key,
      label: newMetricLabel,
      color,
    };
    
    setCustomMetrics([...customMetrics, newMetric]);
    
    // Initialize the metric in all periods
    const updatedFinancials = financials.map(fin => ({
      ...fin,
      [key]: 0,
    }));
    setFinancials(updatedFinancials);
    
    setNewMetricLabel("");
    setShowAddMetric(false);
  };

  const removeCustomMetric = (key: string) => {
    setCustomMetrics(customMetrics.filter(m => m.key !== key));
    setSelectedMetrics(selectedMetrics.filter(m => m !== key));
    
    // Remove from financials data
    const updatedFinancials = financials.map(fin => {
      const { [key]: removed, ...rest } = fin;
      return rest as FinancialData;
    });
    setFinancials(updatedFinancials);
  };

  const updateFinancial = (index: number, field: string, value: string) => {
    const updated = [...financials];
    updated[index] = { ...updated[index], [field]: field === "period" ? value : parseFloat(value) || 0 };
    setFinancials(updated);
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const defaultMetrics = [
    { key: "revenue", label: "Revenue", color: "hsl(var(--chart-1))" },
    { key: "grossProfit", label: "Gross Profit", color: "hsl(var(--chart-2))" },
    { key: "netIncome", label: "Net Income", color: "hsl(var(--chart-3))" },
    { key: "freeCashFlow", label: "Free Cash Flow", color: "hsl(var(--chart-4))" },
  ];

  const allMetrics = [...defaultMetrics, ...customMetrics];

  const allFinancialKeys = [
    "revenue",
    "grossProfit",
    "operatingIncome",
    "netIncome",
    "rdExpense",
    "smExpense",
    "gaExpense",
    "freeCashFlow",
    "capex",
    "sharesOutstanding",
    ...customMetrics.map(m => m.key),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "quarterly" | "annual")}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          {editing && (
            <Button onClick={addPeriod} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          )}
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
      </div>

      <Card className="p-6 bg-card border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-semibold">Metric</th>
              {financials.map((fin, idx) => (
                <th key={idx} className="text-right p-3 font-semibold">
                  {editing ? (
                    <Input
                      value={fin.period}
                      onChange={(e) => updateFinancial(idx, "period", e.target.value)}
                      className="w-24 text-right bg-background"
                    />
                  ) : (
                    fin.period
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFinancialKeys.map((key) => {
              const customMetric = customMetrics.find(m => m.key === key);
              return (
                <tr key={key} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-medium capitalize flex items-center gap-2">
                    {customMetric ? customMetric.label : key.replace(/([A-Z])/g, " $1").trim()}
                    {customMetric && editing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCustomMetric(key)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                  {financials.map((fin, idx) => {
                    const value = (fin[key] as number) || 0;
                    const prevValue = idx > 0 ? ((financials[idx - 1][key] as number) || 0) : 0;
                    const change = calculateChange(value, prevValue);

                    return (
                      <td key={idx} className="p-3 text-right">
                        {editing ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => updateFinancial(idx, key, e.target.value)}
                            className="w-32 text-right bg-background"
                          />
                        ) : (
                          <div className="space-y-1">
                            <div className="font-mono">${value.toLocaleString()}M</div>
                            {idx > 0 && (
                              <div
                                className={`text-xs flex items-center justify-end gap-1 ${
                                  change >= 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {change >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {change.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {editing && (
          <div className="mt-4 pt-4 border-t border-border">
            <Dialog open={showAddMetric} onOpenChange={setShowAddMetric}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Metric
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Metric</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metric-name">Metric Name</Label>
                    <Input
                      id="metric-name"
                      placeholder="e.g., ARPU, DAU, Operating Margin"
                      value={newMetricLabel}
                      onChange={(e) => setNewMetricLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomMetric()}
                    />
                  </div>
                  <Button onClick={addCustomMetric} className="w-full">
                    Add Metric
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="mb-4">
          <h3 className="font-semibold mb-3">Select Metrics to Visualize</h3>
          <div className="flex flex-wrap gap-2">
            {allMetrics.map((metric) => (
              <Button
                key={metric.key}
                variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric(metric.key)}
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={financials}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {selectedMetrics.map((metricKey) => {
              const metric = allMetrics.find((m) => m.key === metricKey);
              return metric ? (
                <Line
                  key={metricKey}
                  type="monotone"
                  dataKey={metricKey}
                  stroke={metric.color}
                  strokeWidth={2}
                  name={metric.label}
                  dot={{ fill: metric.color, r: 4 }}
                />
              ) : null;
            })}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
