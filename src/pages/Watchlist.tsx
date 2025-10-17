import { supabase } from "/public/supabaseClient.js";  // ✅ ใช้ path ตรงนี้
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Watchlist() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [newStock, setNewStock] = useState({
    symbol: "",
    companyName: "",
    currentPrice: "",
  });

  // ✅ โหลดข้อมูลจาก Supabase ตอนเริ่มต้น
  useEffect(() => {
    const fetchStocks = async () => {
      const { data, error } = await supabase.from("stocks").select("*");
      if (error) {
        console.error("❌ Error fetching stocks:", error);
      } else {
        setStocks(data || []);
      }
    };
    fetchStocks();
  }, []);

  // ✅ เพิ่มข้อมูลใหม่ลง Supabase
  const handleAddStock = async () => {
    if (!newStock.symbol || !newStock.companyName || !newStock.currentPrice) return;

    const { data, error } = await supabase
      .from("stocks")
      .insert([
        {
          symbol: newStock.symbol.toUpperCase(),
          company_name: newStock.companyName,
          current_price: parseFloat(newStock.currentPrice),
          day_change: 0,
        },
      ])
      .select();

    if (error) {
      console.error("❌ Error adding stock:", error);
      alert("Error adding stock: " + error.message);
    } else {
      setStocks([...stocks, ...data]);
      setNewStock({ symbol: "", companyName: "", currentPrice: "" });
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze your favorite stocks
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Add New Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Stock Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL"
                  value={newStock.symbol}
                  onChange={(e) =>
                    setNewStock({ ...newStock, symbol: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="e.g., Apple Inc."
                  value={newStock.companyName}
                  onChange={(e) =>
                    setNewStock({ ...newStock, companyName: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Current Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 178.45"
                  value={newStock.currentPrice}
                  onChange={(e) =>
                    setNewStock({ ...newStock, currentPrice: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <Button onClick={handleAddStock} className="w-full">
                Add Stock
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-card to-card/50 border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">Symbol</th>
                <th className="text-left p-4 font-semibold">Company Name</th>
                <th className="text-right p-4 font-semibold">Current Price</th>
                <th className="text-right p-4 font-semibold">1D Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr
                  key={stock.id}
                  onClick={() => navigate(`/stock/${stock.id}`)}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-primary">{stock.symbol}</td>
                  <td className="p-4">{stock.company_name}</td>
                  <td className="p-4 text-right font-mono">
                    ${stock.current_price?.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <div
                      className={`flex items-center justify-end gap-1 ${
                        stock.day_change >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {stock.day_change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {stock.day_change >= 0 ? "+" : ""}
                        {stock.day_change?.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
