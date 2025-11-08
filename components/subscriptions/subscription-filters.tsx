"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortOption = "name" | "cost-asc" | "cost-desc" | "date-asc" | "date-desc";

type FilterValues = {
  search: string;
  status: "all" | "active" | "cancelled" | "paused";
  category: string;
  billingCycle: "all" | "monthly" | "yearly";
  sort: SortOption;
};

interface SubscriptionFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  categories: string[];
}

export default function SubscriptionFilters({
  filters,
  onFiltersChange,
  categories,
}: SubscriptionFiltersProps) {
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      category: "all",
      billingCycle: "all",
      sort: "name",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.billingCycle !== "all" ||
    filters.sort !== "name";

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "name":
        return "Name";
      case "cost-asc":
        return "Cost ↑";
      case "cost-desc":
        return "Cost ↓";
      case "date-asc":
        return "Date ↑";
      case "date-desc":
        return "Date ↓";
      default:
        return "Sort";
    }
  };

  return (
    <div className="space-y-3 mb-8">
      {/* Search - borderless */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search subscriptions..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-8 border-0 bg-transparent hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
        />
      </div>

      {/* Filters Row - minimal buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger
            size="sm"
            className="h-7 px-2.5 text-xs border-0 bg-transparent hover:bg-muted/30 data-[state=open]:bg-muted/30 w-auto min-w-[80px]"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger
              size="sm"
              className="h-7 px-2.5 text-xs border-0 bg-transparent hover:bg-muted/30 data-[state=open]:bg-muted/30 w-auto min-w-[100px]"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Billing Cycle Filter */}
        <Select
          value={filters.billingCycle}
          onValueChange={(value) => handleFilterChange("billingCycle", value)}
        >
          <SelectTrigger
            size="sm"
            className="h-7 px-2.5 text-xs border-0 bg-transparent hover:bg-muted/30 data-[state=open]:bg-muted/30 w-auto min-w-[90px]"
          >
            <SelectValue placeholder="Billing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cycles</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger
            size="sm"
            className="h-7 px-2.5 text-xs border-0 bg-transparent hover:bg-muted/30 data-[state=open]:bg-muted/30 w-auto min-w-[70px]"
          >
            <SelectValue>
              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                <span>{getSortLabel(filters.sort)}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="cost-asc">Cost (Low to High)</SelectItem>
            <SelectItem value="cost-desc">Cost (High to Low)</SelectItem>
            <SelectItem value="date-asc">Date (Soonest)</SelectItem>
            <SelectItem value="date-desc">Date (Latest)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
