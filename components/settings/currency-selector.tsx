"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSupportedCurrencies,
  formatCurrencyForDisplay,
} from "@/lib/currency-utils";
import { toast } from "sonner";

export function CurrencySelector() {
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setCurrency(data.currency || "USD");
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currency: newCurrency }),
      });

      if (!response.ok) {
        throw new Error("Failed to update currency");
      }

      setCurrency(newCurrency);
      toast.success("Currency updated successfully");

      window.dispatchEvent(
        new CustomEvent("currencyChanged", {
          detail: { currency: newCurrency },
        })
      );

      window.location.reload();
    } catch (error) {
      toast.error("Failed to update currency");
      console.error("Error updating currency:", error);
    }
  };

  const currencies = getSupportedCurrencies();

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={currency} onValueChange={handleCurrencyChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            {formatCurrencyForDisplay(curr.code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
