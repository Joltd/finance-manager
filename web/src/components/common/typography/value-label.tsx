import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface ValueLabelProps {
  value: number
  shorten?: boolean
}

export function ValueLabel({ value, shorten }: ValueLabelProps) {
  if (!shorten || value < 100000) {
    return <div>{formatter.format(value)}</div>
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{shortFormatter.format(value)}</div>
      </TooltipTrigger>
      <TooltipContent>
        <div>{formatter.format(value)}</div>
      </TooltipContent>
    </Tooltip>
  )
}

const formatter = new Intl.NumberFormat(undefined)

const shortFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
})

export function ValueLabelNew({ value, shorten }: ValueLabelProps) {
  return !shorten || value < 100000 ? formatter.format(value) : shortFormatter.format(value)
}
