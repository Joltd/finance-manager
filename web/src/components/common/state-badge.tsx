import React from "react";
import { CircleDashed } from "lucide-react";

export interface StateBadgeProps {
  condition: boolean
  children: React.ReactNode
}

export function StateBadge({ condition, children }: StateBadgeProps) {
  return condition ? (
    children
  ) : (
    <CircleDashed size={16} className="shrink-0 text-muted w-5" />
  )
}
