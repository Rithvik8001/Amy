"use client";

import { useMemo } from "react";
import { getIconSvg } from "@/lib/icon-utils";
import { cn } from "@/lib/utils";

interface SubscriptionIconProps {
  iconId?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function SubscriptionIcon({
  iconId,
  name,
  size = 24,
  className,
}: SubscriptionIconProps) {
  const iconSvg = useMemo(() => {
    if (!iconId) return null;
    return getIconSvg(iconId, size);
  }, [iconId, size]);

  if (!iconSvg) {
    return null;
  }

  return (
    <div
      className={cn("flex-shrink-0", className)}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
      aria-label={name}
      role="img"
    />
  );
}

