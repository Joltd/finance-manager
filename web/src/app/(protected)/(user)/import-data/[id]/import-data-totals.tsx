import { Flow } from '@/components/common/layout/flow'
import { Stack } from '@/components/common/layout/stack'
import { AmountLabel } from '@/components/common/typography/amount-label'
import { Typography } from '@/components/common/typography/typography'
import { add, Amount } from '@/types/common/amount'
import { ImportDataTotal } from '@/types/import-data'

export function ImportDataAmounts({ amounts }: { amounts: Amount[] }) {
  return (
    <Flow align="center" gap={1} className="justify-end">
      {amounts.map((amount) => (
        <AmountLabel key={amount.currency} amount={amount} />
      ))}
    </Flow>
  )
}

export function ImportDataFooter({ totals }: { totals: ImportDataTotal[] }) {
  if (!totals.length) return null

  return (
    <Stack orientation="horizontal" align="center" justify="between" gap={3} className="shrink-0">
      <Typography variant="large">Total</Typography>
      <ImportDataAmounts amounts={totals.map((total) => add(total.balance, total.parsed))} />
    </Stack>
  )
}

export function ImportDataDayTotals({ totals }: { totals: ImportDataTotal[] }) {
  if (!totals.length) return null

  return (
    <Stack
      orientation="horizontal"
      align="center"
      justify="between"
      gap={3}
      className="pt-1 pb-3"
    >
      <Typography as="span" variant="small">
        Total
      </Typography>
      <ImportDataAmounts amounts={totals.map((total) => total.parsed)} />
    </Stack>
  )
}
