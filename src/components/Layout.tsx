import { Link, useLocation } from "react-router-dom";
import { BarChart3, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Stock Dashboard
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link to="/">
                <Button
                  variant={isActive("/") ? "default" : "ghost"}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Watchlist
                </Button>
              </Link>
              <Link to="/compare">
                <Button
                  variant={isActive("/compare") ? "default" : "ghost"}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Compare
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};
