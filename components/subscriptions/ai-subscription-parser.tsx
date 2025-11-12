"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ParsedData = {
  name?: string;
  cost?: number;
  billingCycle?: "monthly" | "yearly";
  category?: string;
  paymentMethod?: string;
  icon?: string;
};

type MissingFields = {
  required: string[];
  optional: string[];
};

interface AISubscriptionParserProps {
  onParsed: (data: ParsedData, missingFields: MissingFields) => void;
}

export function AISubscriptionParser({ onParsed }: AISubscriptionParserProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error("Please enter a subscription description");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/parse-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse subscription");
      }

      const result = await response.json();

      if (result.success) {
        onParsed(result.data, result.missingFields);
        toast.success("Subscription parsed successfully!");
      } else {
        throw new Error("Failed to parse subscription");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to parse subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="ai-input" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Or describe your subscription
        </Label>
      </div>
      <div className="flex gap-2">
        <Textarea
          id="ai-input"
          placeholder="E.g., 'I pay $15.99 monthly for Netflix on my credit card'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="min-h-[80px]"
        />
      </div>
      <Button
        type="button"
        onClick={handleParse}
        disabled={loading || !text.trim()}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Magic in progress...
          </>
        ) : (
          <>✨ Generate with AI</>
        )}
      </Button>
    </div>
  );
}
