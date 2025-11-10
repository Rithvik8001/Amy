export function isBadgeSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "setAppBadge" in navigator &&
    typeof navigator.setAppBadge === "function"
  );
}

export async function updateAppBadge(count: number): Promise<void> {
  if (!isBadgeSupported()) {
    return;
  }

  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    console.error("Error updating app badge:", error);
  }
}

export async function clearAppBadge(): Promise<void> {
  if (!isBadgeSupported()) {
    return;
  }

  try {
    await navigator.clearAppBadge();
  } catch (error) {
    console.error("Error clearing app badge:", error);
  }
}
