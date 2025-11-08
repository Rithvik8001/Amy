"use client";

import AddSubscriptionDialog from "./add-subscription-dialog";

export default function AddSubscriptionButton() {
  return (
    <AddSubscriptionDialog
      onSuccess={() => {
        // Trigger a page refresh to show new subscription
        window.location.reload();
      }}
    />
  );
}

