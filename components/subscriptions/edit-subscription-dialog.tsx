"use client";

import { useState, useEffect } from "react";
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
import { Pencil } from "lucide-react";
import { toast } from "sonner";

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

type SubscriptionFormData = {
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string;
  status: "active" | "cancelled" | "paused";
  paymentMethod: string;
};

interface EditSubscriptionDialogProps {
  subscription: Subscription;
  onSuccess: () => void;
}

export default function EditSubscriptionDialog({
  subscription,
  onSuccess,
}: EditSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: subscription.name,
    cost: subscription.cost,
    billingCycle: subscription.billingCycle,
    nextBillingDate: subscription.nextBillingDate,
    category: subscription.category || "",
    status: subscription.status,
    paymentMethod: subscription.paymentMethod || "",
  });

  useEffect(() => {
    if (open) {
      // Normalize date format for HTML date input (YYYY-MM-DD)
      const normalizeDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        // Extract YYYY-MM-DD from date string (handles both date and datetime formats)
        return dateStr.split('T')[0];
      };

      setFormData({
        name: subscription.name,
        cost: subscription.cost,
        billingCycle: subscription.billingCycle,
        nextBillingDate: normalizeDateForInput(subscription.nextBillingDate),
        category: subscription.category || "",
        status: subscription.status,
        paymentMethod: subscription.paymentMethod || "",
      });
    }
  }, [subscription, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatePayload: Record<string, unknown> = {};
      
      // Normalize date for comparison
      const normalizeDate = (dateStr: string) => {
        // Extract YYYY-MM-DD from date string (handles both date and datetime formats)
        return dateStr.split('T')[0];
      };

      if (formData.name !== subscription.name) updatePayload.name = formData.name;
      if (parseFloat(formData.cost) !== parseFloat(subscription.cost))
        updatePayload.cost = parseFloat(formData.cost);
      if (formData.billingCycle !== subscription.billingCycle)
        updatePayload.billingCycle = formData.billingCycle;
      if (normalizeDate(formData.nextBillingDate) !== normalizeDate(subscription.nextBillingDate))
        updatePayload.nextBillingDate = formData.nextBillingDate;
      if (formData.category !== (subscription.category || ""))
        updatePayload.category = formData.category || undefined;
      if (formData.status !== subscription.status)
        updatePayload.status = formData.status;
      if (formData.paymentMethod !== (subscription.paymentMethod || ""))
        updatePayload.paymentMethod = formData.paymentMethod || undefined;

      // If no changes, show message and return
      if (Object.keys(updatePayload).length === 0) {
        toast.info("No changes detected");
        setOpen(false);
        return;
      }

      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update subscription");
      }

      toast.success("Subscription updated successfully!");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update the subscription details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Netflix, Spotify, etc."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cost">
                  Cost <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-cost"
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
                <Label htmlFor="edit-billingCycle">
                  Billing Cycle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value: "monthly" | "yearly") =>
                    setFormData({ ...formData, billingCycle: value })
                  }
                >
                  <SelectTrigger id="edit-billingCycle">
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
              <Label htmlFor="edit-nextBillingDate">
                Next Billing Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="edit-nextBillingDate"
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
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="Streaming, Software, etc."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "active" | "cancelled" | "paused"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status">
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
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
              <Input
                id="edit-paymentMethod"
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
              {loading ? "Updating..." : "Update Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

