import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ValueLabelProps {
  value: number
  shorten?: boolean
}

export function ValueLabel({ value, shorten }: ValueLabelProps) {
  if (!shorten || value < 1000) {
    return <div>{value}</div>
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{formatter.format(value)}</div>
      </TooltipTrigger>
      <TooltipContent>
        <div>value</div>
      </TooltipContent>
    </Tooltip>
  )
}

const formatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
})