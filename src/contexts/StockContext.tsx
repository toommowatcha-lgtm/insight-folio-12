import React, { createContext, useContext, useState, useEffect } from "react";
import { Stock } from "@/types/stock";

interface StockContextType {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  deleteStock: (id: string) => void;
  getStock: (id: string) => Stock | undefined;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem("stocks");
    return saved ? JSON.parse(saved) : [
      {
        id: "1",
        symbol: "AAPL",
        companyName: "Apple Inc.",
        currentPrice: 178.45,
        dayChange: 2.3,
      },
      {
        id: "2",
        symbol: "MSFT",
        companyName: "Microsoft Corporation",
        currentPrice: 412.78,
        dayChange: -0.8,
      },
      {
        id: "3",
        symbol: "GOOGL",
        companyName: "Alphabet Inc.",
        currentPrice: 142.35,
        dayChange: 1.5,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  const addStock = (stock: Stock) => {
    setStocks((prev) => [...prev, stock]);
  };

  const updateStock = (id: string, updatedData: Partial<Stock>) => {
    setStocks((prev) =>
      prev.map((stock) => (stock.id === id ? { ...stock, ...updatedData } : stock))
    );
  };

  const deleteStock = (id: string) => {
    setStocks((prev) => prev.filter((stock) => stock.id !== id));
  };

  const getStock = (id: string) => {
    return stocks.find((stock) => stock.id === id);
  };

  return (
    <StockContext.Provider value={{ stocks, addStock, updateStock, deleteStock, getStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStocks = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStocks must be used within StockProvider");
  }
  return context;
};
