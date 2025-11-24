"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Subscription = {
  id: number;
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string | null;
  paymentMethod: string | null;
  status: "active" | "cancelled" | "paused";
};

interface AddToCalendarButtonProps {
  subscription: Subscription;
}

export default function AddToCalendarButton({
  subscription,
}: AddToCalendarButtonProps) {
  const [loading, setLoading] = useState(false);

  // Only show button for active subscriptions
  if (subscription.status !== "active") {
    return null;
  }

  const handleGoogleCalendar = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/calendar`
      );

      if (!response.ok) {
        throw new Error("Failed to generate calendar event");
      }

      const data = await response.json();

      if (data.googleCalendarUrl) {
        // Open Google Calendar in new tab
        window.open(data.googleCalendarUrl, "_blank");
        toast.success("Opening Google Calendar...");
      } else {
        throw new Error("No Google Calendar URL returned");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to open Google Calendar"
      );
      console.error("Error opening Google Calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIcs = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/subscriptions/${subscription.id}/calendar`
      );

      if (!response.ok) {
        throw new Error("Failed to generate calendar file");
      }

      const data = await response.json();

      if (data.icsContent) {
        // Create blob and download
        const blob = new Blob([data.icsContent], {
          type: "text/calendar;charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `amy-${subscription.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Calendar file downloaded");
      } else {
        throw new Error("No calendar content returned");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to download calendar file"
      );
      console.error("Error downloading calendar file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={loading}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleGoogleCalendar} disabled={loading}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Add to Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadIcs} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download .ics file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to calendar</p>
      </TooltipContent>
    </Tooltip>
  );
}

