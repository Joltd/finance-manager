import { LucideIcon } from "lucide-react";

export interface CombinedIconProps {
  Main: LucideIcon
  Mark: LucideIcon
  size?: number
}

export function CombinedIcon({ Main, Mark, size = 24 }: CombinedIconProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Main size={size} />
      <Mark size={size} className="absolute bottom-0 right-0 scale-50 translate-1/4 text-background" strokeWidth="12" />
      <Mark size={size} className="absolute bottom-0 right-0 scale-50 translate-1/4" strokeWidth="4" />
    </div>
  )
}