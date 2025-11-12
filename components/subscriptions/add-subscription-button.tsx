"use client";

import AddSubscriptionDialog from "./add-subscription-dialog";

export default function AddSubscriptionButton() {
  return (
    <AddSubscriptionDialog
      onSuccess={() => {
        window.location.reload();
      }}
    />
  );
}
