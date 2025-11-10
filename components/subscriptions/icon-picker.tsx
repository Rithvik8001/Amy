"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { POPULAR_APPS, getIconSvg } from "@/lib/icon-utils";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface IconPickerProps {
  value?: string | null;
  onValueChange: (value: string | undefined) => void;
  id?: string;
  className?: string;
}

export function IconPicker({
  value,
  onValueChange,
  id,
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedApp = POPULAR_APPS.find((app) => app.id === value);

  // Filter apps based on search
  const filteredApps = useMemo(() => {
    if (!search.trim()) return POPULAR_APPS;
    const searchLower = search.toLowerCase().trim();
    return POPULAR_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(searchLower) ||
        app.id.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (appId: string) => {
    if (appId === "none" || appId === value) {
      onValueChange(undefined);
    } else {
      onValueChange(appId);
    }
    setOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>App Icon</Label>
      <Popover
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedApp ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: getIconSvg(selectedApp.id, 20) || "",
                  }}
                />
                <span className="truncate">{selectedApp.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select an icon...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex flex-col">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
              />
            </div>
            <ScrollArea className="h-[350px]">
              <div className="p-1">
                <div
                  className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect("none")}
                >
                  <div className="w-5 h-5 shrink-0" />
                  <span>None</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
                {filteredApps.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No icon found.
                  </div>
                ) : (
                  filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelect(app.id)}
                    >
                      <div
                        className="w-5 h-5 shrink-0"
                        dangerouslySetInnerHTML={{
                          __html: getIconSvg(app.id, 20) || "",
                        }}
                      />
                      <span className="truncate">{app.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === app.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
