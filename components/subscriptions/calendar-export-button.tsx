"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface CalendarExportButtonProps {
  disabled?: boolean;
}

export default function CalendarExportButton({
  disabled = false,
}: CalendarExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/subscriptions/calendar/export");

      if (!response.ok) {
        throw new Error("Failed to export calendar");
      }

      const icsContent = await response.text();

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "amy-subscriptions.ics";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Calendar exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export calendar"
      );
      console.error("Error exporting calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || loading}
      className="gap-2"
    >
      <Calendar className="w-4 h-4" />
      {loading ? "Exporting..." : "Export to Calendar"}
    </Button>
  );
}

