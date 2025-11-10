"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Subscription = {
  id: number;
  userId: string;
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string | null;
  status: "active" | "cancelled" | "paused";
  paymentMethod: string | null;
};

interface MarkAsPaidButtonProps {
  subscription: Subscription;
  onSuccess: () => void;
}

export default function MarkAsPaidButton({
  subscription,
  onSuccess,
}: MarkAsPaidButtonProps) {
  const [loading, setLoading] = useState(false);

  // Only show for active subscriptions
  if (subscription.status !== "active") {
    return null;
  }

  const handleMarkAsPaid = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/subscriptions/${subscription.id}/renew`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.details || "Failed to mark as paid"
        );
      }

      toast.success(`${subscription.name} marked as paid!`);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark subscription as paid"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMarkAsPaid}
          disabled={loading}
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Mark as paid</p>
      </TooltipContent>
    </Tooltip>
  );
}
