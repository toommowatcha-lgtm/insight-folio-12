import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stock } from "@/types/stock";
import { useStocks } from "@/contexts/StockContext";
import { Button } from "@/components/ui/button";
import { Save, TrendingUp, Minus, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoryProps {
  stock: Stock;
}

export const Story: React.FC<StoryProps> = ({ stock }) => {
  const { updateStock } = useStocks();
  const [editing, setEditing] = useState(false);

  const [story, setStory] = useState({
    narrative: stock.story?.narrative || "",
    guidanceTone: stock.story?.guidanceTone || "Neutral",
    keyHighlights: stock.story?.keyHighlights || [],
  });

  const handleSave = () => {
    updateStock(stock.id, { story });
    setEditing(false);
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "Bullish":
        return <TrendingUp className="h-12 w-12 text-success" />;
      case "Bearish":
        return <TrendingDown className="h-12 w-12 text-destructive" />;
      default:
        return <Minus className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "Bullish":
        return "text-success";
      case "Bearish":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

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

      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <Label className="text-lg font-semibold mb-3 block">Earnings Narrative</Label>
        <Textarea
          value={story.narrative}
          onChange={(e) => setStory({ ...story, narrative: e.target.value })}
          disabled={!editing}
          className="min-h-[300px] bg-background"
          placeholder="Summarize the company's recent quarterly earnings, key highlights, challenges, and guidance..."
        />
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <Label className="text-lg font-semibold mb-3 block">CEO Guidance Tone</Label>
          <Select
            value={story.guidanceTone}
            onValueChange={(value) =>
              setStory({ ...story, guidanceTone: value as "Bullish" | "Neutral" | "Bearish" })
            }
            disabled={!editing}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="Bullish">Bullish</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Bearish">Bearish</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-card to-card/50 flex flex-col items-center justify-center">
          <Label className="text-sm text-muted-foreground mb-4">Sentiment Visualization</Label>
          {getToneIcon(story.guidanceTone)}
          <p className={`mt-4 text-2xl font-bold ${getToneColor(story.guidanceTone)}`}>
            {story.guidanceTone}
          </p>
        </Card>
      </div>
    </div>
  );
};
