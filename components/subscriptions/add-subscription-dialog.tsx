"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { IconPicker } from "./icon-picker";
import { TemplateSelector } from "./template-selector";
import { getTemplateById } from "@/lib/subscription-templates";
import { addMonths, addYears, format } from "date-fns";

type SubscriptionFormData = {
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string;
  status: "active" | "cancelled" | "paused";
  paymentMethod: string;
  icon?: string;
};

interface AddSubscriptionDialogProps {
  onSuccess: () => void;
}

export default function AddSubscriptionDialog({
  onSuccess,
}: AddSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >();
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "",
    cost: "",
    billingCycle: "monthly",
    nextBillingDate: "",
    category: "",
    status: "active",
    paymentMethod: "",
    icon: undefined,
  });

  // Calculate next billing date based on billing cycle
  const calculateNextBillingDate = (
    billingCycle: "monthly" | "yearly"
  ): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextDate: Date;
    if (billingCycle === "monthly") {
      nextDate = addMonths(today, 1);
    } else {
      nextDate = addYears(today, 1);
    }

    nextDate.setHours(0, 0, 0, 0);
    return format(nextDate, "yyyy-MM-dd");
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string | undefined) => {
    setSelectedTemplateId(templateId);

    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        const nextBillingDate = calculateNextBillingDate(template.billingCycle);

        setFormData({
          name: template.name,
          cost: template.cost.toString(),
          billingCycle: template.billingCycle,
          nextBillingDate: nextBillingDate,
          category: template.category,
          status: "active",
          paymentMethod: template.paymentMethod || "",
          icon: template.icon,
        });
      }
    } else {
      // Reset form when template is cleared
      setFormData({
        name: "",
        cost: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        status: "active",
        paymentMethod: "",
        icon: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          cost: parseFloat(formData.cost),
          billingCycle: formData.billingCycle,
          nextBillingDate: formData.nextBillingDate,
          category: formData.category || undefined,
          status: formData.status,
          paymentMethod: formData.paymentMethod || undefined,
          icon: formData.icon || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      toast.success("Subscription added successfully!");
      setOpen(false);
      setSelectedTemplateId(undefined);
      setFormData({
        name: "",
        cost: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        status: "active",
        paymentMethod: "",
        icon: undefined,
      });
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedTemplateId(undefined);
      setFormData({
        name: "",
        cost: "",
        billingCycle: "monthly",
        nextBillingDate: "",
        category: "",
        status: "active",
        paymentMethod: "",
        icon: undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
          <DialogDescription>
            Add a new subscription to track your recurring expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <TemplateSelector
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
              id="template"
            />

            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Netflix, Spotify, etc."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <IconPicker
              value={formData.icon}
              onValueChange={(value) =>
                setFormData({ ...formData, icon: value })
              }
              id="icon"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cost">
                  Cost <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billingCycle">
                  Billing Cycle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value: "monthly" | "yearly") => {
                    const newBillingCycle = value;
                    const newNextBillingDate =
                      calculateNextBillingDate(newBillingCycle);
                    setFormData({
                      ...formData,
                      billingCycle: newBillingCycle,
                      nextBillingDate: newNextBillingDate,
                    });
                  }}
                >
                  <SelectTrigger id="billingCycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nextBillingDate">
                Next Billing Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="nextBillingDate"
                value={formData.nextBillingDate}
                onChange={(date) =>
                  setFormData({ ...formData, nextBillingDate: date })
                }
                placeholder="Select billing date"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Streaming, Software, etc."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "cancelled" | "paused") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                placeholder="Credit Card, PayPal, etc."
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
