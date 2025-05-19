export interface CurrencyLabelProps {
  currency: string
}

export function CurrencyLabel({ currency }: CurrencyLabelProps) {
  return (
    <div className="text-muted-foreground">{currency}</div>
  )
}