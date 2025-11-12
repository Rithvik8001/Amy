"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { formatCurrency } from "@/lib/currency-utils";
import { SubscriptionIcon } from "./subscription-icon";

type ParsedData = {
  name?: string;
  cost?: number;
  billingCycle?: "monthly" | "yearly";
  nextBillingDate?: string;
  category?: string;
  paymentMethod?: string;
  icon?: string;
};

type MissingFields = {
  required: string[];
  optional: string[];
};

interface AIPreviewCardProps {
  data: ParsedData;
  missingFields: MissingFields;
  onConfirm: () => void;
  onCancel: () => void;
  currency?: string;
}

interface FieldRowProps {
  label: string;
  value: string | number | undefined;
  isMissing: boolean;
  isRequired: boolean;
  currency?: string;
}

function FieldRow({
  label,
  value,
  isMissing,
  isRequired,
  currency = "USD",
}: FieldRowProps) {
  if (isMissing && !isRequired) {
    return null; // Don't show optional missing fields
  }

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        {isMissing && isRequired && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Required
          </Badge>
        )}
        {isMissing && !isRequired && (
          <Badge variant="outline" className="text-xs">
            <Info className="w-3 h-3 mr-1" />
            Optional
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {value !== undefined ? (
          <>
            {typeof value === "number" && label === "Cost" ? (
              <span className="text-sm font-semibold">
                {formatCurrency(value, currency)}
              </span>
            ) : (
              <span className="text-sm">{String(value)}</span>
            )}
            {!isMissing && (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Not provided</span>
        )}
      </div>
    </div>
  );
}

export function AIPreviewCard({
  data,
  missingFields,
  onConfirm,
  onCancel,
  currency = "USD",
}: AIPreviewCardProps) {
  const hasRequiredFields = missingFields.required.length === 0;
  const hasOptionalFields = missingFields.optional.length > 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>AI Parsed Subscription</span>
          {hasRequiredFields ? (
            <Badge variant="default" className="text-xs">
              Ready to use
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Incomplete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.name && data.icon && (
          <div className="flex items-center gap-2 pb-2 border-b">
            <SubscriptionIcon iconId={data.icon} name={data.name} size={24} />
            <span className="font-medium">{data.name}</span>
          </div>
        )}

        <FieldRow
          label="Name"
          value={data.name}
          isMissing={missingFields.required.includes("name")}
          isRequired={true}
          currency={currency}
        />
        <FieldRow
          label="Cost"
          value={data.cost}
          isMissing={missingFields.required.includes("cost")}
          isRequired={true}
          currency={currency}
        />
        <FieldRow
          label="Billing Cycle"
          value={
            data.billingCycle
              ? data.billingCycle.charAt(0).toUpperCase() +
                data.billingCycle.slice(1)
              : undefined
          }
          isMissing={missingFields.required.includes("billingCycle")}
          isRequired={true}
          currency={currency}
        />
        <FieldRow
          label="Next Billing Date"
          value={
            data.nextBillingDate
              ? new Date(data.nextBillingDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : undefined
          }
          isMissing={missingFields.optional.includes("nextBillingDate")}
          isRequired={false}
          currency={currency}
        />
        <FieldRow
          label="Category"
          value={data.category}
          isMissing={missingFields.optional.includes("category")}
          isRequired={false}
          currency={currency}
        />
        <FieldRow
          label="Payment Method"
          value={data.paymentMethod}
          isMissing={missingFields.optional.includes("paymentMethod")}
          isRequired={false}
          currency={currency}
        />

        {hasOptionalFields && (
          <div className="pt-2 mt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Some optional fields are missing. You can fill them manually after
              confirming.
            </p>
          </div>
        )}

        {!hasRequiredFields && (
          <div className="pt-2 mt-2 border-t">
            <p className="text-xs text-destructive font-medium">
              Please provide name and cost to continue
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={!hasRequiredFields}
          className="flex-1"
        >
          Use This Data
        </Button>
      </CardFooter>
    </Card>
  );
}
