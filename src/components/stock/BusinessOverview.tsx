import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stock } from "@/types/stock";
import { useStocks } from "@/contexts/StockContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const MOAT_POWERS = [
  "Scale Economies",
  "Network Effects",
  "Counter-Positioning",
  "Switching Costs",
  "Branding",
  "Cornered Resource",
  "Process Power",
];

interface BusinessOverviewProps {
  stock: Stock;
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({ stock }) => {
  const { updateStock } = useStocks();
  const [editing, setEditing] = useState(false);

  const [businessData, setBusinessData] = useState({
    whatTheyDo: stock.businessOverview?.whatTheyDo || "",
    customers: stock.businessOverview?.customers || "",
    revenueBreakdown: stock.businessOverview?.revenueBreakdown || [],
    moat: stock.businessOverview?.moat || MOAT_POWERS.map((name) => ({ name, description: "" })),
    growthEngine: stock.businessOverview?.growthEngine || "",
  });

  const [tam, setTam] = useState({
    tam: stock.tam?.tam || 0,
    sam: stock.tam?.sam || 0,
    som: stock.tam?.som || 0,
  });

  const handleSave = () => {
    updateStock(stock.id, {
      businessOverview: businessData,
      tam,
    });
    setEditing(false);
  };

  const addRevenueSegment = () => {
    setBusinessData({
      ...businessData,
      revenueBreakdown: [
        ...businessData.revenueBreakdown,
        { segment: "New Segment", percentage: 0, revenue: 0 },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {editing ? (
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline">
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-lg font-semibold">What does this company do?</Label>
          <Textarea
            value={businessData.whatTheyDo}
            onChange={(e) =>
              setBusinessData({ ...businessData, whatTheyDo: e.target.value })
            }
            disabled={!editing}
            className="mt-3 min-h-[120px] bg-background"
            placeholder="Describe the company's business model..."
          />
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-lg font-semibold">Who are their customers?</Label>
          <Textarea
            value={businessData.customers}
            onChange={(e) =>
              setBusinessData({ ...businessData, customers: e.target.value })
            }
            disabled={!editing}
            className="mt-3 min-h-[120px] bg-background"
            placeholder="Describe their target customers..."
          />
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold">Revenue Breakdown by Segment</Label>
          {editing && (
            <Button onClick={addRevenueSegment} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Segment
            </Button>
          )}
        </div>

        {businessData.revenueBreakdown.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-3">
              {businessData.revenueBreakdown.map((segment, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={segment.segment}
                    onChange={(e) => {
                      const updated = [...businessData.revenueBreakdown];
                      updated[idx].segment = e.target.value;
                      setBusinessData({ ...businessData, revenueBreakdown: updated });
                    }}
                    disabled={!editing}
                    placeholder="Segment name"
                    className="bg-background"
                  />
                  <Input
                    type="number"
                    value={segment.percentage}
                    onChange={(e) => {
                      const updated = [...businessData.revenueBreakdown];
                      updated[idx].percentage = parseFloat(e.target.value);
                      setBusinessData({ ...businessData, revenueBreakdown: updated });
                    }}
                    disabled={!editing}
                    placeholder="%"
                    className="w-24 bg-background"
                  />
                </div>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={businessData.revenueBreakdown}
                  dataKey="percentage"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {businessData.revenueBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <Label className="text-lg font-semibold mb-4 block">Moat (7 Powers)</Label>
        <div className="grid gap-4 md:grid-cols-2">
          {businessData.moat.map((power, idx) => (
            <div key={idx} className="space-y-2">
              <Label className="text-sm text-muted-foreground">{power.name}</Label>
              <Textarea
                value={power.description}
                onChange={(e) => {
                  const updated = [...businessData.moat];
                  updated[idx].description = e.target.value;
                  setBusinessData({ ...businessData, moat: updated });
                }}
                disabled={!editing}
                className="bg-background"
                placeholder={`Describe ${power.name}...`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <Label className="text-lg font-semibold">Growth Engine</Label>
        <Textarea
          value={businessData.growthEngine}
          onChange={(e) =>
            setBusinessData({ ...businessData, growthEngine: e.target.value })
          }
          disabled={!editing}
          className="mt-3 min-h-[120px] bg-background"
          placeholder="What drives this company's growth..."
        />
      </Card>

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <Label className="text-lg font-semibold mb-4 block">TAM / SAM / SOM</Label>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Total Addressable Market</Label>
            <Input
              type="number"
              value={tam.tam}
              onChange={(e) => setTam({ ...tam, tam: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background"
              placeholder="$B"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Serviceable Addressable Market</Label>
            <Input
              type="number"
              value={tam.sam}
              onChange={(e) => setTam({ ...tam, sam: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background"
              placeholder="$B"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Serviceable Obtainable Market</Label>
            <Input
              type="number"
              value={tam.som}
              onChange={(e) => setTam({ ...tam, som: parseFloat(e.target.value) || 0 })}
              disabled={!editing}
              className="bg-background"
              placeholder="$B"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
