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

const MAX_INPUT_LENGTH = 2000;

export function AISubscriptionParser({ onParsed }: AISubscriptionParserProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error("Please enter a subscription description");
      return;
    }

    // Client-side length validation
    if (text.length > MAX_INPUT_LENGTH) {
      toast.error(
        `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`
      );
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
        
        // Handle rate limit errors specifically
        if (response.status === 429) {
          const retryAfter = error.retryAfter || 3600;
          const minutes = Math.ceil(retryAfter / 60);
          toast.error(
            `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
            {
              duration: 5000,
            }
          );
          return;
        }
        
        // Handle validation errors
        if (response.status === 400) {
          toast.error(error.message || error.error || "Invalid input");
          return;
        }
        
        throw new Error(error.message || error.error || "Failed to parse subscription");
      }

      const result = await response.json();

      if (result.success) {
        onParsed(result.data, result.missingFields);
        toast.success("Subscription parsed successfully!");
      } else {
        throw new Error("Failed to parse subscription");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Too many requests")) {
        // Already handled above
        return;
      }
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
          onChange={(e) => {
            // Enforce max length client-side
            if (e.target.value.length <= MAX_INPUT_LENGTH) {
              setText(e.target.value);
            }
          }}
          disabled={loading}
          className="min-h-[80px]"
          maxLength={MAX_INPUT_LENGTH}
        />
      </div>
      {text.length > MAX_INPUT_LENGTH * 0.9 && (
        <p className="text-xs text-muted-foreground text-right">
          {text.length} / {MAX_INPUT_LENGTH} characters
        </p>
      )}
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
