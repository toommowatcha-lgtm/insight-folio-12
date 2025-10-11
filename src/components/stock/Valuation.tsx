import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Stock } from "@/types/stock";
import { useStocks } from "@/contexts/StockContext";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ValuationProps {
  stock: Stock;
}

export const Valuation: React.FC<ValuationProps> = ({ stock }) => {
  const { updateStock } = useStocks();
  const [editing, setEditing] = useState(false);

  const [valuation, setValuation] = useState({
    peRatio: stock.valuation?.peRatio || 0,
    psRatio: stock.valuation?.psRatio || 0,
    pfcfRatio: stock.valuation?.pfcfRatio || 0,
    growthRate: stock.valuation?.growthRate || 0,
    discountRate: stock.valuation?.discountRate || 0,
    bearCase: stock.valuation?.bearCase || 0,
    baseCase: stock.valuation?.baseCase || 0,
    bullCase: stock.valuation?.bullCase || 0,
  });

  const handleSave = () => {
    updateStock(stock.id, { valuation });
    setEditing(false);
  };

  const chartData = [
    { case: "Bear", value: valuation.bearCase, fill: "hsl(var(--destructive))" },
    { case: "Base", value: valuation.baseCase, fill: "hsl(var(--chart-1))" },
    { case: "Bull", value: valuation.bullCase, fill: "hsl(var(--success))" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-sm text-muted-foreground">P/E Ratio</Label>
          <Input
            type="number"
            value={valuation.peRatio}
            onChange={(e) => setValuation({ ...valuation, peRatio: parseFloat(e.target.value) || 0 })}
            disabled={!editing}
            className="mt-2 bg-background"
          />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-sm text-muted-foreground">P/S Ratio</Label>
          <Input
            type="number"
            value={valuation.psRatio}
            onChange={(e) => setValuation({ ...valuation, psRatio: parseFloat(e.target.value) || 0 })}
            disabled={!editing}
            className="mt-2 bg-background"
          />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-sm text-muted-foreground">P/FCF Ratio</Label>
          <Input
            type="number"
            value={valuation.pfcfRatio}
            onChange={(e) => setValuation({ ...valuation, pfcfRatio: parseFloat(e.target.value) || 0 })}
            disabled={!editing}
            className="mt-2 bg-background"
          />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-sm text-muted-foreground">Growth Rate (%)</Label>
          <Input
            type="number"
            value={valuation.growthRate}
            onChange={(e) => setValuation({ ...valuation, growthRate: parseFloat(e.target.value) || 0 })}
            disabled={!editing}
            className="mt-2 bg-background"
          />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-sm text-muted-foreground">Discount Rate (%)</Label>
          <Input
            type="number"
            value={valuation.discountRate}
            onChange={(e) => setValuation({ ...valuation, discountRate: parseFloat(e.target.value) || 0 })}
            disabled={!editing}
            className="mt-2 bg-background"
          />
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <h3 className="text-lg font-semibold mb-6">Valuation Range</h3>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="space-y-2">
            <Label className="text-destructive font-semibold">Bear Case</Label>
            <Input
              type="number"
              value={valuation.bearCase}
              onChange={(e) => setValuation({ ...valuation, bearCase: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background text-lg"
              placeholder="$"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary font-semibold">Base Case</Label>
            <Input
              type="number"
              value={valuation.baseCase}
              onChange={(e) => setValuation({ ...valuation, baseCase: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background text-lg"
              placeholder="$"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-success font-semibold">Bull Case</Label>
            <Input
              type="number"
              value={valuation.bullCase}
              onChange={(e) => setValuation({ ...valuation, bullCase: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background text-lg"
              placeholder="$"
            />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
      </Card>
    </div>
  );
};
