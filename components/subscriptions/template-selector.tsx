"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  SUBSCRIPTION_TEMPLATES,
  getTemplatesByCategory,
  getCategories,
} from "@/lib/subscription-templates";
import { SubscriptionIcon } from "./subscription-icon";
import { formatCurrency } from "@/lib/currency-utils";

interface TemplateSelectorProps {
  value?: string;
  onValueChange: (templateId: string | undefined) => void;
  id?: string;
}

export function TemplateSelector({
  value,
  onValueChange,
  id,
}: TemplateSelectorProps) {
  const templatesByCategory = getTemplatesByCategory();
  const categories = getCategories();

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      onValueChange(undefined);
    } else {
      onValueChange(templateId);
    }
  };

  const selectedTemplate = value
    ? SUBSCRIPTION_TEMPLATES.find((t) => t.id === value)
    : undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id || "template"}>
        Start with a template{" "}
        <span className="text-muted-foreground">(optional)</span>
      </Label>
      <Select value={value || "none"} onValueChange={handleTemplateChange}>
        <SelectTrigger id={id || "template"} className="w-full">
          <SelectValue placeholder="Select a template or start from scratch">
            {selectedTemplate ? (
              <div className="flex items-center gap-2">
                {selectedTemplate.icon && (
                  <SubscriptionIcon
                    iconId={selectedTemplate.icon}
                    name={selectedTemplate.name}
                    size={16}
                  />
                )}
                <span>{selectedTemplate.name}</span>
              </div>
            ) : (
              "Start from scratch"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="none" className="font-medium">
            Start from scratch
          </SelectItem>
          <SelectSeparator />
          {categories.map((category) => {
            const templates = templatesByCategory[category] || [];
            if (templates.length === 0) return null;

            return (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {templates.map((template) => {
                  const monthlyCost =
                    template.billingCycle === "monthly"
                      ? template.cost
                      : template.cost / 12;

                  return (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {template.icon && (
                            <SubscriptionIcon
                              iconId={template.icon}
                              name={template.name}
                              size={16}
                            />
                          )}
                          <span className="truncate">{template.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatCurrency(monthlyCost, "USD")}/mo
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
      {selectedTemplate && selectedTemplate.description && (
        <p className="text-xs text-muted-foreground">
          {selectedTemplate.description}
        </p>
      )}
    </div>
  );
}
