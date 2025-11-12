"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  disabled?: boolean;
}

export default function ExportButton({ disabled = false }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      // Fetch CSV from API
      const response = await fetch("/api/subscriptions/export");

      if (!response.ok) {
        throw new Error("Failed to export subscriptions");
      }

      // Get CSV content
      const csvContent = await response.text();

      // Get filename from Content-Disposition header or generate default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "amy-subscriptions.csv";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Subscriptions exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export subscriptions"
      );
      console.error("Error exporting subscriptions:", error);
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
      <Download className="w-4 h-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}

